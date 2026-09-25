"use client";

import {useMemo, useState} from "react";

type Stage="Ideas"|"Needs Data"|"Training"|"Validation"|"Pilot"|"Production"|"Self Optimising";
type Opportunity={name:string;domain:string;volume:number;readiness:number;value:string;stage:Stage;hours:number;owner:string;gap:string;next:string;problem:string;evidence:string;training:string;success:string;target:string};

const opportunities:Opportunity[]=[
 {name:"VPN and access-circuit flaps",domain:"WAN",volume:12540,readiness:96,value:"High",stage:"Production",hours:1840,owner:"Correlation Agent",gap:"Final carrier validation",next:"Expand closed-loop repair to remaining access providers",problem:"Repeated tunnel and access-circuit instability creates duplicate incidents and avoidable L2/L3 investigation.",evidence:"BFD transitions, carrier access alarms, packet-loss trends, SD-WAN path changes and incident history.",training:"12 months of labelled flap events, confirmed carrier faults and known-good recovery sequences across access providers.",success:"≥95% common-cause correlation precision with <2% incorrect parent-incident grouping.",target:"90% autonomous correlation; guarded repair where carrier evidence is conclusive."},
 {name:"DNS service failures",domain:"Cloud",volume:7230,readiness:91,value:"High",stage:"Training",hours:1260,owner:"Diagnosis Agent",gap:"Resolver telemetry",next:"Validate root-cause model against 60 specialist-reviewed cases",problem:"DNS symptoms frequently resemble application or access faults, causing slow diagnosis and unnecessary resolver-group hand-offs.",evidence:"Resolver latency and error rates, query/response codes, synthetic tests, customer-path telemetry, recent DNS changes and ServiceNow outcomes.",training:"60 specialist-reviewed incidents plus historic resolver failures, healthy-control periods and labelled false-positive application cases.",success:"≥92% root-cause precision, ≥90% correct resolver-vs-network classification and no unsafe automated cache or configuration action.",target:"Automate diagnosis and low-risk cache/endpoint remediation; keep DNS configuration change behind approval."},
 {name:"SD-WAN path degradation",domain:"WAN",volume:5810,readiness:94,value:"High",stage:"Pilot",hours:980,owner:"Prediction Agent",gap:"Change-risk evidence",next:"Complete guarded failover pilot across 25 sites",problem:"Degrading underlay paths cause repeated SLA breaches before hard failure, creating intermittent user impact and manual path investigation.",evidence:"Loss, latency and jitter, BFD state, tunnel reselection, underlay utilisation, CPE health and recent policy changes.",training:"Labelled path-degradation windows with engineer-confirmed causes and outcomes from manual and automated failovers.",success:"Predict degradation early enough to protect service with ≥95% safe failover selection accuracy.",target:"Guarded autonomous path failover for approved site and application classes."},
 {name:"Certificate expiry",domain:"Security",volume:1940,readiness:98,value:"Medium",stage:"Self Optimising",hours:640,owner:"Repair Agent",gap:"None",next:"Monitor prevention performance and widen estate coverage",problem:"Expiring certificates create entirely preventable service incidents across managed applications, gateways and security services.",evidence:"Certificate inventory, expiry dates, ownership, dependency mapping, renewal status and prior expiry incidents.",training:"Known renewal patterns, successful automated renewals, exception cases and dependency-specific validation results.",success:"Prevent ≥99% of in-scope certificate-expiry incidents with zero service-impacting renewal errors.",target:"Fully autonomous renewal for standard certificates; exception handling for non-standard trust chains."},
 {name:"Firewall policy mismatch",domain:"Security",volume:610,readiness:63,value:"Medium",stage:"Needs Data",hours:420,owner:"Knowledge Agent",gap:"Golden-policy coverage",next:"Collect configuration intent and approved exception history",problem:"Configuration drift and undocumented exceptions make it difficult to distinguish genuine policy defects from intentional customer-specific rules.",evidence:"Running policy, golden policy, change records, approved exceptions, blocked-flow logs and application dependency data.",training:"Versioned approved policies with labelled exceptions, rollback outcomes and engineer-confirmed mismatch cases.",success:"≥95% precision identifying unintended policy drift before any automated correction is enabled.",target:"Recommendation-only until configuration intent coverage is complete; then guarded rollback of low-risk drift."},
 {name:"Optical interface errors",domain:"Network",volume:2410,readiness:82,value:"High",stage:"Validation",hours:760,owner:"Detection Agent",gap:"Vendor-normalised telemetry",next:"Confirm prediction lead time and false-positive threshold",problem:"Rising optical errors often precede customer-visible degradation but are currently investigated only after threshold alarms or service impact.",evidence:"Rx/Tx power, BER/FEC counters, temperature, interface errors, optical path topology, vendor alarms and maintenance history.",training:"Normalised multi-vendor optical telemetry with labelled degradation, fibre, optic and line-card failure outcomes.",success:"Detect actionable degradation with ≥30 minutes lead time and <3% false-positive rate.",target:"Autonomous detection and ticket enrichment; repair remains engineer-controlled."}
];
const stages:Stage[]=["Ideas","Needs Data","Training","Validation","Pilot","Production","Self Optimising"];

