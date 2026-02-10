# Specification

## Summary
**Goal:** Fix “backend connection not ready” save failures for Customers and Business Profile, and update invoice print/export layout by removing QR and delivery-related fields while adding conditional Banking Details.

**Planned changes:**
- Ensure Customer create/edit flows (Customers page and invoice-related customer save) wait for backend readiness before submitting; on success, persist and update the customers list immediately.
- Ensure Settings (Business Profile) save waits for backend readiness before submitting; on success, persist changes and show them after reload.
- Update invoice print/export layout to remove the QR section entirely (no option, label, placeholder, image, or reserved space).
- Remove Delivery Note and the specified payment/dispatch/delivery fields from invoice print/export and any invoice detail/metadata views, without leaving empty rows or separators.
- Add a “Banking Details” section to invoice print/export sourced from saved Business Profile; show it only when banking details are configured (hide the whole section when not configured).

**User-visible outcome:** Signed-in users can save customers and business profile settings without “backend not ready” errors, and invoices print/export without QR and removed delivery fields while showing Banking Details only when configured.
