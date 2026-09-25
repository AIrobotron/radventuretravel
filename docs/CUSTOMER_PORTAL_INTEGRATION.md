# Customer Portal integration

Customer Portal is a separate menu entry immediately after Enterprise NOC. It uses the existing Alumni shell and login protection. Its same-origin embedded view has isolated styles and local map assets.

## Editing and running

Frontend is the existing Next.js app. Install dependencies with npm ci, then npm run build and npm run start. Keep existing deployment authentication environment variables; no credentials are included in this package.

The editable portal fragment is frontend/portal-src/portal.html. After editing, run python3 frontend/portal-src/export.py from any directory to regenerate public/customer-portal/index.html. React navigation and the native NOC hand-off live in app/CustomerPortal.tsx, app/portal-context.ts and app/page.tsx.

## Data and behavior

The 685-site estate combines nine source sites with 676 illustrative sites. Map positions, additional incidents, lifecycle records and RAG are demonstration data. Open P1/P2 is red; P3/P4 only is amber; no open incidents is green. This is ticket-derived status, not measured availability.

Opening an incident sends a validated same-origin site and incident context to the native Enterprise NOC. Only open incidents from that site appear in its queue. Workflow progress is retained locally; returning to the portal preserves the selected site and incident. This does not call vendor APIs or alter a network. The contextual assistant uses prepared responses, not a live LLM.

The Enterprise NOC retains its existing content. Tiles run in this order: Live AI reasoning; AI diagnosis and recommendation; Explainable AI decision record; Platform and audit trail; Activity stream; Network engineering evidence; Repair implementation and checks. The workspace contains a compact incident description and fixed lifecycle controls above its scrolling detail area.

## Validation and deployment

Production compilation, type checking and static generation passed. Native NOC site filtering and portal navigation were observed in the browser. The package is based on the uploaded source snapshot; it must be compared with the current GitHub branch before merging. No live deployment has been changed. GitHub authentication is required to publish to the supplied repository.

See portal-package-first-validation.md for proposed controller, Blue Planet, Splunk and ServiceNow integration boundaries and the required production validation work.
