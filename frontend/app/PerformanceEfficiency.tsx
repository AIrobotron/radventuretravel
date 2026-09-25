"use client";

import {useEffect, useMemo, useState} from "react";
import {calculateScenario, ragForScore, type Rag, type RowId, type StageId} from "./lib/calculationEngine";
import {SCENARIOS} from "./data-model/scenarios";
import AIWorkforce from "./AIWorkforce";
import ContinuousImprovementStudio from "./ContinuousImprovementStudio";

type Scope = "customer" | "portfolio";
type Persona = "operations" | "head" | "executive";
type Period = "7d" | "30d" | "90d";
type KpiCell = {value: string; trend: string; label: string; rag: Rag};
type StageExperience = {
  title:string; objective:string; outcome:string; useCases:string[];
  incident:{id:string;service:string;impact:string;signal:string;recommendation:string;action:string;confidence:number};
  chartLabels:string[];
};

const STAGE_LABELS: Record<StageId,string> = {
  detect:"Detect", correlate:"Correlate", diagnose:"Diagnose", assign:"Assign", repair:"Repair", validate:"Validate", close:"Close & Learn", e2e:"End-to-End"
};
const STAGE_IDS: StageId[] = ["detect","correlate","diagnose","assign","repair","validate","close","e2e"];
const ROWS: {id: RowId; label: string; question: string}[] = [
  {id:"performance",label:"Service Performance",question:"How well is the service lifecycle performing?"},
  {id:"ai",label:"AI Operations",question:"How much is AI contributing at each stage?"},
  {id:"efficiency",label:"Service Efficiency / Utilisation",question:"How efficiently are people and capacity being used?"}
];

const PERFORMANCE_LABELS: Record<StageId,string> = {
  detect:"Mean time to detect", correlate:"Time to correlated incident", diagnose:"Mean time to identify", assign:"Time to assignment", repair:"Mean time to repair", validate:"Time to validate", close:"Time to close", e2e:"End-to-end restoration"
};
const AI_LABELS: Record<StageId,string> = {
  detect:"AI proactive detection", correlate:"Correlation automation", diagnose:"AI diagnosis coverage", assign:"First-time AI routing", repair:"Closed-loop repair", validate:"AI validation coverage", close:"AI closure automation", e2e:"Lifecycle automation"
};

const EXPERIENCES: Record<StageId,StageExperience> = {
  detect:{title:"Detect",objective:"Find actionable service degradation before customers report it.",outcome:"Earlier detection protects availability and gives operations more time to intervene before customer impact grows.",useCases:["Predictive circuit degradation","Power anomaly detection","Application latency anomaly"],chartLabels:["Signals","Actionable","Proactive"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"12 French retail sites at risk",signal:"Packet loss increased from 0.3% to 3.8% on the primary underlay.",recommendation:"Create a proactive incident and begin correlated path analysis.",action:"Open enriched incident",confidence:96}},
  correlate:{title:"Correlate",objective:"Convert high-volume alarms into one enriched, actionable parent incident.",outcome:"Noise reduction keeps engineers focused on the service-impacting event rather than duplicate device alarms.",useCases:["Multi-device outage correlation","Parent/child incident enrichment","Cross-domain event correlation"],chartLabels:["Raw alarms","Suppressed","Parent incidents"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"36 alarms across 12 sites",signal:"Common timing, path and provider attributes indicate one shared carrier fault.",recommendation:"Collapse child events into one parent incident with topology and customer context.",action:"Create parent incident",confidence:98}},
  diagnose:{title:"Diagnose",objective:"Identify probable root cause and assemble the evidence required for action.",outcome:"AI-guided diagnosis shortens investigation and improves first-time resolution by presenting evidence, not just a prediction.",useCases:["WAN packet loss RCA","BGP route instability","SAP dependency diagnosis"],chartLabels:["Candidates","Evidence matched","RCA confidence"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"SAP response times degraded",signal:"Loss is isolated to the MPLS underlay between Paris DC and provider PE-17.",recommendation:"Probable root cause: provider interface errors on PE-17, confidence supported by telemetry and topology.",action:"Accept AI diagnosis",confidence:94}},
  assign:{title:"Assign",objective:"Route incidents to the correct resolver and specialist AI agents first time.",outcome:"Accurate routing reduces queue time, reassignments and fragmented ownership across service and network teams.",useCases:["Resolver-group prediction","Specialist agent invocation","Priority recommendation"],chartLabels:["Auto-routed","First-time correct","Reassigned"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"Priority 2 customer degradation",signal:"Diagnosis requires carrier management plus WAN engineering expertise.",recommendation:"Assign to Global WAN Operations and invoke the Carrier Assurance agent.",action:"Confirm resolver group",confidence:97}},
  repair:{title:"Repair",objective:"Restore service safely through recommended or closed-loop remediation.",outcome:"Automation removes repetitive recovery effort while maintaining governance for higher-risk changes.",useCases:["Firewall rule correction","SD-WAN path repair","BGP recovery"],chartLabels:["Recommended","Auto-executed","Successful"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"12 sites using degraded primary path",signal:"Secondary internet underlay is healthy and policy-compliant.",recommendation:"Move affected sites to the healthy underlay, validate loss, then raise provider repair case.",action:"Execute guarded repair",confidence:95}},
  validate:{title:"Validate",objective:"Confirm that service and customer experience have returned to normal.",outcome:"Automated technical and customer-path validation reduces premature closure and repeat incidents.",useCases:["Post-change telemetry validation","Customer-path testing","Regression detection"],chartLabels:["Checks run","Passed","Regressions"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"Customer traffic restored",signal:"Loss is below 0.2%, latency normalised and SAP synthetic transactions pass.",recommendation:"Hold for a 10-minute stability window and confirm all impacted sites remain healthy.",action:"Run validation suite",confidence:99}},
  close:{title:"Close & Learn",objective:"Complete the record, capture learning and improve future automation.",outcome:"Consistent summaries and knowledge capture convert every incident into better future detection, diagnosis and repair.",useCases:["Automated incident summary","Knowledge article creation","Playbook learning"],chartLabels:["Closed","Summarised","Knowledge reused"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"No remaining customer impact",signal:"Repair and validation evidence is complete; provider fault remains tracked separately.",recommendation:"Close the customer incident, publish the resolution summary and update the failover playbook.",action:"Complete and learn",confidence:98}},
  e2e:{title:"End-to-End",objective:"Measure the complete operational outcome from first signal to restored and learned service.",outcome:"A shared lifecycle view aligns executives, operations and engineers around customer restoration, automation and released capacity.",useCases:["Autonomous incident lifecycle","Cross-domain service assurance","Predict-and-prevent operations"],chartLabels:["Baseline time","Current time","Target time"],incident:{id:"INC0018427",service:"Global SD-WAN",impact:"12 sites protected from prolonged degradation",signal:"One enriched incident progressed from proactive detection to validated restoration.",recommendation:"Review the end-to-end evidence trail and approve the pattern for expanded closed-loop use.",action:"Open lifecycle record",confidence:97}}
};

