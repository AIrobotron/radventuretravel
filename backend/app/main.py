from datetime import datetime, timezone
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Telco AIOps Lab API", version="2.1.2")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Step(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    ts: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    kind: str
    title: str
    detail: str
    status: str = "info"

class Incident(BaseModel):
    id: str
    scenario_id: str
    title: str
    severity: str
    service: str
    customer: str
    status: str
    alarms_received: int
    alarms_suppressed: int
    affected_users: int
    confidence: int | None = None
    probable_root_cause: str | None = None
    recommended_action: str | None = None
    timeline: list[Step]

USE_CASES = [
 {"id":"anomaly","stage":"Monitor & Detect","title":"Anomaly Detection","description":"Dynamic baselining spots abnormal service behaviour before static thresholds fire.","platforms":"ServiceNow / Blue Planet / Splunk","benefit":"40–60% faster detection","kpi":"MTTD","maturity":"Predict","scenario_ids":["hot-link"]},
 {"id":"classify","stage":"Triage & Enrich","title":"Incident Auto Classification","description":"Classifies service, category and likely resolver group from incident evidence.","platforms":"ServiceNow","benefit":"30–50% triage reduction","kpi":"MTTA","maturity":"Assist","scenario_ids":["sap-outage"]},
 {"id":"correlate","stage":"Correlate & Root Cause","title":"Event Correlation & Noise Suppression","description":"Collapses cross-domain alarm floods into service-impacting incidents.","platforms":"Blue Planet / Splunk","benefit":"50–70% faster RCA","kpi":"MTTR","maturity":"Assist","scenario_ids":["wan-loss","site-power"]},
 {"id":"priority","stage":"Prioritize & Route","title":"Dynamic Priority Scoring","description":"Recalculates severity using users, services, topology and SLA exposure.","platforms":"ServiceNow","benefit":"Improved SLA adherence","kpi":"SLA","maturity":"Predict","scenario_ids":["site-power"]},
 {"id":"investigate","stage":"Diagnose & Investigate","title":"AI Investigation","description":"Sequences diagnostics and ranks root-cause hypotheses from live evidence.","platforms":"ServiceNow / Splunk","benefit":"Up to 80% faster diagnosis","kpi":"MTTR","maturity":"Act","scenario_ids":["wan-loss","sap-outage"]},
 {"id":"change","stage":"Diagnose & Investigate","title":"Change-Induced Incident Detection","description":"Correlates degradation with recent network, SD-WAN and application changes.","platforms":"ServiceNow / Splunk","benefit":"Faster change isolation","kpi":"MTTR","maturity":"Predict","scenario_ids":["wan-loss","sap-outage"]},
 {"id":"boundary","stage":"Prioritize & Route","title":"Network vs Customer IT Boundary","description":"Builds an evidence pack proving network health and routes ownership correctly.","platforms":"ServiceNow / Splunk","benefit":"Fewer resolver hops","kpi":"RFT","maturity":"Assist","scenario_ids":["sap-outage"]},
 {"id":"blast","stage":"Correlate & Root Cause","title":"Dynamic Blast Radius","description":"Maps affected users, sites and dependent services from live topology.","platforms":"Blue Planet","benefit":"More accurate severity","kpi":"SLA","maturity":"Predict","scenario_ids":["site-power"]},
 {"id":"sla","stage":"Prioritize & Route","title":"SLA Risk Prediction","description":"Forecasts breach likelihood from incident trajectory and current action path.","platforms":"ServiceNow / Splunk","benefit":"Earlier intervention","kpi":"SLA","maturity":"Predict","scenario_ids":["wan-loss","site-power"]},
 {"id":"commander","stage":"Resolve & Remediate","title":"AI Incident Commander","description":"Sequences actions, identifies owners and drafts operational updates.","platforms":"ServiceNow AI Agents","benefit":"Lower AHT","kpi":"AHT","maturity":"Assist","scenario_ids":["site-power","sap-outage"]},
 {"id":"repair","stage":"Resolve & Remediate","title":"Closed-Loop Auto-Remediation","description":"Executes governed rollback or reroute actions and verifies service recovery.","platforms":"ServiceNow / Blue Planet","benefit":"Higher zero-touch closure","kpi":"MTTR","maturity":"Act","scenario_ids":["wan-loss","hot-link"]},
 {"id":"quality","stage":"Validate & Close","title":"Ticket Quality AI","description":"Corrects categorisation, impact statements, evidence and closure notes.","platforms":"ServiceNow Now Assist","benefit":"Higher right-first-time","kpi":"RFT","maturity":"Assist","scenario_ids":["sap-outage"]},
 {"id":"problem","stage":"Learn & Prevent","title":"Chronic Problem Detection","description":"Finds recurring patterns and promotes them into permanent elimination actions.","platforms":"Splunk / ServiceNow","benefit":"Lower repeat incidents","kpi":"Incident volume","maturity":"Learn","scenario_ids":["hot-link"]},
 {"id":"learning","stage":"Learn & Prevent","title":"Closed-Loop Learning","description":"Captures verified repair outcomes to improve future diagnostic ranking.","platforms":"AI Agent / Knowledge","benefit":"Higher automation success","kpi":"RFT","maturity":"Learn","scenario_ids":["wan-loss","hot-link"]},
]

