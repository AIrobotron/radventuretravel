export interface FIScenario {
 id:string;
 title:string;
 topology:string;
 aiAgent:string;
 autonomy:number;
 annualIncidents:number;
 businessValue:number;
 engineeringTasks:string[];
}

export const scenarios=[
{
 id:'FI-01',
 title:'Core Router Interface Flap',
 topology:'Paris Core',
 aiAgent:'Correlation Agent',
 autonomy:62,
 annualIncidents:12540,
 businessValue:1800000,
 engineeringTasks:[
   'Improve topology model',
   'Deploy optical telemetry',
   'Retrain correlation model',
   'Upgrade repair workflow'
 ]
}
];