const number = new Intl.NumberFormat("en-GB");
const money = new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0});

export default function PerformanceEfficiency(){
  const [workspace,setWorkspace]=useState<"main"|"ai"|"improvement">("main");
  const [scope,setScope]=useState<Scope>("customer");
  const [persona,setPersona]=useState<Persona>("operations");
  const [period,setPeriod]=useState<Period>("30d");
  const [scenarioId,setScenarioId]=useState("year1");
  const [selectedStage,setSelectedStage]=useState<StageId>("e2e");
  const [selectedRow,setSelectedRow]=useState<RowId>("performance");
  const [selectedUseCase,setSelectedUseCase]=useState(0);
  const [operationsView,setOperationsView]=useState<"desk"|"ai"|"resource">("desk");
  const [visibleTrends,setVisibleTrends]=useState<string[]>(["Open incidents"]);
  const [guidedMode,setGuidedMode]=useState(false);
  const [guidedPlaying,setGuidedPlaying]=useState(false);
  const [guidedStage,setGuidedStage]=useState(0);

  const guidedStages = [
    {label:"Incident",title:"SAP performance degradation detected",detail:"Packet loss rises across 12 French sites. A single enriched parent incident is created.",view:"desk"},
    {label:"Correlation",title:"AI correlates the service impact",detail:"36 device alarms are grouped into one SD-WAN service incident with 98% confidence.",view:"ai"},
    {label:"Diagnosis",title:"Probable WAN congestion identified",detail:"The Diagnosis Agent recommends moving SAP traffic to the MPLS backup path at 91% confidence.",view:"ai"},
    {label:"Repair",title:"Automated repair fails validation",detail:"Traffic is rerouted, but packet loss returns. Repair confidence falls from 91% to 41% and automation pauses.",view:"ai"},
    {label:"Engineer",title:"Engineer takes control",detail:"Investigation finds a new firewall policy is misclassifying SAP traffic. Firewall telemetry was missing from the AI evidence set.",view:"desk"},
    {label:"Learning",title:"Continuous Improvement work item created",detail:"Add firewall telemetry, extend topology relationships, retrain diagnosis and add post-repair validation.",view:"improvement"},
    {label:"Replay",title:"Improved AI resolves the replay",detail:"The AI identifies firewall policy misclassification at 96% confidence, corrects the policy and validates service automatically.",view:"ai"},
    {label:"Results",title:"Closed-loop learning complete",detail:"MTTR falls from 31 to 9 minutes, repair accuracy rises to 96% and Enterprise Autonomy increases from 68% to 69%.",view:"desk"}
  ] as const;

  useEffect(()=>{
    if(!guidedMode) return;
    const stage=guidedStages[guidedStage];
    if(stage.view==="improvement") setWorkspace("improvement");
    else { setWorkspace("main"); setOperationsView(stage.view); }
    if(guidedStage===0) setVisibleTrends(["Open incidents"]);
    if(guidedStage===3) setVisibleTrends(["MTTR"]);
    if(guidedStage===7) setVisibleTrends(["Automation rate"]);
  },[guidedMode,guidedStage]);

  useEffect(()=>{
    if(!guidedMode || !guidedPlaying) return;
    if(guidedStage>=guidedStages.length-1){ setGuidedPlaying(false); return; }
    const timer=window.setTimeout(()=>setGuidedStage(stage=>Math.min(stage+1,guidedStages.length-1)),6500);
    return ()=>window.clearTimeout(timer);
  },[guidedMode,guidedPlaying,guidedStage]);

  const startGuidedDemo=()=>{setGuidedMode(true);setGuidedStage(0);setGuidedPlaying(true)};
  const exitGuidedDemo=()=>{setGuidedMode(false);setGuidedPlaying(false);setWorkspace("main");setOperationsView("desk")};
  const guidedPanel = guidedMode ? <GuidedDemoPanel stages={guidedStages} stage={guidedStage} playing={guidedPlaying} onPlay={()=>setGuidedPlaying(true)} onPause={()=>setGuidedPlaying(false)} onStage={setGuidedStage} onRestart={()=>{setGuidedStage(0);setGuidedPlaying(true)}} onExit={exitGuidedDemo}/> : null;

  const scenario = SCENARIOS.find(x=>x.id===scenarioId) || SCENARIOS[2];
  const result = useMemo(()=>calculateScenario(scenario),[scenario]);
  const scopeFactor = scope === "portfolio" ? 34 : 1;
  const title = scope === "customer" ? "Enterprise Customer" : "International Enterprise";
  const experience = EXPERIENCES[selectedStage];
  const periodLabel = period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : "Last 90 days";

  const selectStage=(stage:StageId)=>{setSelectedStage(stage);setSelectedUseCase(0)};
  const stages = STAGE_IDS.map(id=>({id,label:STAGE_LABELS[id],score:result.stages[id].health,rag:result.stages[id].rag}));
  const executiveKpis = [
    {label:"Parent incidents",value:number.format(result.executive.parentIncidents*scopeFactor),trend:`▼ ${Math.round(scenario.parentIncidentReduction*100)}%`,target:"vs operational baseline",rag:result.executive.parentIncidents<2600*scopeFactor?"green":"amber" as Rag,stage:"detect" as StageId},
    {label:"P1 / P2 incidents",value:number.format(result.executive.p1p2Incidents*scopeFactor),trend:`${(scenario.p1p2Rate*100).toFixed(1)}% mix`,target:"Priority incident exposure",rag:result.executive.p1p2Incidents<100*scopeFactor?"green":"amber" as Rag,stage:"detect" as StageId},
    {label:"End-to-end MTTR",value:`${result.executive.mttrMinutes} min`,trend:`▼ ${result.stages.e2e.trendPercent}%`,target:"Target <30 min",rag:result.executive.mttrMinutes<30?"green":result.executive.mttrMinutes<40?"amber":"red",stage:"e2e" as StageId},
    {label:"SLA attainment",value:`${result.executive.slaAttainment.toFixed(2)}%`,trend:"scenario calculated",target:"Target 99.90%",rag:result.executive.slaAttainment>=99.9?"green":"amber",stage:"e2e" as StageId},
    {label:"Lifecycle automation",value:`${result.executive.lifecycleAutomation}%`,trend:`▲ ${result.executive.lifecycleAutomation}%`,target:"Target 70%",rag:result.executive.lifecycleAutomation>=70?"green":"amber",stage:"repair" as StageId},
    {label:"Capacity released",value:`${(result.executive.capacityReleasedFte*scopeFactor).toFixed(1)} FTE`,trend:"derived from effort",target:"Annualised capacity",rag:result.executive.capacityReleasedFte>=10?"green":"amber",stage:"e2e" as StageId},
    {label:"Annual run-rate value",value:money.format(result.executive.annualValue*scopeFactor),trend:"capacity value",target:`${money.format(scenario.labourCostPerFte)} per FTE`,rag:result.executive.annualValue>300000?"green":"amber",stage:"e2e" as StageId},
    {label:"AI operations health",value:`${result.executive.health} / 100`,trend:"weighted stage score",target:"Target 85",rag:ragForScore(result.executive.health),stage:"e2e" as StageId}
  ];

  const matrix = useMemo(()=>{
    const output = {} as Record<RowId,Record<StageId,KpiCell>>;
    output.performance = {} as Record<StageId,KpiCell>;
    output.ai = {} as Record<StageId,KpiCell>;
    output.efficiency = {} as Record<StageId,KpiCell>;
    STAGE_IDS.forEach(id=>{
      const metric=result.stages[id];
      output.performance[id]={value:`${metric.timeMinutes} min`,trend:`▼ ${metric.trendPercent}%`,label:PERFORMANCE_LABELS[id],rag:metric.rag};
      output.ai[id]={value:`${metric.automation}%`,trend:`${metric.aiConfidence}% confidence`,label:AI_LABELS[id],rag:ragForScore(metric.automation)};
      output.efficiency[id]={value:`${metric.manualHours} h`,trend:`▼ ${metric.hoursReleased} h`,label:id==="e2e"?"Manual engineering hours":"Manual effort / incident",rag:metric.manualHours<=1?"green":metric.manualHours<=2?"amber":"red"};
    });
    return output;
  },[result]);

  const selectedCell = matrix[selectedRow][selectedStage];
  const selectedMetric=result.stages[selectedStage];
  const chartValues=[
    Math.max(18,Math.min(100,selectedMetric.timeMinutes*2.2)),
    Math.max(14,Math.min(100,selectedMetric.automation)),
    Math.max(8,Math.min(100,selectedMetric.aiConfidence))
  ];
  const performanceText=`${PERFORMANCE_LABELS[selectedStage]} is ${selectedMetric.timeMinutes} minutes, a ${selectedMetric.trendPercent}% improvement versus baseline.`;
  const aiText=`AI automation is ${selectedMetric.automation}% with ${selectedMetric.aiConfidence}% model confidence in the ${STAGE_LABELS[selectedStage]} stage.`;
  const efficiencyText=`Manual effort is ${selectedMetric.manualHours} hours per parent incident, releasing ${selectedMetric.hoursReleased} hours of engineering capacity.`;
  const summary=`${STAGE_LABELS[selectedStage]} health is ${selectedMetric.health}/100. The ${scenario.label} scenario delivers ${selectedMetric.trendPercent}% faster performance, ${selectedMetric.automation}% automation and releases ${selectedMetric.hoursReleased} engineering hours per parent incident.`;

  if(workspace==="ai") return <><div className="pw-root"><button className="studio-back" onClick={()=>setWorkspace("main")}>← Back to AI Operations</button><AIWorkforce/></div>{guidedPanel}</>;
  if(workspace==="improvement") return <><ContinuousImprovementStudio onBack={()=>setWorkspace("main")}/>{guidedPanel}</>;

  return <div className="pw-root">
    <section className="panel pw-header">
      <div><div className="eyebrow">AI OPERATIONS PERFORMANCE WORKSPACE · v7.2</div><h2>{title}</h2><p>Interactive lifecycle console linking performance, AI contribution, live incident context and engineering outcomes.</p></div>
      <div className="pw-context">
        <button className="guided-launch" onClick={startGuidedDemo}>▶ AI Learning Journey</button>
        <Select label="Scope" value={scope} onChange={v=>setScope(v as Scope)} options={[["customer","Enterprise Customer"],["portfolio","International Enterprise"]]}/>
        <Select label="Scenario" value={scenarioId} onChange={setScenarioId} options={SCENARIOS.map(x=>[x.id,x.label])}/>
        <Select label="Persona" value={persona} onChange={v=>setPersona(v as Persona)} options={[["operations","Operations"],["head","Head of Operations"],["executive","Executive"]]}/>
        <Select label="Period" value={period} onChange={v=>setPeriod(v as Period)} options={[["7d","Last 7 days"],["30d","Last 30 days"],["90d","Last 90 days"]]}/>
      </div>
    </section>

    <section className="panel pw-scenario-note"><div><b>{scenario.label}</b><span>{scenario.description}</span></div><small>All KPIs and drill-down content remain synchronised to this scenario.</small></section>

    <section className="panel ops-persona-shell supervisor-console-shell">
      <div className="supervisor-console-head">
        <div><div className="eyebrow">AI CONTROL CENTRE</div><h3>Supervisor Console</h3><p>Run the service, supervise AI operations and continuously optimise the mix of automation, models and specialist expertise.</p></div>
        <div className="supervisor-console-status"><i/> LIVE · configured operations view</div>
      </div>
      <div className="supervisor-console-layout">
        <nav className="supervisor-side-nav" aria-label="Supervisor Console sections">
          <button className={operationsView==="desk"?"selected":""} onClick={()=>setOperationsView("desk")}>
            <span>A</span><div><b>Customer & Service KPIs</b><small>Service performance and customer experience</small></div>
          </button>
          <button className={operationsView==="ai"?"selected":""} onClick={()=>setOperationsView("ai")}>
            <span>B</span><div><b>AI Operations Performance</b><small>Agents, automation and autonomy</small></div>
          </button>
          <button className={operationsView==="resource"?"selected":""} onClick={()=>setOperationsView("resource")}>
            <span>C</span><div><b>Resource Optimisation</b><small>AI cost, utilisation and specialist capacity</small></div>
          </button>
          <div className="supervisor-nav-note"><b>Operating principle</b><p>Shift work left to the lowest-cost resource that can deliver the required outcome safely and accurately.</p></div>
        </nav>
        <div className="supervisor-console-content">
          {operationsView==="desk" && <DeskSupervisor visible={visibleTrends} setVisible={setVisibleTrends}/>}
          {operationsView==="ai" && <AiControlTower onOpenImprovement={()=>setWorkspace("improvement")}/>}
          {operationsView==="resource" && <ResourceOptimisation onOpenImprovement={()=>setWorkspace("improvement")}/>}
        </div>
      </div>
    </section>

    <div className="ops-advanced-divider"><span>Advanced lifecycle analysis</span></div>

    <section className="pw-kpi-ribbon" aria-label="End-to-end KPI summary">
      {executiveKpis.map(kpi=><button key={kpi.label} className={`panel pw-kpi pw-rag-${kpi.rag}`} onClick={()=>selectStage(kpi.stage)}><span>{kpi.value}</span><b>{kpi.label}</b><small className="pw-trend">{kpi.trend}</small><em>{kpi.target}</em></button>)}
    </section>

    <section className="panel pw-stage-section">
      <div className="pw-section-title"><div><div className="eyebrow">INCIDENT LIFECYCLE</div><h3>Choose a stage to transform the operations workspace</h3></div><span>{periodLabel} · {scenario.label}</span></div>
      <div className="pw-stage-ribbon">{stages.map(stage=><button key={stage.id} className={`pw-stage pw-rag-${stage.rag} ${selectedStage===stage.id?"selected":""}`} onClick={()=>selectStage(stage.id)}><span>{stage.label}</span><strong>{stage.score}</strong><small>health score</small></button>)}</div>
    </section>

    <section className="panel pw-matrix-panel">
      <div className="pw-section-title"><div><div className="eyebrow">LIFECYCLE KPI MATRIX</div><h3>Scenario-driven operational measures</h3></div><span>Select any cell for a focused KPI view</span></div>
      <div className="pw-matrix-scroll"><div className="pw-matrix">
        <div className="pw-matrix-corner">KPI category</div>
        {stages.map(stage=><button className={`pw-matrix-heading ${selectedStage===stage.id?"selected":""}`} key={stage.id} onClick={()=>selectStage(stage.id)}>{stage.label}</button>)}
        {ROWS.map(row=><div className="pw-matrix-row" key={row.id}>
          <button className={`pw-row-label ${selectedRow===row.id?"selected":""}`} onClick={()=>setSelectedRow(row.id)}><b>{row.label}</b><span>{row.question}</span></button>
          {stages.map(stage=>{const cell=matrix[row.id][stage.id];return <button key={`${row.id}-${stage.id}`} className={`pw-cell pw-rag-${cell.rag} ${selectedStage===stage.id&&selectedRow===row.id?"selected":""}`} onClick={()=>{selectStage(stage.id);setSelectedRow(row.id)}}><strong>{cell.value}</strong><span>{cell.label}</span><small>{cell.trend}</small></button>})}
        </div>)}
      </div></div>
    </section>

    <section className="panel pw-command-workspace">
      <div className="pw-command-head"><div><div className="eyebrow">INTERACTIVE OPERATIONS WORKSPACE</div><h3>{experience.title}</h3><p>{experience.objective}</p></div><div className={`pw-detail-score pw-rag-${selectedMetric.rag}`}><strong>{selectedMetric.health}</strong><span>stage health</span></div></div>
      <div className="pw-command-grid">
        <div className="pw-command-left">
          <div className="pw-summary-callout"><span>AI operational summary</span><strong>{summary}</strong><p>{experience.outcome}</p></div>
          <div className="pw-detail-cards">
            <DetailCard title="Service Performance" text={performanceText} active={selectedRow==="performance"} onClick={()=>setSelectedRow("performance")}/>
            <DetailCard title="AI Operations" text={aiText} active={selectedRow==="ai"} onClick={()=>setSelectedRow("ai")}/>
            <DetailCard title="Service Efficiency / Utilisation" text={efficiencyText} active={selectedRow==="efficiency"} onClick={()=>setSelectedRow("efficiency")}/>
          </div>
          <div className="pw-selected-kpi"><span>Selected KPI</span><strong>{selectedCell.value}</strong><b>{selectedCell.label}</b><small>{selectedCell.trend}</small></div>
          <div className="pw-chart-card"><div><b>{experience.title} operating profile</b><span>Live scenario comparison</span></div><div className="pw-bars">{experience.chartLabels.map((label,i)=><div className="pw-bar-row" key={label}><span>{label}</span><div><i style={{width:`${chartValues[i]}%`}}/></div><strong>{Math.round(chartValues[i])}</strong></div>)}</div></div>
        </div>

        <aside className="pw-live-card">
          <div className="pw-live-title"><div><span className="pw-live-dot"/> LIVE INCIDENT CONTEXT</div><b>{experience.incident.id}</b></div>
          <h4>{experience.incident.service}</h4><p className="pw-impact">{experience.incident.impact}</p>
          <dl><div><dt>AI evidence</dt><dd>{experience.incident.signal}</dd></div><div><dt>Recommendation</dt><dd>{experience.incident.recommendation}</dd></div></dl>
          <div className="pw-confidence"><span>AI confidence</span><b>{experience.incident.confidence}%</b><div><i style={{width:`${experience.incident.confidence}%`}}/></div></div>
          <button className="pw-primary-action">{experience.incident.action}</button><button className="pw-secondary-action">Open full ServiceNow workbench</button>
        </aside>
      </div>
    </section>

    <section className="pw-detail-grid">
      <article className="panel pw-usecase-panel"><div className="pw-section-title"><div><div className="eyebrow">CONNECTED AI CAPABILITIES</div><h3>Relevant use cases for {experience.title}</h3></div><span>Selection updates the capability preview</span></div>
        <div className="pw-usecase-grid">{experience.useCases.map((x,i)=><button key={x} className={selectedUseCase===i?"selected":""} onClick={()=>setSelectedUseCase(i)}><i>{String(i+1).padStart(2,"0")}</i><span>{x}</span><b>{selectedUseCase===i?"Selected":"Explore"} →</b></button>)}</div>
      </article>
      <aside className="panel pw-capability-preview"><div className="eyebrow">CAPABILITY PREVIEW</div><h3>{experience.useCases[selectedUseCase]}</h3><p>This capability contributes directly to the {experience.title.toLowerCase()} stage and is measured through the same scenario engine.</p><div><span>Automation contribution</span><b>{Math.max(12,selectedMetric.automation-selectedUseCase*4)}%</b></div><div><span>Model confidence</span><b>{Math.max(70,selectedMetric.aiConfidence-selectedUseCase*2)}%</b></div><div><span>Engineering hours released</span><b>{Math.max(.1,selectedMetric.hoursReleased-(selectedUseCase*.2)).toFixed(1)} h</b></div></aside>
    </section>
    {guidedPanel}
  </div>;
}


