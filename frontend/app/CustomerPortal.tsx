"use client";
import {useEffect,useRef,useState} from 'react';
import {parsePortalContext,PORTAL_CONTEXT_KEY} from './portal-context';
/** Isolates the portal's graph styles while navigation opens the real application NOC. */
export default function CustomerPortal(){
 const frame=useRef<HTMLIFrameElement>(null);
 const [height,setHeight]=useState(1000);
 useEffect(()=>{
  const receive=(event:MessageEvent)=>{
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow)return;
   if(event.data?.type==='alumni:portal:height'&&Number.isFinite(event.data.height))setHeight(Math.max(500,Math.min(30000,event.data.height)));
   if(event.data?.type==='alumni:portal:noc'){
    const context=parsePortalContext(event.data.context);if(!context)return;
    sessionStorage.setItem(PORTAL_CONTEXT_KEY,JSON.stringify(context));
    window.location.assign('/?'+new URLSearchParams({screen:'noc',from:'customerportal',site:context.site.id,incident:context.incidentId}));
   }
  };
  window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 },[]);
 return <iframe ref={frame} title="Customer Portal - Infrastructure Health" src="/customer-portal/index.html" style={{display:'block',width:'100%',height,border:0,background:'#f8f9fc'}}/>;
}
