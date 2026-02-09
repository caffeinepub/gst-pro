# GST Pro - Smoke Test Checklist

This document contains manual test sequences to verify critical user flows after deployment.

## Test Environment Setup
- [ ] App is deployed and accessible
- [ ] Test with a fresh browser session (incognito/private mode recommended)
- [ ] Test on both desktop and mobile viewports

---

## 1. Authentication Flow

### Internet Identity Sign-In
- [ ] Navigate to app URL
- [ ] Click "Sign In with Internet Identity"
- [ ] Complete Internet Identity authentication
- [ ] Verify successful sign-in (redirected to dashboard)
- [ ] No blank/white screen at any step

### User ID & Password Sign-In
- [ ] Navigate to app URL
- [ ] Switch to "User ID & Password" tab
- [ ] Enter valid credentials
- [ ] Verify successful sign-in (redirected to dashboard)
- [ ] No blank/white screen at any step

### Sign-Up Flow
- [ ] Click "Don't have an account? Sign Up"
- [ ] Fill in email, password, and mobile number
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify can sign in with new credentials

---

## 2. Admin Panel Access Flow

### Unauthenticated → Admin Panel
- [ ] Start from unauthenticated state (logged out)
- [ ] Click "Admin Panel" button
- [ ] Verify navigates directly to `/admin` (no Internet Identity prompt)
- [ ] Verify credential sign-in form is displayed immediately
- [ ] Verify "Admin Access Required" heading and explanation text in English
- [ ] No blank/white screen at any step

### Valid Admin Credentials
- [ ] On `/admin` credential form, enter valid admin credentials:
  - Email: `singh.mayank783@gmail.com`
  - Password: `Mayank@123`
- [ ] Click "Sign In"
- [ ] Verify loading state shows during authentication
- [ ] Verify automatic transition to admin panel content (Users/Roles sections)
- [ ] Verify no manual refresh required
- [ ] No blank/white screen at any step

### Invalid Admin Credentials
- [ ] On `/admin` credential form, enter invalid credentials
- [ ] Click "Sign In"
- [ ] Verify clear error message displayed in English
- [ ] Verify form remains available (not hidden)
- [ ] Verify can retry with correct credentials
- [ ] No blank/white screen at any step

### Return to Dashboard
- [ ] From `/admin` (either credential form or admin content), click "Return to Dashboard" or "Back to App"
- [ ] Verify navigation to main dashboard works
- [ ] No blank/white screen

---

## 3. Admin Panel User Management

### View Users List
- [ ] Sign in as admin and navigate to Admin Panel
- [ ] Verify Users & Usage section displays
- [ ] Verify users table shows: User ID/Principal, Type, Role, Access Until, Last Used, Last Sign In
- [ ] Verify loading state shows while fetching users
- [ ] Verify empty state if no users exist
- [ ] No blank/white screen at any step

### Add New User
- [ ] Click "Add User" button
- [ ] Fill in all required fields: User ID/Email, Password, Mobile Number
- [ ] Select a role (Standard/Auditor/Super Admin)
- [ ] Optionally set "Access Until" date/time
- [ ] Click "Create User"
- [ ] Verify loading state during creation
- [ ] Verify success toast message
- [ ] Verify new user appears in table immediately (no manual refresh)
- [ ] Verify all user details are correct in the table

### Set Access Until Date
- [ ] Click "Set Access" button on a credential user row
- [ ] Verify dialog opens with current expiry (if any)
- [ ] Set a future date/time using datetime picker
- [ ] Click "Update"
- [ ] Verify loading state during update
- [ ] Verify success toast message
- [ ] Verify "Access Until" column updates immediately in table
- [ ] Verify no manual refresh required

### Clear Access Expiry
- [ ] Click "Set Access" on a credential user with an expiry date
- [ ] Click "Clear Expiry" button
- [ ] Verify success toast message
- [ ] Verify "Access Until" column shows "Unlimited"
- [ ] Verify no manual refresh required

### Remove User
- [ ] Click "Remove" button on a credential user row
- [ ] Verify confirmation dialog appears
- [ ] Confirm removal
- [ ] Verify loading state during removal
- [ ] Verify success toast message
- [ ] Verify user disappears from table immediately (no manual refresh)