type GuidedStage = {label:string;title:string;detail:string;view:string};
function GuidedDemoPanel({stages,stage,playing,onPlay,onPause,onStage,onRestart,onExit}:{stages:readonly GuidedStage[];stage:number;playing:boolean;onPlay:()=>void;onPause:()=>void;onStage:(stage:number)=>void;onRestart:()=>void;onExit:()=>void}){
  const current=stages[stage];
  return <aside className="guided-demo-panel" aria-live="polite">
    <div className="guided-demo-head"><div><span>GUIDED DEMO · FI-07</span><b>AI Learning Journey</b></div><button onClick={onExit} aria-label="Exit guided mode">×</button></div>
    <div className="guided-progress">{stages.map((item,index)=><button key={item.label} className={`${index===stage?"active":""} ${index<stage?"complete":""}`} onClick={()=>onStage(index)}><i>{index<stage?"✓":index+1}</i><span>{item.label}</span></button>)}</div>
    <div className={`guided-story stage-${stage}`}><span>STEP {stage+1} OF {stages.length}</span><h3>{current.title}</h3><p>{current.detail}</p>
      {stage===3&&<div className="guided-alert"><b>Automation paused</b><span>Human expertise required · confidence below 60% safety threshold</span></div>}
      {stage===5&&<div className="guided-work-item"><b>CI-2048 · Improve SD-WAN repair accuracy</b><span>Repair accuracy 87% → 96% · Autonomous repairs 61% → 79%</span></div>}
      {stage===7&&<div className="guided-results"><div><b>31 → 9 min</b><span>MTTR</span></div><div><b>87 → 96%</b><span>Repair accuracy</span></div><div><b>68 → 69%</b><span>Autonomy</span></div></div>}
    </div>
    <div className="guided-controls"><button onClick={()=>onStage(Math.max(0,stage-1))} disabled={stage===0}>← Previous</button>{playing?<button className="primary" onClick={onPause}>Ⅱ Pause</button>:<button className="primary" onClick={onPlay}>▶ Play</button>}<button onClick={()=>onStage(Math.min(stages.length-1,stage+1))} disabled={stage===stages.length-1}>Next →</button><button onClick={onRestart} title="Restart">↺</button></div>
    <small>Manual navigation remains available. Select any step or exit guided mode at any time.</small>
  </aside>;
}