export default function ContinuousImprovementStudio({onBack}:{onBack:()=>void}){
 const [selected,setSelected]=useState(opportunities[0]);
 const [domain,setDomain]=useState("All");
 const filtered=useMemo(()=>domain==="All"?opportunities:opportunities.filter(x=>x.domain===domain),[domain]);
 const prevented=8240, coverage=68, growth=4.8;
 return <div className="ci-root">
  <header className="ci-header">
   <div><button className="studio-back" onClick={onBack}>← Back to AI Operations</button><div className="eyebrow">PLAN · PREDICT · PREVENT</div><h1>Continuous Improvement Studio</h1><p>Prioritise specialist engineering effort to expand safe autonomous coverage and prevent repeat demand.</p></div>
   <div className="ci-score"><span>ENTERPRISE AUTONOMY</span><strong>{coverage}%</strong><b>▲ {growth}pp this month</b></div>
  </header>

  <section className="ci-kpis">
   <div><span>Incidents prevented</span><strong>{prevented.toLocaleString("en-GB")}</strong><small>This month</small></div>
   <div><span>Engineering hours avoided</span><strong>5,900</strong><small>Annualised run-rate</small></div>
   <div><span>New AI skills deployed</span><strong>9</strong><small>Current month</small></div>
   <div><span>Learning closure</span><strong>87%</strong><small>Within 10 working days</small></div>
   <div><span>Automation candidates</span><strong>126</strong><small>43 validated</small></div>
  </section>

  <section className="ci-grid">
   <div className="ci-panel ci-portfolio">
    <div className="panel-mini-head"><div><b>AI operations improvement portfolio</b><span>Ranked by repeat demand, readiness, reusable value and prevention potential</span></div><select value={domain} onChange={e=>setDomain(e.target.value)}><option>All</option><option>WAN</option><option>Cloud</option><option>Security</option><option>Network</option></select></div>
    <div className="ci-table ci-head"><span>Opportunity</span><span>Annual demand</span><span>Readiness</span><span>Stage</span></div>
    {filtered.map(o=><button className={`ci-table ${selected.name===o.name?"selected":""}`} key={o.name} onClick={()=>setSelected(o)}><span><b>{o.name}</b><small>{o.domain} · {o.owner}</small></span><span>{o.volume.toLocaleString("en-GB")}</span><span><b>{o.readiness}%</b><i><em style={{width:`${o.readiness}%`}}/></i></span><span><strong>{o.stage}</strong></span></button>)}
   </div>

   <aside className="ci-panel ci-detail">
    <div className="eyebrow">SELECTED OPPORTUNITY</div><h2>{selected.name}</h2><p>{selected.domain} improvement owned by the <b>{selected.owner}</b>.</p>
    <div className="ci-detail-metrics"><div><span>AI readiness</span><strong>{selected.readiness}%</strong></div><div><span>Hours released</span><strong>{selected.hours.toLocaleString("en-GB")}</strong></div><div><span>Business value</span><strong>{selected.value}</strong></div></div>
    <div className="ci-detail-section"><h3>Operational problem</h3><p>{selected.problem}</p></div>
    <div className="ci-detail-section"><h3>Evidence available</h3><p>{selected.evidence}</p></div>
    <div className="ci-detail-section ci-training-box"><div><h3>{selected.stage === "Training" ? "Training package" : "Capability development"}</h3><span>{selected.stage}</span></div><p>{selected.training}</p></div>
    <div className="ci-detail-two"><div><h3>Capability gap</h3><p>{selected.gap}</p></div><div><h3>Autonomy target</h3><p>{selected.target}</p></div></div>
    <div className="ci-detail-section"><h3>Success criteria</h3><p>{selected.success}</p></div>
    <div className="ci-detail-section ci-next-action"><h3>Next specialist action</h3><p>{selected.next}</p></div>
    <button className="ci-primary">Open engineering work item</button>
   </aside>
  </section>

  <section className="ci-panel">
   <div className="panel-mini-head"><div><b>Capability growth workflow</b><span>Every complex case should create reusable operational capability</span></div></div>
   <div className="ci-kanban">{stages.map(stage=><div key={stage}><span>{stage}</span><strong>{opportunities.filter(x=>x.stage===stage).length}</strong><small>{opportunities.filter(x=>x.stage===stage).map(x=>x.name).join(", ")||"No priority item"}</small></div>)}</div>
  </section>

  <section className="ci-learning-loop"><div><b>Incident pattern</b><small>Complex or repeated demand</small></div><i>→</i><div><b>AI + engineer review</b><small>Correct diagnosis and repair failures</small></div><i>→</i><div><b>Knowledge and model update</b><small>Capture evidence and retrain</small></div><i>→</i><div><b>Automation expanded</b><small>Increase accurate coverage</small></div><i>→</i><div><b>Future incident prevented</b><small>Remove operational demand</small></div></section>
 </div>
}