### View Usage Information
- [ ] Verify "Last Used" column shows readable date/time for users who have used the app
- [ ] Verify "Last Used" shows "Never" for users who haven't used the app yet
- [ ] Verify "Last Sign In" column shows readable date/time for users who have signed in
- [ ] Verify "Last Sign In" shows "Never" for users who haven't signed in yet
- [ ] Verify expired access dates are highlighted (red/destructive color)
- [ ] Verify disabled users show "Disabled" badge

### Principal-Only Users
- [ ] Sign in with Internet Identity (without credential account)
- [ ] Use the app (create invoice, customer, etc.)
- [ ] Sign out and sign in as admin
- [ ] Navigate to Admin Panel Users & Usage
- [ ] Verify Principal-only user appears in the table
- [ ] Verify "Type" column shows "Principal Only" badge
- [ ] Verify "Last Sign In" shows the sign-in time
- [ ] Verify "Last Used" shows the usage time
- [ ] Verify "Access Until" shows "N/A" for Principal-only users
- [ ] Verify "View Dashboard", "Set Access", and "Remove" buttons are disabled/hidden for Principal-only users
- [ ] Verify credential users still have all action buttons available

### Error Handling
- [ ] Try to add a user with an existing email/User ID
- [ ] Verify clear error message in English
- [ ] Try to add a user with invalid data (empty fields, short password)
- [ ] Verify validation error messages
- [ ] Trigger a network error (disconnect network)
- [ ] Verify user-facing error message
- [ ] No blank/white screen on any error

---

## 4. Profile Setup (First-Time User)

### New User Profile Creation
- [ ] Sign in with a new Internet Identity (never used before)
- [ ] Verify profile setup dialog appears automatically
- [ ] Enter name in the profile form
- [ ] Submit profile
- [ ] Verify redirected to dashboard
- [ ] Verify name is displayed in header/settings

### Prevent Modal Flash
- [ ] Sign out and sign back in with the same identity
- [ ] Verify profile setup dialog does NOT appear
- [ ] Verify no flash/flicker of the modal
- [ ] Directly see dashboard content

---

## 5. Customer Management

### Add Customer
- [ ] Navigate to Customers page
- [ ] Click "Add Customer"
- [ ] Fill in all required fields (name, address, state)
- [ ] Select state from scrollable dropdown
- [ ] Submit form
- [ ] Verify customer appears in list
- [ ] Verify success feedback (toast/message)

### Edit Customer
- [ ] Click edit icon on a customer
- [ ] Modify customer details
- [ ] Change state using scrollable dropdown
- [ ] Save changes
- [ ] Verify updated data in list

### Delete Customer
- [ ] Click delete icon on a customer
- [ ] Confirm deletion in dialog
- [ ] Verify customer removed from list
- [ ] Verify success feedback

### Search Customers
- [ ] Enter search term in search box
- [ ] Verify filtered results
- [ ] Clear search
- [ ] Verify full list restored

---

## 6. Item Management

### Add Item
- [ ] Navigate to Items page
- [ ] Click "Add Item"
- [ ] Fill in item details (name, price, GST rate)
- [ ] Submit form
- [ ] Verify item appears in list

### Edit Item
- [ ] Click edit icon on an item
- [ ] Modify item details
- [ ] Save changes
- [ ] Verify updated data in list

### Delete Item
- [ ] Click delete icon on an item
- [ ] Confirm deletion
- [ ] Verify item removed from list

---

## 7. Invoice Management

### Create Invoice
- [ ] Navigate to Invoices page
- [ ] Click "Create Invoice"
- [ ] Select customer (or create new inline)
- [ ] Add line items (or create new items inline)
- [ ] Set invoice date
- [ ] Save as draft
- [ ] Verify invoice appears in list with "Draft" status

### Inline Customer Creation
- [ ] In invoice editor, click "Add New Customer"
- [ ] Fill customer form in dialog
- [ ] Submit
- [ ] Verify customer auto-selected in invoice
- [ ] Verify can continue editing invoice