const DESK_TRENDS = [
  {name:"Open incidents",unit:"",decimals:0,inverse:true,actual:[158,164,151,169,162,156,160]},
  {name:"P1/P2 critical",unit:"",decimals:0,inverse:true,actual:[7,9,6,8,10,7,8]},
  {name:"Arrival rate",unit:"/hr",decimals:0,inverse:true,actual:[24,29,22,31,27,25,28]},
  {name:"MTTA",unit:" min",decimals:1,inverse:true,actual:[6.1,6.8,5.9,7.2,6.5,6.0,6.4]},
  {name:"MTTR",unit:" min",decimals:0,inverse:true,actual:[28,31,26,35,30,27,29]},
  {name:"SLA compliance",unit:"%",decimals:1,inverse:false,actual:[98.8,98.5,99.1,98.2,98.7,99.0,98.9]},
  {name:"Oldest unresolved",unit:" hr",decimals:0,inverse:true,actual:[11,14,9,16,13,10,12]},
  {name:"First-time fix",unit:"%",decimals:0,inverse:false,actual:[80,78,83,76,79,84,81]},
  {name:"Automation rate",unit:"%",decimals:0,inverse:false,actual:[61,63,62,64,60,65,64]},
  {name:"Major incident status",unit:"",decimals:0,inverse:true,actual:[1,1,0,2,1,0,1]}
];
const DAY_LABELS=["Wed","Thu","Fri","Sat","Sun","Mon","Tue"];

