from pathlib import Path
import re
front=Path(__file__).resolve().parents[1]
fragment=(front/'portal-src/portal.html').read_text()
fragment=re.sub(r'<script src="[^"]+"[^>]*></script>','',fragment)
fragment=fragment.replace('window.openai','window.portalBridge')
bridge='''<script>
(()=>{let state=null;try{state=JSON.parse(localStorage.getItem('alumni.portal.v1')||'null')}catch{}window.portalBridge={widgetState:state,setWidgetState:async value=>{window.portalBridge.widgetState=value;try{localStorage.setItem('alumni.portal.v1',JSON.stringify(value))}catch{}}};})();
</script>'''
# Override only the NOC hand-off; the embedded prototype NOC is never used inside the app.
hook='''
const standaloneAct=act;
act=function(a,v){if(a==='noc'){const r=demoRecords.find(r=>r.id===v);if(r&&r.siteIds.includes(selected().id)&&!isClosed(r)){s.record=r.id;s.persona='Operations';s.view='topology';s.node='incident';save();const queue=recordsFor([selected()]).filter(r=>!isClosed(r)).map(({id,caseId,title,p,source})=>({id,caseId,title,p,source}));parent.postMessage({type:'alumni:portal:noc',context:{site:{id:selected().id,name:selected().name},incidentId:r.id,queue}},location.origin);return;}}standaloneAct(a,v);};
'''
fragment=fragment.replace("root.querySelector('#ea-scenario').innerHTML=cases.map",hook+"\nroot.querySelector('#ea-scenario').innerHTML=cases.map")
wrapper='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alumni Customer Portal</title><style>body{margin:0;background:#f8f9fc}#enterprise-atlas .ea-top{display:none!important}#enterprise-atlas{border:0!important;border-radius:0!important}button{cursor:pointer}</style><script src="/customer-portal/vendor/d3.min.js"></script><script src="/customer-portal/vendor/topojson.min.js"></script><script src="/customer-portal/vendor/lucide.min.js"></script></head><body>'''
end='''<script>new ResizeObserver(()=>parent.postMessage({type:'alumni:portal:height',height:document.documentElement.scrollHeight},location.origin)).observe(document.getElementById('enterprise-atlas'));</script></body></html>'''
(front/'public/customer-portal/index.html').write_text(wrapper+bridge+fragment+end)
