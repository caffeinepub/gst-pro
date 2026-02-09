# Specification

## Summary
**Goal:** Make mobile navigation reliably accessible and fix GST Status page runtime and data-fetching issues so users can view real filing status and GST profile details in English.

**Planned changes:**
- Update authenticated mobile navigation UI to ensure “Settings” (/settings) and “GST Status” (/gst-filing-status) are always visible and usable on small viewports without overflow/clipping.
- Fix the GST Status page runtime error (“ReturnType is not defined”) so the page renders and the return-type selector (GSTR-3B / GSTR-1) works correctly.
- Wire “Show/Refresh Status” to fetch real filing status data via the existing backend integration with https://services.gst.gov.in/services/searchtp, and display results with clear loading, empty, and error states (English).
- Extend the backend response and frontend rendering to include additional GST profile fields from the GST portal response (when available) and show a GST Profile section that degrades gracefully with English placeholders.

**User-visible outcome:** On mobile, users can navigate to Settings and GST Status reliably; the GST Status page no longer crashes, and users can refresh to see real GST filing status (Filed/Not filed and filing date when available) plus a more complete GST profile section with clear English loading/empty/error messaging.