function niceScale(values:number[]){
  const minimum=Math.min(...values);
  const maximum=Math.max(...values);
  const spread=Math.max(maximum-minimum,Math.abs(maximum)*0.08,1);
  const rawStep=spread/4;
  const magnitude=Math.pow(10,Math.floor(Math.log10(rawStep)));
  const normalisedStep=rawStep/magnitude;
  const niceStep=(normalisedStep<=1?1:normalisedStep<=2?2:normalisedStep<=5?5:10)*magnitude;
  const min=Math.floor((minimum-niceStep*.6)/niceStep)*niceStep;
  const max=Math.ceil((maximum+niceStep*.6)/niceStep)*niceStep;
  const ticks=Array.from({length:5},(_,i)=>min+((max-min)/4)*i);
  return {min,max,ticks};
}

function formatTrendValue(value:number,decimals:number,unit:string){
  return `${value.toFixed(decimals)}${unit}`;
}

const MONTHLY_SUMMARY=[
  {label:"Incidents closed",value:"14,281",change:"▲ 8%",good:true,comparison:"13,223 last month"},
  {label:"MTTR",value:"24 min",change:"▼ 12%",good:true,comparison:"27 min last month"},
  {label:"SLA compliance",value:"99.1%",change:"▲ 0.6pp",good:true,comparison:"98.5% last month"},
  {label:"Automation",value:"63%",change:"▲ 7pp",good:true,comparison:"56% last month"},
  {label:"Customer-impacting",value:"38",change:"▼ 18%",good:true,comparison:"46 last month"}
];

function normalised(values:number[],inverse:boolean){
  const lo=Math.min(...values), hi=Math.max(...values), range=hi-lo||1;
  return values.map(v=>{const n=(v-lo)/range;return 18+(inverse?1-n:n)*64});
}
function DeskSupervisor({visible,setVisible}:{visible:string[];setVisible:(v:string[])=>void}){
  const selectedName=visible[0] || DESK_TRENDS[0].name;
  const selected=DESK_TRENDS.find(x=>x.name===selectedName) || DESK_TRENDS[0];
  const scale=niceScale(selected.actual);
  const chartTop=24;
  const chartBottom=218;
  const xStart=78;
  const xStep=108;
  const yFor=(value:number)=>chartBottom-((value-scale.min)/(scale.max-scale.min||1))*(chartBottom-chartTop);
  const points=selected.actual.map((value,index)=>`${xStart+index*xStep},${yFor(value)}`).join(" ");
  const first=selected.actual[0];
  const latest=selected.actual[selected.actual.length-1];
  const delta=latest-first;
  const percentage=first===0?0:(delta/first)*100;
  const operationalDirection=selected.inverse?-delta:delta;
  const changeLabel=Math.abs(percentage)<.05
    ? "No material seven-day change"
    : `${operationalDirection>0?"Improved":"Worsened"} ${Math.abs(percentage).toFixed(1)}% over seven days`;

  return <div className="desk-view">
    <div className="ops-view-head"><div><div className="eyebrow">REAL-TIME INCIDENT MANAGEMENT</div><h3>Desk Supervisor</h3><p>Are we in control, where is the pressure, and what needs action next?</p></div><div className="ops-live-pill"><i/> LIVE · refreshed 30 sec ago</div></div>
    <div className="monthly-banner">
      <div className="monthly-title"><span>MONTH TO DATE</span><b>Operational performance</b><small>Compared with the same point last month</small></div>
      {MONTHLY_SUMMARY.map(x=><div className="monthly-metric" key={x.label}><span>{x.label}</span><strong>{x.value}</strong><b className={x.good?"good":"bad"}>{x.change}</b><small>{x.comparison}</small></div>)}
    </div>
    <div className="desk-main-grid">
      <div className="trend-panel">
        <div className="trend-head">
          <div><b>Seven-day operational trend</b><span>Select a measure to display its actual daily values and scale</span></div>
          <small>Absolute values · one measure at a time</small>
        </div>
        <div className="trend-toggles" role="tablist" aria-label="Select operational measure">
          {DESK_TRENDS.map(x=><button type="button" role="tab" aria-selected={selected.name===x.name} key={x.name} className={selected.name===x.name?"active":""} onClick={()=>setVisible([x.name])}>{x.name}</button>)}
        </div>
        <div className="selected-trend-summary">
          <div><span>Selected measure</span><b>{selected.name}</b></div>
          <div><span>Latest</span><b>{formatTrendValue(latest,selected.decimals,selected.unit)}</b></div>
          <div><span>Seven-day range</span><b>{formatTrendValue(Math.min(...selected.actual),selected.decimals,selected.unit)}–{formatTrendValue(Math.max(...selected.actual),selected.decimals,selected.unit)}</b></div>
          <div className={operationalDirection>=0?"good":"bad"}><span>Movement</span><b>{changeLabel}</b></div>
        </div>
        <svg className="ops-line-chart" viewBox="0 0 760 280" role="img" aria-label={`${selected.name} actual values over seven days`}>
          {scale.ticks.map((tick,index)=>{
            const y=yFor(tick);
            return <g key={index}><line x1="78" y1={y} x2="726" y2={y} className="gridline"/><text x="68" y={y+4} className="axis-label" textAnchor="end">{formatTrendValue(tick,selected.decimals,selected.unit)}</text></g>
          })}
          {DAY_LABELS.map((day,index)=><text key={day} x={xStart+index*xStep} y="260" className="axis-label" textAnchor="middle">{day}</text>)}
          <g className="series series-0">
            <polyline points={points}/>
            {selected.actual.map((value,index)=>{
              const x=xStart+index*xStep;
              const y=yFor(value);
              return <g key={index}>
                <circle cx={x} cy={y} r="5"><title>{selected.name}: {formatTrendValue(value,selected.decimals,selected.unit)}</title></circle>
                <text x={x} y={y-11} className="point-value" textAnchor="middle">{formatTrendValue(value,selected.decimals,selected.unit)}</text>
              </g>
            })}
          </g>
        </svg>
      </div>
      <aside className="pressure-panel">
        <div className="panel-mini-head"><b>Lifecycle pressure</b><span>Current desk health</span></div>
        {[['Detect','green','6.4 min MTTA'],['Correlate','amber','28/hr arrival'],['Diagnose','amber','8 awaiting RCA'],['Assign','green','94% first-time'],['Repair','red','8 P1/P2 active'],['Validate','green','98% passed'],['Close','green','81% first-time fix']].map(([a,b,c])=><div className="pressure-row" key={a}><i className={b}/><span>{a}</span><b>{c}</b></div>)}
        <div className="top-cause"><span>Top cause today</span><b>WAN quality degradation</b><small>42% of new parent incidents</small></div>
      </aside>
    </div>
    <div className="incident-queue">
      <div className="panel-mini-head"><div><b>Live incident queue</b><span>Prioritised by customer impact, SLA risk and AI confidence</span></div><button>Open full queue →</button></div>
      <div className="queue-table">
        <div className="queue-row queue-head"><span>ID</span><span>Customer / service</span><span>Priority</span><span>Age</span><span>AI status</span><span>Action</span></div>
        {[["INC-10472","Enterprise Customer · Global WAN","P1","38m","Repair confidence 91%"],["INC-10468","Enterprise Customer · SAP access","P2","1h 12m","RCA validation required"],["INC-10461","Portfolio · SD-WAN","P2","2h 04m","Correlated to parent"],["INC-10458","Orion · WAN capacity","P3","3h 20m","Predicted breach risk"]].map(x=><div className="queue-row" key={x[0]}><b>{x[0]}</b><span>{x[1]}</span><span className={`priority ${x[2].toLowerCase()}`}>{x[2]}</span><span>{x[3]}</span><span>{x[4]}</span><button>Investigate</button></div>)}
      </div>
    </div>
  </div>;
}

