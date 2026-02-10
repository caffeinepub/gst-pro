# Specification

## Summary
**Goal:** Let users edit and store invoice numbers and purchase order numbers, ensure the E‑Way Bill link opens the correct login page, and allow GSTIN-based search to view full GST profile and filing status.

**Planned changes:**
- Extend the backend `Invoice` model to persist an editable `invoiceNumber` and optional `purchaseOrderNumber` across invoice create/edit/get/list flows, with safe defaults for older invoices.
- Update the invoice editor to include English-labeled inputs for “Invoice Number” and “Purchase Order Number”, pre-fill on edit, and save both fields.
- Update invoice detail and print pages to display stored invoice number when present (fallback to existing formatted number only when missing), and show “Purchase Order No” in print when available.
- Update the in-app “E‑Way Bill” action to open `https://ewaybillgst.gov.in/Login.aspx` in a new tab/window.
- Update the GST Status page to allow searching any GSTIN and display GST profile details (e.g., legal name, trade name) plus filing status for the selected return type/period, with clear English loading/empty/error states.

**User-visible outcome:** Users can enter and edit invoice and PO numbers, see them reflected in invoice views/prints, open the correct E‑Way Bill login page, and search any GSTIN to view its GST profile and filing status.