### Inline Item Creation
- [ ] In invoice editor, click "Add New Item"
- [ ] Fill item form in dialog
- [ ] Submit
- [ ] Verify item auto-added to line items
- [ ] Verify can continue editing invoice

### Edit Invoice Date
- [ ] In invoice editor, click on invoice date field
- [ ] Change date using date picker
- [ ] Verify date updates in form
- [ ] Save invoice
- [ ] Verify correct date displayed in invoice list

### Finalize Invoice
- [ ] Open a draft invoice
- [ ] Click "Finalize Invoice"
- [ ] Confirm action
- [ ] Verify status changes to "Finalized"
- [ ] Verify cannot edit finalized invoice

### Delete Draft Invoice
- [ ] Click delete on a draft invoice
- [ ] Confirm deletion
- [ ] Verify invoice removed

### Cannot Delete Finalized Invoice
- [ ] Try to delete a finalized invoice
- [ ] Verify error message displayed
- [ ] Verify invoice remains in list

### Invoice Filtering
- [ ] Use status tabs (All/Draft/Finalized)
- [ ] Verify correct invoices shown for each tab
- [ ] Use date/month/year filters
- [ ] Verify filtered results
- [ ] Click "Clear Filters"
- [ ] Verify all invoices shown

### Monthly Summary
- [ ] Verify monthly summary section displays
- [ ] Check invoice count, taxable value, GST totals
- [ ] Verify calculations are correct
- [ ] Test on both desktop and mobile views

---

## 8. Invoice Printing

### Print Invoice
- [ ] Open an invoice detail page
- [ ] Click "Print Invoice"
- [ ] Verify print preview opens automatically (one-time)
- [ ] Verify all invoice data visible (customer, items, totals)
- [ ] Verify business logo displays if configured
- [ ] Verify print layout is clean (no header/footer/nav)
- [ ] Complete or cancel print
- [ ] Verify can navigate back to app

### Print Readiness
- [ ] Verify print does not trigger until all data loaded
- [ ] No blank pages in print preview
- [ ] All text and numbers properly formatted

---

## 9. Business Profile & Settings

### Save Business Profile
- [ ] Navigate to Settings
- [ ] Fill in business details (name, GSTIN, address, state)
- [ ] Select state from scrollable dropdown
- [ ] Set invoice prefix and starting number
- [ ] Save profile
- [ ] Verify success message

### Upload Invoice Logo
- [ ] In Settings, click "Upload Logo"
- [ ] Select an image file
- [ ] Verify upload progress indicator
- [ ] Verify logo preview displays
- [ ] Save settings
- [ ] Verify logo appears on invoices

### Remove Invoice Logo
- [ ] In Settings, click "Remove Logo"
- [ ] Confirm removal
- [ ] Verify logo preview cleared
- [ ] Save settings
- [ ] Verify logo no longer on invoices

---

## 10. GST Filing Status

### View Filing Status
- [ ] Navigate to GST Filing Status page
- [ ] Select financial year from dropdown
- [ ] Select return type (GSTR-3B/GSTR-1)
- [ ] Select filing frequency (Monthly/Quarterly)
- [ ] Verify status table displays

### Edit GSTIN
- [ ] Click "Edit GSTIN"
- [ ] Enter new GSTIN
- [ ] Save
- [ ] Verify updated GSTIN used in queries

### Error Handling
- [ ] Trigger an error (invalid GSTIN or network issue)
- [ ] Verify user-facing error message in English
- [ ] Verify actionable guidance provided
- [ ] No technical jargon or stack traces

---

## 11. Dashboard

### View KPI Cards
- [ ] Navigate to Dashboard
- [ ] Verify KPI cards display (Total Invoices, Draft, Finalized, Total Revenue)
- [ ] Verify numbers are correct

### Clickable KPI Cards
- [ ] Click "Total Invoices" card
- [ ] Verify navigates to Invoices page with "All" filter
- [ ] Go back to Dashboard
- [ ] Click "Draft Invoices" card
- [ ] Verify navigates to Invoices page with "Draft" filter
- [ ] Go back to Dashboard
- [ ] Click "Finalized Invoices" card
- [ ] Verify navigates to Invoices page with "Finalized" filter