function AiControlTower({onOpenImprovement}:{onOpenImprovement:()=>void}){
  const coverageKpis=[
    {label:"Autonomous incident coverage",value:"64%",trend:"▲ 6pp",note:"High-confidence volume operations"},
    {label:"Incidents predicted",value:"1,284",trend:"▲ 18%",note:"Before customer impact"},
    {label:"Incidents prevented",value:"742",trend:"▲ 24%",note:"Permanent fix or pre-emptive action"},
    {label:"Correlation accuracy",value:"94.1%",trend:"▲ 2.1pp",note:"Correct parent / child grouping"},
    {label:"Diagnostic accuracy",value:"91.3%",trend:"▲ 3.7pp",note:"Validated root cause"},
    {label:"Automation success",value:"98.4%",trend:"▲ 0.8pp",note:"Completed without rollback"},
    {label:"Repair-failure learning closed",value:"87%",trend:"▲ 9pp",note:"Failed repairs converted to improvements"},
    {label:"Specialist AI co-work",value:"72%",trend:"▲ 11pp",note:"Complex cases with evidence assistance"},
    {label:"Coverage growth",value:"+4.8pp",trend:"This month",note:"New incident classes safely automated"},
    {label:"Engineering value released",value:"4,860 h",trend:"▲ 21%",note:"Capacity redirected to improvement"}
  ];
  const volumeStages=[
    {label:"Predict",value:"1,284",sub:"signals",score:92},
    {label:"Prevent",value:"742",sub:"incidents",score:86},
    {label:"Auto-diagnose",value:"6,318",sub:"cases",score:91},
    {label:"Auto-repair",value:"4,904",sub:"repairs",score:98}
  ];
  const learningQueue=[
    {issue:"SD-WAN path oscillation",volume:"1,920 / yr",gap:"Correlation",confidence:"78%",action:"Train on 14 confirmed cases"},
    {issue:"Firewall policy drift",volume:"860 / yr",gap:"Repair",confidence:"74%",action:"Fix failed rollback logic"},
    {issue:"Intermittent DNS latency",volume:"2,480 / yr",gap:"Prediction",confidence:"69%",action:"Add resolver telemetry"},
    {issue:"Optical power degradation",volume:"610 / yr",gap:"Prevention",confidence:"82%",action:"Approve proactive threshold"}
  ];
  return <div className="ai-control-view">
    <div className="ops-view-head"><div><div className="eyebrow">PLAN · PREDICT · PREVENT</div><h3>AI Operations Control Tower</h3><p>Expand accurate autonomous coverage while specialists teach AI how to resolve and prevent the next class of complex incidents.</p></div><div className="ops-live-pill"><i/> 14 AI agents · 38 specialists co-working</div></div>

    <section className="autonomy-command-band">
      <div className="autonomy-score-block">
        <span>ENTERPRISE AUTONOMY</span>
        <div><strong>68%</strong><b>▲ 4.2pp this month</b></div>
        <p>Safe, governed incident demand completed or prevented without manual resolution.</p>
      </div>
      <div className="autonomy-drivers">
        <span>Growth drivers</span>
        <b>Detection <em>+2.1pp</em></b><b>Correlation <em>+1.4pp</em></b><b>Repair <em>+0.5pp</em></b>
      </div>
      <div className="autonomy-constraints">
        <span>Current constraints</span>
        <b>Firewall diagnostics</b><b>Legacy MPLS devices</b><b>Missing telemetry</b>
      </div>
      <div className="autonomy-roadmap-mini">
        {[['Current','68%'],['Next quarter','76%'],['Year end','84%'],['Target','90%']].map((x,i)=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b>{i<3&&<i>→</i>}</div>)}
      </div>
    </section>

    <div className="ai-operating-model">
      <div><span>VOLUME OPERATIONS</span><b>AI owns repeatable work</b><small>High-volume, known patterns with ≥80% validated confidence</small></div>
      <i>→</i>
      <div><span>VALUE OPERATIONS</span><b>Specialists improve the system</b><small>Novel and complex incidents become new detection, diagnosis, repair and prevention capability</small></div>
    </div>

    <div className="ai-kpi-grid ai-kpi-grid-10">{coverageKpis.map(x=><div className="ai-kpi" key={x.label}><span>{x.label}</span><strong>{x.value}</strong><b>{x.trend}</b><small>{x.note}</small></div>)}</div>

    <div className="ai-transform-grid">
      <section className="ai-volume-panel">
        <div className="panel-mini-head"><div><b>Autonomous volume operations</b><span>Current month throughput and validated decision quality</span></div><small>Confidence threshold ≥80%</small></div>
        <div className="volume-flow">{volumeStages.map((x,i)=><div className="volume-stage" key={x.label}><div className="volume-ring" style={{"--score":`${x.score*3.6}deg`} as React.CSSProperties}><span>{x.score}%</span></div><b>{x.label}</b><strong>{x.value}</strong><small>{x.sub}</small>{i<volumeStages.length-1&&<i>→</i>}</div>)}</div>
        <div className="autonomy-band"><div><span>Current autonomous coverage</span><b>64%</b></div><div className="autonomy-track"><i style={{width:"64%"}}/></div><small>Target 75% · next best opportunity: DNS and access-circuit fault families</small></div>
      </section>

      <aside className="ai-value-panel">
        <div className="panel-mini-head"><div><b>Specialist value operations</b><span>How expert effort improves tomorrow’s autonomous operation</span></div></div>
        <div className="value-loop">
          <div><b>38</b><span>complex cases under joint investigation</span></div>
          <i>→</i><div><b>17</b><span>confirmed new patterns</span></div>
          <i>→</i><div><b>9</b><span>AI / automation updates ready</span></div>
          <i>→</i><div><b>4.8pp</b><span>coverage growth this month</span></div>
        </div>
        <div className="learning-health"><span>Continuous-improvement closure</span><b>87%</b><small>Learning actions completed within 10 working days</small></div>
      </aside>
    </div>

    <AIWorkforce/>

    <section className="ai-learning-backlog">
      <div className="panel-mini-head"><div><b>AI learning and prevention backlog</b><span>Prioritised by annual volume, customer impact, confidence gap and reusable value</span></div><button onClick={onOpenImprovement}>Open improvement studio →</button></div>
      <div className="learning-table"><div className="learning-row learning-head"><span>Incident family</span><span>Annual demand</span><span>Capability gap</span><span>Current confidence</span><span>Next expert action</span></div>
        {learningQueue.map(x=><div className="learning-row" key={x.issue}><span><strong>{x.issue}</strong></span><span>{x.volume}</span><span><b className="gap-chip">{x.gap}</b></span><span>{x.confidence}</span><span><button>{x.action}</button></span></div>)}
      </div>
    </section>

    <div className="ai-control-bottom"><div className="ai-reasoning"><span>Improvement funnel this month</span><div><b>126</b><small>candidates</small><i>→</i><b>43</b><small>validated patterns</small><i>→</i><b>18</b><small>trained changes</small><i>→</i><b>9</b><small>deployed skills</small></div></div><div className="ai-trust"><span>Safe autonomous coverage</span><strong>64%</strong><small>98.4% success · 0.3% rollback · 100% governed</small></div></div>
  </div>
}

