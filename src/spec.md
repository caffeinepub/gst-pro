# Specification

## Summary
**Goal:** Let users configure banking details once in Settings and automatically include them on all invoices when present.

**Planned changes:**
- Extend the backend BusinessProfile model to store optional banking details: Account Name, Account Number, IFSC Code, Bank Name, and optional Branch.
- Add safe upgrade/migration handling (if stable storage is used) so existing BusinessProfile records remain readable and new banking fields default to empty/null without trapping.
- Update the Settings page to add a “Banking Details” section with inputs for the banking fields, saved/loaded through the existing business profile save/get flow.
- Update invoice print and invoice detail pages to render a “Banking Details” section using saved BusinessProfile data, and hide the section entirely when no banking fields are configured.

**User-visible outcome:** Users can add/edit banking details in Settings, and invoices (detail view and print layout) will show those details when configured, otherwise no banking section appears.
