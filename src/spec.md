# Specification

## Summary
**Goal:** Build the initial end-to-end GST Pro invoicing app shell with Internet Identity authentication, per-user data storage, core CRUD for customers/items/invoices, business profile settings, and print-friendly invoice output.

**Planned changes:**
- Create GST Pro branded app shell with routes/pages: Dashboard, Customers, Items, Invoices, Settings; set browser title and show empty states.
- Add Internet Identity sign-in/out gating and ensure all data is scoped to the signed-in Principal.
- Implement Settings business profile fields (business name, address, GSTIN, state, invoice prefix/starting number) with persistence and invoice number defaults.
- Implement Customers CRUD with search/filter by name and persistence per Principal.
- Implement Items/Services CRUD with search/filter by name and persistence per Principal.
- Implement invoice create/edit with line items, automatic totals and GST calculations, and intra-state vs inter-state tax switching (CGST+SGST vs IGST); include invoice metadata (number/date/due date optional).
- Implement invoice list + detail view with status (e.g., Draft/Finalized) and deletion UI with explanatory messaging for any disallowed actions.
- Add print-friendly invoice layout (browser print) from invoice detail including business/customer details, GST breakdown, and totals.
- Persist business profile, customers, items, and invoices in a single Motoko actor using stable storage so data survives upgrades, scoped by Principal.
- Apply a consistent professional visual theme across pages (avoid blue/purple as primary palette).
- Generate and include basic static brand assets (logo + app icon) and render them in the UI (e.g., header/sidebar, favicon/app header).

**User-visible outcome:** Users can sign in with Internet Identity, manage their business profile, customers, items, and invoices (with correct GST calculations), view invoice lists/details, and print invoices; all data is private to their Principal and persists across refresh and canister upgrades.
