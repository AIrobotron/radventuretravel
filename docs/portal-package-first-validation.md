# Customer Portal — package-first implementation and validation

Design basis: Alumni AI Operations Studio; reviewed 25 September 2026.

## Recommended approach

Build the customer experience around the installed ServiceNow customer/telecom package. Reuse its account, entitlement, installed-service, case and request model. Use Service Operations Workspace for authorised internal operators. Keep Splunk as the evidence and service-KPI investigation surface, and Blue Planet/domain controllers as the network topology, routing and execution surfaces. Carry customer, site, service, resource, incident and time context between them.

This is a proposed architecture, not a statement that the complete mock-up ships in one standard package. Exact product versions, licences, installed connectors and controller coverage must be confirmed before estimating development.

## Functional fit

| Portal capability | Preferred standard capability | Configuration/integration needed | Residual development or validation |
|---|---|---|---|
| Customer and site view | ServiceNow CSM/Telecommunications Service Management, installed base and locations | Account/site/service relationships, customer entitlements and roles | Verify external-user access to every exposed field |
| P1–P4 open/closed and work queues | ServiceNow incidents, changes, requests and native reporting | State definitions, date window, site links, priority mapping and parent/child deduplication | Confirm whether external users see a customer case or an entitled incident projection |
| Service impact and dependencies | ServiceNow ITOM/TSOM service dashboard and unified service map | CSDM-aligned service data, supported discovery/imports, relationship and impact rules | Native service map is not automatically a geographical customer portal |
| KPI-to-evidence drill-down | Splunk ITSI Service Analyzer, entities, episodes and Deep Dives | Service templates, entity aliases, KPIs, thresholds, dependency rules and time context | Log/metric coverage and data latency must be measured |
| Incident synchronisation | Supported Splunk Add-on for ServiceNow and ITSI episode actions | Connector versions, field/state rules, custom aggregation policy, bidirectional setup | Prove duplicate suppression, update loops and recovery after connection failures |
| Network inventory and dependencies | Blue Planet Inventory / existing authoritative OSS inventory | Resource/service identity mapping, reconciliation and controller adapters | Verify exact vendor/model/software-release coverage |
| Routing and actual traffic path | Blue Planet Route Optimization and Analysis or existing domain tools | Routing inputs, traffic telemetry, service mapping and observation timestamp | Control-plane route is not proof of every application's actual forwarding path |
| Site device configuration | Existing device/controller configuration and change tools | Read access, supported API and configuration version identifiers | Validate backup paths, HA, policy differences and redaction |
| Guided remediation | ServiceNow workflow/approvals; Blue Planet Orchestration or controller execution | Reusable runbooks, permitted actions, approval gates, rollback and post-tests | AI recommendation must be grounded in evidence; prove actions individually |
| Customer/provider instance connection | Service Exchange (formerly Service Bridge), where both sides fit supported products | Provider/consumer setup and permitted service/task mappings | Not a universal replacement for every BSS/OSS interface |
| Exact geographic zoom and persona navigation | Native portal components where they meet the requirement | Grouping, counts, filters, labels and branding | Likely a small scoped UI extension if the precise interaction is retained; verify in the target release |

## Shared identity and ownership

Maintain a traceable chain:

Customer/account → site/location → sold product or subscribed service → service instance → technical service/resource → controller entity.

Link the incident, change, request and Splunk episode to those identities. Geographic parents are aggregation attributes, not artificial network dependencies. A service spanning multiple sites must retain one parent incident identity; regional totals must not double-count it.

Choose ownership explicitly:

- BSS/CRM: customer, contract, subscribed product and entitlement.
- ServiceNow: customer-facing work, incident/change/request lifecycle and approvals.
- Authoritative inventory/OSS: network resource and service relationships; reconcile the operational subset into ServiceNow as required.
- Splunk: telemetry, KPI calculations, event/episode evidence and investigation.
- Domain controllers: authoritative running configuration and execution results; Blue Planet can coordinate supported cross-domain actions.

Do not create three competing masters for service health, topology or incident state. Keep high-volume telemetry in the analytics platform; exchange identifiers, summaries, links and the evidence needed by each workflow.

## Health semantics

The prototype's requested rule is ticket-based: red = open P1/P2, amber = open P3/P4 only, green = no open incident. Group colour is the worst child. This is an operational workload indicator, not proof of service availability.

For production, show service experience separately: critical transaction/synthetic results, reachability, voice quality, path loss/latency, SLA/SLO and resilience state. Include Unknown for missing/stale observations and explicit maintenance handling. A failed primary circuit with healthy backup can carry a high-priority incident while customer transactions remain healthy.

An incident closes only after the approved recovery and independent validation satisfy the operating policy. Closing a ticket alone must not manufacture healthy telemetry.

## Deployment proof: one vertical slice first

