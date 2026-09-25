import type {Scenario} from "../lib/calculationEngine";

const baselineStages = {
  detect: {baselineMinutes: 5.2, baselineManualHours: 0.9, automation: 0.22, aiConfidence: 0.68, improvement: 0, targetMinutes: 4},
  correlate: {baselineMinutes: 4.7, baselineManualHours: 0.7, automation: 0.18, aiConfidence: 0.64, improvement: 0, targetMinutes: 2},
  diagnose: {baselineMinutes: 13.4, baselineManualHours: 2.6, automation: 0.12, aiConfidence: 0.61, improvement: 0, targetMinutes: 7},
  assign: {baselineMinutes: 3.1, baselineManualHours: 0.6, automation: 0.30, aiConfidence: 0.72, improvement: 0, targetMinutes: 1.5},
  repair: {baselineMinutes: 18.9, baselineManualHours: 3.2, automation: 0.08, aiConfidence: 0.58, improvement: 0, targetMinutes: 12},
  validate: {baselineMinutes: 5.8, baselineManualHours: 0.8, automation: 0.20, aiConfidence: 0.66, improvement: 0, targetMinutes: 3},
  close: {baselineMinutes: 8.4, baselineManualHours: 0.6, automation: 0.25, aiConfidence: 0.70, improvement: 0, targetMinutes: 4}
} as const;

const stage = (id: keyof typeof baselineStages, automation: number, confidence: number, improvement: number) => ({
  ...baselineStages[id], automation, aiConfidence: confidence, improvement
});

export const SCENARIOS: Scenario[] = [
  {
    id: "baseline", label: "Baseline Operations", description: "Current manual operating model before scaled AI adoption.",
    annualParentIncidents: 2860, p1p2Rate: 0.041, parentIncidentReduction: 0, slaAttainment: 99.42, availability: 99.72,
    labourCostPerFte: 30000, workingHoursPerFte: 1650,
    stages: {...baselineStages}
  },
  {
    id: "pilot", label: "AI Pilot", description: "Focused adoption in detection, correlation and diagnosis.",
    annualParentIncidents: 2860, p1p2Rate: 0.039, parentIncidentReduction: 0.05, slaAttainment: 99.61, availability: 99.78,
    labourCostPerFte: 30000, workingHoursPerFte: 1650,
    stages: {
      detect: stage("detect", .52, .78, .12), correlate: stage("correlate", .61, .84, .22), diagnose: stage("diagnose", .38, .79, .15),
      assign: stage("assign", .48, .82, .18), repair: stage("repair", .22, .69, .08), validate: stage("validate", .42, .77, .11), close: stage("close", .45, .80, .13)
    }
  },
  {
    id: "year1", label: "Year 1", description: "Scaled AI assistance with controlled closed-loop automation.",
    annualParentIncidents: 2860, p1p2Rate: 0.036, parentIncidentReduction: 0.11, slaAttainment: 99.78, availability: 99.84,
    labourCostPerFte: 30000, workingHoursPerFte: 1650,
    stages: {
      detect: stage("detect", .82, .88, .27), correlate: stage("correlate", .88, .94, .43), diagnose: stage("diagnose", .66, .89, .39),
      assign: stage("assign", .91, .97, .58), repair: stage("repair", .58, .83, .22), validate: stage("validate", .78, .91, .33), close: stage("close", .86, .95, .27)
    }
  },
  {
    id: "year2", label: "Year 2", description: "Broader autonomous operations with mature governance and playbooks.",
    annualParentIncidents: 2860, p1p2Rate: 0.032, parentIncidentReduction: 0.18, slaAttainment: 99.88, availability: 99.90,
    labourCostPerFte: 30000, workingHoursPerFte: 1650,
    stages: {
      detect: stage("detect", .90, .93, .38), correlate: stage("correlate", .94, .97, .57), diagnose: stage("diagnose", .78, .93, .51),
      assign: stage("assign", .96, .98, .67), repair: stage("repair", .71, .89, .38), validate: stage("validate", .88, .95, .47), close: stage("close", .93, .97, .42)
    }
  },
  {
    id: "target", label: "Target Operating Model", description: "Optimised AI-led lifecycle with human control for exceptions and risk.",
    annualParentIncidents: 2860, p1p2Rate: 0.028, parentIncidentReduction: 0.25, slaAttainment: 99.94, availability: 99.95,
    labourCostPerFte: 30000, workingHoursPerFte: 1650,
    stages: {
      detect: stage("detect", .95, .96, .48), correlate: stage("correlate", .97, .98, .66), diagnose: stage("diagnose", .87, .96, .62),
      assign: stage("assign", .98, .99, .74), repair: stage("repair", .82, .94, .52), validate: stage("validate", .94, .97, .59), close: stage("close", .97, .98, .55)
    }
  }
];
