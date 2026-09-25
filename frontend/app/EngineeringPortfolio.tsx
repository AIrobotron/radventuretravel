import React,{useMemo,useState} from 'react';

const scenarios=[
{id:'FI-01',title:'Core Router Interface Flap',roi:1800000,incidents:12540,maturity:62,agent:'Correlation Agent',priority:'High'},
{id:'FI-02',title:'BGP Peer Loss',roi:1200000,incidents:6420,maturity:71,agent:'Diagnosis Agent',priority:'High'},
{id:'FI-03',title:'SD-WAN Congestion',roi:950000,incidents:4830,maturity:58,agent:'Prediction Agent',priority:'Medium'},
{id:'FI-04',title:'DNS Failure',roi:760000,incidents:2950,maturity:83,agent:'Repair Agent',priority:'Medium'}
];

export default function EngineeringPortfolio(){
 const [selected,setSelected]=useState(scenarios[0]);
 const autonomy=useMemo(()=>Math.round(scenarios.reduce((a,b)=>a+b.maturity,0)/scenarios.length),[]);
 return (
 <div style={{padding:20}}>
   <h1>Engineering Portfolio</h1>
   <h3>Enterprise Autonomy: {autonomy}%</h3>

   <div style={{display:'flex',gap:24}}>
     <div style={{width:380}}>
       {scenarios.map(s=>(
         <div key={s.id} onClick={()=>setSelected(s)}
           style={{border:'1px solid #666',padding:12,marginBottom:10,cursor:'pointer'}}>
           <b>{s.id}</b> {s.title}<br/>
           AI Maturity: {s.maturity}%<br/>
           Annual Incidents: {s.incidents.toLocaleString()}<br/>
           ROI: £{s.roi.toLocaleString()}<br/>
           Owner: {s.agent}
         </div>
       ))}
     </div>

     <div style={{flex:1}}>
       <h2>{selected.id} – {selected.title}</h2>
       <h3>Digital Twin</h3>
       <table>
       <tbody>
       <tr><td>Current AI Maturity</td><td>{selected.maturity}%</td></tr>
       <tr><td>Target</td><td>90%</td></tr>
       <tr><td>Expected MTTR Reduction</td><td>27%</td></tr>
       <tr><td>Estimated Prevented Incidents</td><td>14%</td></tr>
       </tbody>
       </table>

       <h3>Engineering Backlog</h3>
       <ul>
        <li>Improve topology relationships</li>
        <li>Add optical telemetry</li>
        <li>Retrain correlation model</li>
        <li>Update automation workflow</li>
       </ul>

       <h3>Linked AI Agent</h3>
       <p>{selected.agent}</p>
     </div>
   </div>
 </div>);
}