function ResourceOptimisation({onOpenImprovement}:{onOpenImprovement:()=>void}){
  const [service,setService]=useState("all");
  const [period,setResourcePeriod]=useState("30d");
  const [selectedResource,setSelectedResource]=useState("AI Agents / LLM");
  const [opportunities,setOpportunities]=useState([
    {id:"OPT-2048",family:"DNS resolver latency",volume:"2,480 / yr",route:"AI Agent → ML + rule",saving:"£186k",confidence:91,status:"Review"},
    {id:"OPT-2051",family:"SD-WAN path oscillation",volume:"1,920 / yr",route:"Specialist → Automation",saving:"£322k",confidence:88,status:"Review"},
    {id:"OPT-2054",family:"Firewall policy drift",volume:"860 / yr",route:"Premium LLM → Runbook",saving:"£148k",confidence:84,status:"Review"},
    {id:"OPT-2057",family:"Access circuit flaps",volume:"3,140 / yr",route:"Agent → Deterministic",saving:"£274k",confidence:94,status:"Review"}
  ]);
  const factor=service==="all" ? 1 : service==="wan" ? 0.46 : service==="cloud" ? 0.31 : 0.23;
  const periodFactor=period==="7d" ? 0.24 : period==="90d" ? 2.85 : 1;
  const resources=[
    {name:"Rules / Deterministic",mix:41,usage:"1.28M decisions",unit:"£0.0001",cost:128,focus:"Increase rule coverage",tone:"green"},
    {name:"Automation / Runbooks",mix:29,usage:"912K executions",unit:"£0.0020",cost:1824,focus:"Expand runbook library",tone:"blue"},
    {name:"ML Models",mix:15,usage:"468K inferences",unit:"£0.0100",cost:4680,focus:"Improve model accuracy",tone:"indigo"},
    {name:"AI Agents / LLM",mix:10,usage:"312K invocations",unit:"£0.0800",cost:24960,focus:"Reduce unnecessary premium use",tone:"purple"},
    {name:"Human Specialists",mix:5,usage:"1.32K cases",unit:"£45.00",cost:59400,focus:"Convert repeat fixes to AI / automation",tone:"orange"}
  ];
  const totalCost=Math.round(resources.reduce((a,r)=>a+r.cost,0)*factor*periodFactor);
  const selected=resources.find(r=>r.name===selectedResource) || resources[3];
  const updateOpportunity=(id:string,status:string)=>setOpportunities(items=>items.map(x=>x.id===id?{...x,status}:x));
  const costSeries=[112,118,116,123,126,121,129,132,128,136,139,133,141,145,142,147,151,149,154,158,152,156,161,159,164,168,165,170,173,169];
  const autonomySeries=[66,66,67,67,68,68,68,69,69,69,70,70,70,71,71,71,71,72,72,72,72,73,73,73,73,74,74,74,74,74];
  const x=(i:number)=>26+i*16.1; const yCost=(v:number)=>160-(v-100)*1.65; const yAuto=(v:number)=>160-(v-60)*6.2;
  return <div className="resource-optimisation-view">
    <div className="ops-view-head resource-view-head"><div><div className="eyebrow">OPERATE AI ECONOMICALLY AT SCALE</div><h3>Resource Optimisation</h3><p>Continuously route work to the lowest-cost resource that can deliver the required outcome while increasing safe autonomy coverage.</p></div><div className="resource-filters"><label><span>Service</span><select value={service} onChange={e=>setService(e.target.value)}><option value="all">All services</option><option value="wan">Network & WAN</option><option value="cloud">Cloud & platform</option><option value="security">Security</option></select></label><label><span>Period</span><select value={period} onChange={e=>setResourcePeriod(e.target.value)}><option value="7d">7 days</option><option value="30d">30 days</option><option value="90d">90 days</option></select></label></div></div>

    <div className="resource-principles">
      <div><b>Use the right intelligence</b><span>Route each task to the lowest-cost capable resource.</span></div>
      <div><b>Reduce vendor lock-in</b><span>Keep models and platforms interchangeable through orchestration.</span></div>
      <div><b>Control commercial exposure</b><span>Track token, licence, automation and specialist cost together.</span></div>
    </div>

    <div className="resource-kpi-grid">
      <div><span>AI & automation spend</span><strong>{money.format(totalCost)}</strong><b className="good">▼ 7% vs plan</b><small>Selected scope and period</small></div>
      <div><span>Autonomous resolution</span><strong>74%</strong><b className="good">▲ 8pp</b><small>Safe end-to-end coverage</small></div>
      <div><span>Premium AI usage</span><strong>10%</strong><b className="good">▼ 3pp</b><small>Complex reasoning only</small></div>
      <div><span>Specialist utilisation</span><strong>68%</strong><b className="good">▼ 6pp</b><small>More time on novel cases</small></div>
      <div><span>Potential annual saving</span><strong>£1.28M</strong><b className="good">42 opportunities</b><small>Validated shift-left pipeline</small></div>
    </div>

    <div className="resource-main-grid">
      <section className="resource-mix-panel">
        <div className="panel-mini-head"><div><b>Operational resource mix</b><span>Click a resource to inspect cost, utilisation and optimisation focus</span></div><small>Last {period==="7d"?"7 days":period==="90d"?"90 days":"30 days"}</small></div>
        <div className="resource-mix-cards">{resources.map(r=><button key={r.name} className={`${selectedResource===r.name?"selected":""} ${r.tone}`} onClick={()=>setSelectedResource(r.name)}><strong>{r.mix}%</strong><b>{r.name}</b><span>{r.usage}</span></button>)}</div>
        <div className="resource-mix-bar" aria-label="Resource mix distribution">{resources.map(r=><i key={r.name} className={r.tone} style={{width:`${r.mix}%`}}><span>{r.mix}%</span></i>)}</div>
        <div className="resource-selected-detail"><div><span>Selected resource</span><b>{selected.name}</b></div><div><span>Unit cost</span><b>{selected.unit}</b></div><div><span>Est. period cost</span><b>{money.format(Math.round(selected.cost*factor*periodFactor))}</b></div><div><span>Optimisation focus</span><b>{selected.focus}</b></div></div>
      </section>

      <section className="resource-routing-panel">
        <div className="panel-mini-head"><div><b>Least-cost routing decision flow</b><span>First-line-first-contact resolution for AI-native operations</span></div></div>
        <div className="routing-flow">
          <div className="routing-source"><span>Operational task</span><b>Event · Incident · Request · Change</b></div><i>→</i>
          <div className="routing-router"><span>AI / Automation Router</span><b>Cost · confidence · latency · risk</b></div><i>→</i>
          <div className="routing-options">
            <div className="green"><b>Rules</b><span>Fast · lowest cost</span></div>
            <div className="blue"><b>Automation</b><span>Standard known tasks</span></div>
            <div className="indigo"><b>ML Models</b><span>Prediction · classification</span></div>
            <div className="purple"><b>AI Agents / LLM</b><span>Reasoning · complex analysis</span></div>
            <div className="orange"><b>Specialists</b><span>Novel cases · exceptions</span></div>
          </div>
        </div>
        <div className="routing-policy"><span>Routing policy:</span><b>Cost</b><b>Complexity</b><b>Confidence</b><b>Latency</b><b>Risk</b><b>Data sensitivity</b></div>
      </section>
    </div>

    <div className="resource-secondary-grid">
      <section className="resource-trend-panel">
        <div className="panel-mini-head"><div><b>Cost & autonomy trend</b><span>As autonomy increases, premium-resource dependence should fall</span></div></div>
        <svg viewBox="0 0 520 195" className="resource-trend-chart" role="img" aria-label="Thirty day AI cost index and autonomy trend">
          {[40,80,120,160].map(y=><line key={y} x1="26" x2="500" y1={y} y2={y} className="gridline"/>)}
          <polyline className="cost-line" points={costSeries.map((v,i)=>`${x(i)},${yCost(v)}`).join(" ")}/><polyline className="autonomy-line" points={autonomySeries.map((v,i)=>`${x(i)},${yAuto(v)}`).join(" ")}/>
          <text x="30" y="20" className="chart-legend cost">AI cost index</text><text x="132" y="20" className="chart-legend autonomy">Autonomy %</text>
        </svg>
      </section>
      <section className="people-utilisation-panel">
        <div className="panel-mini-head"><div><b>Specialist people utilisation</b><span>Use experts for the work that creates reusable capability</span></div></div>
        <div className="people-util-kpis"><div><span>Productive utilisation</span><b>68%</b><i><em style={{width:"68%"}}/></i></div><div><span>AI fallout / escalations</span><b>1,248</b><small>▼ 12% vs last month</small></div><div><span>Repeat manual fixes</span><b>314</b><small>priority conversion candidates</small></div><div><span>Learning actions closed</span><b>87%</b><small>within 10 working days</small></div></div>
      </section>
    </div>

    <section className="shift-left-pipeline">
      <div className="panel-mini-head"><div><b>Shift-left / conversion pipeline</b><span>Turn expensive recurring work into lower-cost automation and reusable AI capability</span></div><button onClick={onOpenImprovement}>Open Continuous Improvement →</button></div>
      <div className="shift-left-table">
        <div className="shift-row shift-head"><span>ID</span><span>Incident family</span><span>Annual demand</span><span>Recommended route</span><span>Confidence</span><span>Annual saving</span><span>Decision</span></div>
        {opportunities.map(o=><div className="shift-row" key={o.id}><b>{o.id}</b><span>{o.family}</span><span>{o.volume}</span><span>{o.route}</span><span>{o.confidence}%</span><strong>{o.saving}</strong><span className="shift-actions">{o.status==="Review"?<><button onClick={()=>updateOpportunity(o.id,"Approved")}>Approve</button><button className="secondary" onClick={()=>updateOpportunity(o.id,"Retained")}>Retain</button></>:<b className={o.status==="Approved"?"approved":"retained"}>{o.status}</b>}</span></div>)}
      </div>
    </section>

    <div className="resource-insight-band"><b>Continuous improvement:</b><span>Shift repeatable work left. Use less premium AI. Convert specialist fixes into reusable automation, models and agent skills. Increase autonomy without compromising accuracy or customer outcomes.</span></div>
  </div>
}


function Select({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:string[][]}){
  return <label className="pw-select"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>;
}
function DetailCard({title,text,active,onClick}:{title:string;text:string;active:boolean;onClick:()=>void}){
  return <button className={`pw-detail-card ${active?"selected":""}`} onClick={onClick}><b>{title}</b><span>{text}</span></button>;
}