Use a retail branch with primary access plus LTE backup. Repeat with a manufacturing site and an enterprise WAN site before claiming broad portability.

1. Import a real entitled customer, location, service, resources and controller identifiers using supported interfaces.
2. Demonstrate the geographic selection and customer isolation. Verify another customer's objects cannot be obtained through either UI or API.
3. Inject an agreed lab fault and trace monitoring → episode → incident/customer case, maintaining identity and timestamps.
4. Navigate from portal to the authorised workspace, from service to KPI evidence, and from resource to topology/path/configuration.
5. Run the guided diagnosis using actual controller responses. Compare its conclusion with known fault ground truth.
6. Approve a lab repair through the supported workflow, execute once, retain the operation/job ID, and test rollback or failback.
7. Validate both technical recovery and business transaction recovery. Synchronise closure and verify counts and service health independently.
8. Repeat with an API timeout, duplicate event, stale inventory, maintenance window, shared-service incident and denied user access.
9. Measure the refresh delay, data completeness, supported API calls, custom components and ongoing maintenance required.

## Evidence register for every interaction

For each clickable element record: persona and permission; customer/site/service/resource key; source of truth; product module and release; supported UI or endpoint; sample request/response; event or refresh mechanism; adapter and licence; out-of-box/configuration/integration/custom classification; test and result; remaining gap.

Mark an interaction **validated standard** only after demonstrating it on the target product release. An API's existence alone does not establish a supported connector, correct semantics or implementation effort.

## Sources consulted

- ServiceNow TSOM: https://www.servicenow.com/products/telecommunications-service-operations.html
- ServiceNow unified service map and impact paths: https://www.servicenow.com/docs/r/it-operations-management/service-operations-workspace-for-itom-apps/view-impact-tree.html
- ServiceNow Service Exchange release notes: https://www.servicenow.com/docs/r/release-notes/service-bridge-rn.html
- Splunk ITSI Service Analyzer tree: https://help.splunk.com/en/splunk-it-service-intelligence/splunk-it-service-intelligence/visualize-and-assess-service-health/4.20/service-analyzer/use-the-service-analyzer-tree-view-in-itsi
- Splunk ITSI ServiceNow integration: https://help.splunk.com/splunk-it-service-intelligence/splunk-it-service-intelligence/detect-and-act-on-notable-events/4.18/episode-ticketing-integrations/integrate-itsi-with-servicenow
- Blue Planet Inventory: https://www.blueplanet.com/products/inventory
- Blue Planet Route Optimization and Analysis: https://www.blueplanet.com/products/route-optimization-and-analysis
- Blue Planet Orchestration: https://www.blueplanet.com/products/orchestration

Product documentation spans different versions. It establishes candidate capabilities, not compatibility with an unknown customer installation. Detailed endpoint contracts and installed-version support remain to be tested.

## Prototype boundary and Alumni styling

The connected portal is an interactive demonstration. Its NOC view follows the supplied app's ten-stage workflow; it does not operate a live ServiceNow, Splunk, Blue Planet or device controller. Additional tickets, closed history, record state transitions, site distribution and RAG status are demo data.

Brand reference: the supplied frontend/app/styles.css, especially “vA1.0 Alumni light consultancy theme” and subsequent light-workspace refinements, compared with https://alumni-ai-operations-studio.vercel.app/. White panels, purple #5b32d6 accents, fine neutral borders, pale lavender/cyan surfaces, Alumni logo and Arial typography. The earlier dark base rules are superseded by these later brand rules.

## Customer-facing AI recommendation

Use a contextual service concierge alongside the map, rather than making conversation the only route through the portal. It should inherit the selected site, service, incident, time window and permitted customer scope. Keep the same task context when handing off to a human.

Start with status explanations, incident summaries, source-linked investigation and catalogue request preparation. Add execution only for specifically validated tools and runbooks with identity, approvals, rollback, audit and independent recovery checks. An LLM should explain deterministic counts and health calculations, not invent them.

ServiceNow documents Virtual Agent as an entry point to topics, skills, agents and workflows, and TMT agents for network-incident analysis and service testing/repair. This is a current foundation, not proof that every workflow is externally available to every customer persona. Blue Planet AI Studio is another candidate for network-domain agents; validate its tools and interfaces on the installed release.

For a 24–36 month design horizon, consider proactive impact briefings, intent-led service changes, pre-change simulation and supervised multi-domain recovery. This is a recommended direction rather than a claim about a committed vendor roadmap.

- ServiceNow Virtual Agent readiness: https://www.servicenow.com/docs/r/intelligent-experiences/sn-ai-impl-nava.html
- ServiceNow TMT agentic workflows: https://www.servicenow.com/docs/r/telecom-media-technology/now-assist-for-telecom-media-and-technology/using-aiagents-usecases.html
- Blue Planet AI Studio: https://www.blueplanet.com/products/ai-studio
