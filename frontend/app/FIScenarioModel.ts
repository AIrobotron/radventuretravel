export interface FIScenario {
  id:string;
  title:string;
  annualIncidents:number;
  aiMaturity:number;
  automation:number;
  businessValue:'Low'|'Medium'|'High';
  assignedAgent:string;
  blockers:string[];
  workItems:string[];
}

export const scenarios:FIScenario[]=[
{
 id:'FI-01',
 title:'Core Router Interface Flap',
 annualIncidents:12540,
 aiMaturity:62,
 automation:44,
 businessValue:'High',
 assignedAgent:'Correlation Agent',
 blockers:[
   'Missing topology relationships',
   'Low confidence RCA',
   'Incomplete telemetry'
 ],
 workItems:[
   'Improve topology model',
   'Retrain correlation model',
   'Deploy repair workflow v2'
 ]
}
];