### Keyboard Navigation
- [ ] Use Tab key to focus KPI cards
- [ ] Press Enter or Space on focused card
- [ ] Verify navigation works

### Quick Actions
- [ ] Verify quick action buttons present
- [ ] Click each quick action
- [ ] Verify correct navigation

---

## 12. Mobile & Responsive Design

### Mobile Navigation
- [ ] Test on mobile viewport (< 768px)
- [ ] Verify hamburger menu or mobile nav works
- [ ] Verify all pages accessible
- [ ] Verify forms are usable

### Scrollable Dropdowns on iOS
- [ ] Test on iOS Safari (or iOS simulator)
- [ ] Open state dropdown in Customer form
- [ ] Verify dropdown scrolls smoothly
- [ ] Verify can select any state
- [ ] Repeat for Business Profile state dropdown

### iOS Safe Area
- [ ] Test on iOS device with notch (iPhone X or later)
- [ ] Verify header has proper top padding (safe-area-inset-top)
- [ ] Verify content not hidden behind notch
- [ ] Verify footer has proper bottom padding

### Touch Targets
- [ ] Verify all buttons/links are easily tappable (min 44x44px)
- [ ] No accidental taps on adjacent elements

---

## 13. PWA Installation

### Android/Desktop Install
- [ ] Open app in Chrome/Edge
- [ ] Verify install prompt appears (or click install badge in footer)
- [ ] Click "Install"
- [ ] Verify app installs and opens in standalone mode
- [ ] Verify app icon on home screen/desktop

### iOS Install
- [ ] Open app in iOS Safari
- [ ] Click iOS install badge in footer
- [ ] Verify instruction dialog appears
- [ ] Follow instructions (Share → Add to Home Screen)
- [ ] Verify app icon on home screen
- [ ] Open installed app
- [ ] Verify runs in standalone mode

### Installed State
- [ ] After installation, verify footer shows "Installed" state
- [ ] Verify install badges no longer prompt for install

---

## 14. Error Handling & Recovery

### Network Error
- [ ] Disconnect network
- [ ] Try to perform an action (e.g., save customer)
- [ ] Verify user-facing error message
- [ ] Reconnect network
- [ ] Retry action
- [ ] Verify success

### Backend Error
- [ ] Trigger a backend error (e.g., invalid data)
- [ ] Verify error message in English
- [ ] Verify no blank/white screen
- [ ] Verify can recover and continue using app

### Logout and Clear Cache
- [ ] Sign out
- [ ] Verify all cached data cleared
- [ ] Sign in with different identity
- [ ] Verify no data leakage from previous session

---

## 15. Accessibility

### Keyboard Navigation
- [ ] Navigate entire app using only keyboard (Tab, Enter, Escape)
- [ ] Verify all interactive elements reachable
- [ ] Verify focus indicators visible

### Screen Reader
- [ ] Test with screen reader (VoiceOver, NVDA, JAWS)
- [ ] Verify labels and descriptions announced
- [ ] Verify form fields properly labeled

---

## 16. Performance

### Initial Load
- [ ] Measure time to interactive
- [ ] Verify no long blocking tasks
- [ ] Verify smooth animations

### Navigation
- [ ] Navigate between pages
- [ ] Verify instant transitions (no full page reloads)
- [ ] Verify React Query caching works (instant data on revisit)

---

## Pass Criteria

- [ ] All critical flows complete without errors
- [ ] No blank/white screens at any point
- [ ] All user-facing text in English
- [ ] Error messages are actionable and user-friendly
- [ ] Mobile experience is smooth and usable
- [ ] PWA installation works on target platforms
- [ ] Admin panel access flow works end-to-end with valid/invalid credentials
- [ ] Admin panel user management works: list, add, remove, set access expiry
- [ ] Usage tracking displays correctly with "Never" for unused accounts
- [ ] Internet Identity sign-in tracking works and displays in Admin Panel
- [ ] Principal-only users appear in Admin Panel with correct "Last Sign In" timestamp
- [ ] All UI updates happen immediately without manual refresh

---

## Notes

- Document any issues found with steps to reproduce
- Include screenshots for visual bugs
- Note browser/device/OS for platform-specific issues
