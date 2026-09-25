import React,{useState} from 'react';

const items=[
{id:'FI-01',title:'Core Router Interface Flap',owner:'Correlation Agent',value:'High',maturity:62},
{id:'FI-02',title:'BGP Peer Loss',owner:'Diagnosis Agent',value:'High',maturity:71},
{id:'FI-03',title:'SD-WAN Congestion',owner:'Prediction Agent',value:'Medium',maturity:58},
{id:'FI-04',title:'DNS Failure',owner:'Repair Agent',value:'High',maturity:83},
];

export default function EngineeringWorkItems(){
 const [selected,setSelected]=useState(items[0]);
 return (
 <div>
 <h1>Engineering Workbench</h1>
 <div style={{display:'flex',gap:24}}>
 <div style={{minWidth:320}}>
 {items.map(i=>
 <div key={i.id} onClick={()=>setSelected(i)} style={{cursor:'pointer',padding:10,border:'1px solid #666',marginBottom:8}}>
 <b>{i.id}</b> {i.title}<br/>
 Owner: {i.owner}<br/>
 AI Maturity: {i.maturity}%
 </div>)}
 </div>
 <div>
 <h2>{selected.id} - {selected.title}</h2>
 <p><b>Assigned AI Agent:</b> {selected.owner}</p>
 <h3>Automation Improvement Plan</h3>
 <ul>
 <li>Improve correlation confidence</li>
 <li>Add missing telemetry</li>
 <li>Retrain diagnosis model</li>
 <li>Deploy repair workflow v2</li>
 </ul>
 <h3>Expected Outcome</h3>
 <ul>
 <li>Automation +18%</li>
 <li>MTTR -27%</li>
 <li>Prevented incidents +14%</li>
 <li>Enterprise Autonomy +0.8%</li>
 </ul>
 </div>
 </div>
 </div>);
}
