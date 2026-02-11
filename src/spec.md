# Specification

## Summary
**Goal:** Make invoice addresses editable per invoice, improve multi-page invoice printing, remove the amount-in-words block from prints, and ensure users can reliably navigate back after printing.

**Planned changes:**
- Add editable “Bill To Address” and “Ship To Address” fields in the invoice editor (new + edit), defaulting to the selected customer’s billing address while allowing per-invoice overrides.
- Persist per-invoice Bill To / Ship To address overrides with the invoice record and load them when editing existing invoices.
- Update invoice detail and invoice print views to display per-invoice stored addresses when present, with a safe fallback to the customer billing address for older invoices without overrides.
- Remove the “Total Invoice Amount in Words” section from the invoice print/export layout and eliminate leftover whitespace/containers.
- Improve multi-page invoice print behavior using print CSS so headers (invoice header section as applicable and table column headers) repeat appropriately and table rows avoid breaking across pages where feasible.
- Add a visible on-screen “Back” action on the invoice print page that returns the user to a sensible page (e.g., the invoice detail), and ensure it is hidden in print output; optionally navigate back after printing completes.

**User-visible outcome:** Users can edit Bill To/Ship To addresses per invoice, printed invoices no longer show total amount-in-words, multi-page prints are cleaner and more readable, and the print page provides a clear way to return to the app after printing.
