"use client";

import {useMemo, useState} from "react";

type AgentStatus = "Healthy" | "Learning" | "Degraded" | "Paused";
type Agent = {
  name:string;
  role:string;
  status:AgentStatus;
  health:number;
  confidence:number;
  throughput:number;
  queue:number;
  learning:number;
  interventions:number;
  contribution:number;
  lastImprovement:string;
  constraint:string;
};

const AGENTS:Agent[]=[
  {name:"Detection Agent",role:"Finds actionable degradation before customer impact",status:"Healthy",health:98,confidence:96,throughput:420,queue:18,learning:2.1,interventions:2,contribution:14,lastImprovement:"Added optical-power drift signature",constraint:"Legacy access telemetry"},
  {name:"Correlation Agent",role:"Converts alarm storms into enriched parent incidents",status:"Learning",health:95,confidence:94,throughput:390,queue:31,learning:1.4,interventions:6,contribution:13,lastImprovement:"Improved cross-domain timing model",constraint:"Intermittent DNS patterns"},
  {name:"Diagnosis Agent",role:"Ranks root causes and assembles supporting evidence",status:"Healthy",health:94,confidence:91,throughput:350,queue:22,learning:1.0,interventions:8,contribution:12,lastImprovement:"Retrained on SD-WAN oscillation",constraint:"Sparse application traces"},
  {name:"Repair Agent",role:"Executes governed remediation and validates rollback",status:"Degraded",health:88,confidence:87,throughput:180,queue:14,learning:.5,interventions:11,contribution:9,lastImprovement:"Hardened firewall rollback logic",constraint:"Four repair families below threshold"},
  {name:"Prediction Agent",role:"Forecasts incidents and recommends preventive action",status:"Healthy",health:97,confidence:95,throughput:510,queue:9,learning:1.8,interventions:3,contribution:15,lastImprovement:"Added circuit saturation forecast",constraint:"Seasonal demand coverage"},
  {name:"Knowledge Agent",role:"Captures engineer learning and updates reusable playbooks",status:"Learning",health:99,confidence:98,throughput:240,queue:27,learning:2.4,interventions:4,contribution:5,lastImprovement:"Published nine validated skills",constraint:"Review backlog of 27 items"}
];

const statusClass=(status:AgentStatus)=>status.toLowerCase();

export default function AIWorkforce(){
  const [selectedName,setSelectedName]=useState(AGENTS[0].name);
  const selected=AGENTS.find(x=>x.name===selectedName) || AGENTS[0];
  const workforceHealth=useMemo(()=>Math.round(AGENTS.reduce((a,x)=>a+x.health,0)/AGENTS.length),[]);

  return <section className="ai-workforce-shell">
    <div className="panel-mini-head workforce-head">
      <div><b>AI Workforce</b><span>Supervise the digital operations team and target human expertise where it creates reusable capability.</span></div>
      <div className="workforce-summary"><strong>{workforceHealth}%</strong><small>workforce health</small></div>
    </div>

    <div className="agent-grid">
      {AGENTS.map(agent=><button key={agent.name} className={`agent-card ${selected.name===agent.name?"selected":""}`} onClick={()=>setSelectedName(agent.name)}>
        <div className="agent-card-head"><i className={statusClass(agent.status)}/><span>{agent.status}</span><b>{agent.health}%</b></div>
        <h4>{agent.name}</h4><p>{agent.role}</p>
        <div className="agent-card-metrics"><span><b>{agent.confidence}%</b><small>confidence</small></span><span><b>{agent.throughput}/h</b><small>throughput</small></span><span><b>{agent.queue}</b><small>queue</small></span></div>
      </button>)}
    </div>

    <div className="agent-detail-grid">
      <article className="agent-detail">
        <div className="agent-detail-title"><div><span className={`agent-status ${statusClass(selected.status)}`}>{selected.status}</span><h4>{selected.name}</h4><p>{selected.role}</p></div><strong>{selected.contribution}pp</strong></div>
        <div className="agent-gauges">
          <div><span>Decision confidence</span><b>{selected.confidence}%</b><div><i style={{width:`${selected.confidence}%`}}/></div></div>
          <div><span>Learning velocity</span><b>+{selected.learning.toFixed(1)}pp</b><div><i style={{width:`${Math.min(100,selected.learning*32)}%`}}/></div></div>
          <div><span>Human interventions</span><b>{selected.interventions}</b><div><i style={{width:`${Math.min(100,selected.interventions*7)}%`}}/></div></div>
        </div>
      </article>
      <aside className="agent-learning-card">
        <span>Latest capability improvement</span><b>{selected.lastImprovement}</b>
        <span>Current autonomy constraint</span><b>{selected.constraint}</b>
        <button>Open agent evidence →</button>
      </aside>
    </div>
  </section>;
}