SCENARIOS = [
 {"id":"wan-loss","title":"WAN packet loss after SD-WAN change","summary":"37 alarms, WAN loss and a recent reversible policy change.","incident_id":"INC-10427"},
 {"id":"site-power","title":"Local comms-room power failure","summary":"Multi-device reachability loss and a site-wide blast radius.","incident_id":"INC-10431"},
 {"id":"sap-outage","title":"SAP outage — customer IT fault","summary":"Healthy network evidence and automated ownership reassignment.","incident_id":"INC-10442"},
 {"id":"hot-link","title":"Chronic hot link — prevent failure","summary":"Repeat congestion pattern detected before a P1 is raised.","incident_id":"INC-10458"},
]

def seed():
    return {
      "INC-10427": Incident(id="INC-10427",scenario_id="wan-loss",title="Intermittent WAN packet loss — London HQ",severity="P1",service="SD-WAN / Internet",customer="Northstar Manufacturing",status="OPEN",alarms_received=37,alarms_suppressed=0,affected_users=1842,timeline=[Step(kind="event",title="Incident created",detail="37 alarms received across WAN edge, access switches and application monitors.",status="danger")]),
      "INC-10431": Incident(id="INC-10431",scenario_id="site-power",title="Site communications outage — Bristol DC",severity="P1",service="LAN / WAN / Voice",customer="Helios Retail",status="OPEN",alarms_received=128,alarms_suppressed=0,affected_users=726,timeline=[Step(kind="event",title="Multi-domain alarm flood",detail="Routers, switches, Wi-Fi and voice devices became unreachable within 42 seconds.",status="danger")]),
      "INC-10442": Incident(id="INC-10442",scenario_id="sap-outage",title="SAP unavailable — EMEA users",severity="P2",service="Business application access",customer="Aster Automotive",status="OPEN",alarms_received=9,alarms_suppressed=0,affected_users=2310,timeline=[Step(kind="event",title="Customer-impact incident raised",detail="Multiple SAP login failures. Network service desk initially assigned.",status="warning")]),
      "INC-10458": Incident(id="INC-10458",scenario_id="hot-link",title="Predicted congestion risk — Marseille hub",severity="P3",service="WAN capacity",customer="Orion Logistics",status="OPEN",alarms_received=14,alarms_suppressed=0,affected_users=418,timeline=[Step(kind="predict",title="Pre-incident risk detected",detail="Trend matches 14 prior congestion incidents. Predicted breach window: 3h 20m.",status="warning")]),
    }

INCIDENTS = seed()

def find(i):
    if i not in INCIDENTS:
        raise HTTPException(404, "Incident not found")
    return INCIDENTS[i]

@app.get("/health")
def health():
    return {"status":"ok","version":"2.0.0-preview.3"}

@app.get("/use-cases")
def use_cases():
    return USE_CASES

@app.get("/scenarios")
def scenarios():
    return SCENARIOS

@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    return find(incident_id)

@app.post("/reset")
def reset():
    global INCIDENTS
    INCIDENTS = seed()
    return list(INCIDENTS.values())

