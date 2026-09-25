export type StageId = "detect" | "correlate" | "diagnose" | "assign" | "repair" | "validate" | "close" | "e2e";
export type Rag = "green" | "amber" | "red" | "neutral";
export type RowId = "performance" | "ai" | "efficiency";

export type StageInput = {
  baselineMinutes: number;
  baselineManualHours: number;
  automation: number;
  aiConfidence: number;
  improvement: number;
  targetMinutes: number;
};

export type Scenario = {
  id: string;
  label: string;
  description: string;
  annualParentIncidents: number;
  p1p2Rate: number;
  parentIncidentReduction: number;
  slaAttainment: number;
  availability: number;
  labourCostPerFte: number;
  workingHoursPerFte: number;
  stages: Record<Exclude<StageId, "e2e">, StageInput>;
};

export type StageMetrics = {
  id: StageId;
  timeMinutes: number;
  automation: number;
  aiConfidence: number;
  manualHours: number;
  hoursReleased: number;
  health: number;
  rag: Rag;
  trendPercent: number;
};

export type ExecutiveMetrics = {
  parentIncidents: number;
  p1p2Incidents: number;
  mttrMinutes: number;
  slaAttainment: number;
  availability: number;
  lifecycleAutomation: number;
  capacityReleasedFte: number;
  annualValue: number;
  health: number;
};

export type CalculationResult = {
  stages: Record<StageId, StageMetrics>;
  executive: ExecutiveMetrics;
};

const stageIds: Exclude<StageId, "e2e">[] = ["detect", "correlate", "diagnose", "assign", "repair", "validate", "close"];

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value: number, decimals = 1) => Number(value.toFixed(decimals));

export function ragForScore(score: number): Rag {
  if (score >= 82) return "green";
  if (score >= 70) return "amber";
  return "red";
}

function calculateStage(id: Exclude<StageId, "e2e">, input: StageInput): StageMetrics {
  const timeMinutes = input.baselineMinutes * (1 - input.improvement);
  const manualHours = input.baselineManualHours * (1 - input.automation);
  const hoursReleased = input.baselineManualHours - manualHours;
  const targetScore = clamp((input.targetMinutes / Math.max(timeMinutes, 0.1)) * 82);
  const health = clamp(
    input.automation * 30 +
    input.aiConfidence * 25 +
    input.improvement * 20 +
    (hoursReleased / Math.max(input.baselineManualHours, 0.1)) * 15 +
    (targetScore / 100) * 10
  );

  return {
    id,
    timeMinutes: round(timeMinutes),
    automation: round(input.automation * 100, 0),
    aiConfidence: round(input.aiConfidence * 100, 0),
    manualHours: round(manualHours),
    hoursReleased: round(hoursReleased),
    health: round(health, 0),
    rag: ragForScore(health),
    trendPercent: round(input.improvement * 100, 0)
  };
}

export function calculateScenario(scenario: Scenario): CalculationResult {
  const calculated = Object.fromEntries(
    stageIds.map(id => [id, calculateStage(id, scenario.stages[id])])
  ) as Record<Exclude<StageId, "e2e">, StageMetrics>;

  const mttrMinutes = calculated.detect.timeMinutes + calculated.correlate.timeMinutes + calculated.diagnose.timeMinutes + calculated.assign.timeMinutes + calculated.repair.timeMinutes + calculated.validate.timeMinutes;
  const weightedAutomation = stageIds.reduce((sum, id) => sum + calculated[id].automation, 0) / stageIds.length;
  const manualHours = stageIds.reduce((sum, id) => sum + calculated[id].manualHours, 0);
  const baselineHours = stageIds.reduce((sum, id) => sum + scenario.stages[id].baselineManualHours, 0);
  const hoursReleasedPerIncident = Math.max(0, baselineHours - manualHours);
  const annualHoursReleased = scenario.annualParentIncidents * hoursReleasedPerIncident;
  const capacityReleasedFte = annualHoursReleased / scenario.workingHoursPerFte;
  const annualValue = capacityReleasedFte * scenario.labourCostPerFte;
  const health = stageIds.reduce((sum, id) => sum + calculated[id].health, 0) / stageIds.length;

  const e2e: StageMetrics = {
    id: "e2e",
    timeMinutes: round(mttrMinutes),
    automation: round(weightedAutomation, 0),
    aiConfidence: round(stageIds.reduce((sum, id) => sum + calculated[id].aiConfidence, 0) / stageIds.length, 0),
    manualHours: round(manualHours),
    hoursReleased: round(hoursReleasedPerIncident),
    health: round(health, 0),
    rag: ragForScore(health),
    trendPercent: round(stageIds.reduce((sum, id) => sum + calculated[id].trendPercent, 0) / stageIds.length, 0)
  };

  const parentIncidents = Math.round(scenario.annualParentIncidents * (1 - scenario.parentIncidentReduction));
  const executive: ExecutiveMetrics = {
    parentIncidents,
    p1p2Incidents: Math.round(parentIncidents * scenario.p1p2Rate),
    mttrMinutes: e2e.timeMinutes,
    slaAttainment: scenario.slaAttainment,
    availability: scenario.availability,
    lifecycleAutomation: e2e.automation,
    capacityReleasedFte: round(capacityReleasedFte),
    annualValue: Math.round(annualValue),
    health: e2e.health
  };

  return {stages: {...calculated, e2e}, executive};
}
