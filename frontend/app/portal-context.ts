export type PortalIncident = {id:string; caseId:string; title:string; p:number; source:boolean};
export type PortalContext = {site:{id:string;name:string}; incidentId:string; queue:PortalIncident[]};
export const PORTAL_STATE_KEY='alumni.portal.v1';
export const PORTAL_CONTEXT_KEY='alumni.portal.noc.v1';
export function parsePortalContext(value:unknown):PortalContext|null {
 if(!value||typeof value!=='object')return null;
 const v=value as Partial<PortalContext>;
 if(!v.site||typeof v.site.id!=='string'||typeof v.site.name!=='string'||v.site.id.length>80||v.site.name.length>200||typeof v.incidentId!=='string'||!Array.isArray(v.queue)||!v.queue.length||v.queue.length>100)return null;
 if(!v.queue.every(r=>r&&typeof r.id==='string'&&r.id.length<100&&/^FI-(0[1-9]|1[0-8])$/.test(r.caseId)&&typeof r.title==='string'&&r.title.length<300&&Number.isInteger(r.p)&&r.p>=1&&r.p<=4&&typeof r.source==='boolean'))return null;
 if(!v.queue.some(r=>r.id===v.incidentId))return null;
 return v as PortalContext;
}
export function readPortalContext():PortalContext|null{try{return parsePortalContext(JSON.parse(sessionStorage.getItem(PORTAL_CONTEXT_KEY)||'null'));}catch{return null;}}
export function portalProgress(id:string):number{try{const p=JSON.parse(localStorage.getItem(PORTAL_STATE_KEY)||'null')?.privateContent?.progress?.[id];return Number.isInteger(p)&&p>=0&&p<=9?p:0;}catch{return 0;}}
export function updatePortalProgress(id:string,step:number){try{const snapshot=JSON.parse(localStorage.getItem(PORTAL_STATE_KEY)||'null');if(!snapshot?.privateContent)return;snapshot.privateContent.progress={...snapshot.privateContent.progress,[id]:step};snapshot.privateContent.view='topology';snapshot.privateContent.persona='Operations';snapshot.privateContent.node='incident';snapshot.privateContent.ticketState='open';snapshot.privateContent.priority=0;localStorage.setItem(PORTAL_STATE_KEY,JSON.stringify(snapshot));}catch{/* Browser storage may be disabled. */}}