@app.post("/incidents/{incident_id}/diagnose")
def diagnose(incident_id: str):
    i = find(incident_id)
    if i.status != "OPEN":
        return i
    i.status = "DIAGNOSING"
    if i.scenario_id == "wan-loss":
        i.alarms_suppressed=34; i.confidence=94
        i.probable_root_cause="SD-WAN policy change causing asymmetric routing via PE-03 Gi0/2"
        i.recommended_action="Rollback VOICE-PRIORITY-V7 to previous policy version"
        i.timeline += [
          Step(kind="correlation",title="Event correlation complete",detail="37 alarms grouped into one incident; 34 downstream symptoms suppressed.",status="success"),
          Step(kind="tool",title="getTopology()",detail="CPE-LON-01 → SW-LON-CORE-01 → PE-03 → ISP transit."),
          Step(kind="tool",title="runPing()",detail="0.2% loss to LAN gateway; 11.8% loss beyond PE-03.",status="warning"),
          Step(kind="tool",title="checkInterface()",detail="PE-03 Gi0/2 physical counters normal. Hardware fault unlikely."),
          Step(kind="change",title="Change correlation",detail="VOICE-PRIORITY-V7 changed 9 minutes before degradation.",status="warning"),
          Step(kind="hypothesis",title="Probable root cause ranked #1",detail="Recent SD-WAN policy change is causing asymmetric path selection.",status="warning"),
          Step(kind="predict",title="SLA risk forecast",detail="71% probability of P1 restoration target breach without rollback.",status="warning")]
    elif i.scenario_id == "site-power":
        i.alarms_suppressed=121; i.confidence=98
        i.probable_root_cause="Local power failure in Bristol comms room BRS-CR-02"
        i.recommended_action="Dispatch site engineer and validate UPS / breaker recovery"
        i.timeline += [
          Step(kind="correlation",title="Cross-domain correlation",detail="128 alarms collapsed into one site event; 121 symptoms suppressed.",status="success"),
          Step(kind="blast",title="Blast radius recalculated",detail="726 users across LAN, WAN, Wi-Fi and voice services affected.",status="warning"),
          Step(kind="tool",title="checkCarrierEdges()",detail="Both WAN carriers lost CPE simultaneously; dual carrier failure unlikely."),
          Step(kind="tool",title="checkSiteTelemetry()",detail="UPS telemetry stopped 18 seconds before network loss.",status="warning"),
          Step(kind="hypothesis",title="Common-mode failure identified",detail="Evidence points to comms-room power loss.",status="warning"),
          Step(kind="commander",title="Incident commander plan drafted",detail="Contact site rep, confirm breaker/UPS, dispatch engineer and hold carrier escalation.")]
    elif i.scenario_id == "sap-outage":
        i.alarms_suppressed=7; i.confidence=97
        i.probable_root_cause="Customer SAP application tier failure following recent deployment"
        i.recommended_action="Reassign to customer SAP operations with diagnostic evidence attached"
        i.timeline += [
          Step(kind="classification",title="Incident auto-classified",detail="Likely application-service incident; network ownership confidence falls to 8%.",status="success"),
          Step(kind="tool",title="testNetworkPath()",detail="LAN, WAN, DNS and TLS path healthy from 6 EMEA sites.",status="success"),
          Step(kind="tool",title="checkApplicationEdge()",detail="HTTP 503 returned from SAP application tier.",status="warning"),
          Step(kind="change",title="Change correlation",detail="SAP deployment completed 21 minutes before failure; no network change.",status="warning"),
          Step(kind="boundary",title="Resolver boundary identified",detail="Evidence points to customer SAP tier, not managed network.",status="warning"),
          Step(kind="quality",title="Ticket quality corrected",detail="Category changed to Application > SAP and evidence pack attached.",status="success")]
    else:
        i.alarms_suppressed=10; i.confidence=91
        i.probable_root_cause="Recurring peak-hour congestion from replication traffic on constrained transit pair"
        i.recommended_action="Move replication traffic to secondary path and open capacity problem record"
        i.timeline += [
          Step(kind="anomaly",title="Dynamic baseline breached",detail="95th percentile utilisation rising 3.8% per day.",status="warning"),
          Step(kind="predict",title="Congestion trajectory forecast",detail="Peak utilisation predicted above 98% tonight.",status="warning"),
          Step(kind="similarity",title="14 similar incidents found",detail="11 occurred on the same Marseille transit pair.",status="warning"),
          Step(kind="tool",title="checkTrafficClasses()",detail="Bulk replication consumes 31% of peak capacity during trading hours."),
          Step(kind="problem",title="Chronic problem candidate created",detail="Pattern promoted to PRB-AUTO-118 with 14 linked incidents.",status="success")]
    i.status="ACTION_REQUIRED"
    i.timeline.append(Step(kind="decision",title="AI decision gate",detail=f"Recommended action: {i.recommended_action}. Human approval required.",status="warning"))
    return i

@app.post("/incidents/{incident_id}/repair")
def repair(incident_id: str):
    i=find(incident_id)
    if i.status!="ACTION_REQUIRED":
        raise HTTPException(409,"Diagnose before action")
    i.status="REPAIRING"
    action={
      "wan-loss":("rollbackSdwanPolicy()","VOICE-PRIORITY-V7 rolled back to V6. CHG-AUTO-8821 created."),
      "site-power":("Coordinate site recovery","Site rep confirms tripped breaker. Protected feed restoration authorised."),
      "sap-outage":("Reassign resolver","Transferred to SAP operations with network evidence and change correlation attached."),
      "hot-link":("rerouteReplicationTraffic()","Bulk replication moved to secondary path using a reversible policy.")
    }[i.scenario_id]
    i.timeline.append(Step(kind="repair",title=action[0],detail=action[1],status="success"))
    return i

@app.post("/incidents/{incident_id}/verify")
def verify(incident_id: str):
    i=find(incident_id)
    if i.status!="REPAIRING":
        raise HTTPException(409,"Action must run before verification")
    message={
      "wan-loss":"Packet loss reduced from 11.8% to 0.1%; latency and jitter returned to baseline.",
      "site-power":"Core, WAN, voice and wireless services restored; 726-user blast radius cleared.",
      "sap-outage":"Managed network remains healthy; correct resolver ownership confirmed.",
      "hot-link":"Peak utilisation now forecast at 72%; customer-impact threshold no longer expected."
    }[i.scenario_id]
    i.timeline += [
        Step(kind="verify",title="Outcome verified",detail=message,status="success"),
        Step(kind="learning",title="Closed-loop learning updated",detail="Verified outcome captured for future diagnostic ranking and automation policy.",status="success")
    ]
    i.status="RESOLVED"
    return i
