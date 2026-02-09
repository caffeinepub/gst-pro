import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import AppShell from './components/AppShell';
import AuthGate from './components/AuthGate';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import PrintLayout from './components/PrintLayout';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ItemsPage from './pages/ItemsPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceEditorPage from './pages/InvoiceEditorPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import SettingsPage from './pages/SettingsPage';
import GstFilingStatusPage from './pages/GstFilingStatusPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminUserDashboardPage from './pages/AdminUserDashboardPage';
import ErrorFallbackScreen from './components/ErrorFallbackScreen';

// Root route with error handling
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: ({ error }) => {
    return <ErrorFallbackScreen error={error as Error} />;
  },
  notFoundComponent: () => {
    return (
      <ErrorFallbackScreen
        errorMessage="Page not found. The page you're looking for doesn't exist or has been removed."
      />
    );
  },
});

// Main app layout route (with AppShell, AuthGate, and ProfileSetupDialog)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-layout',
  component: () => (
    <AuthGate>
      <ProfileSetupDialog />
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGate>
  ),
});

// Print layout route (with AuthGate and ProfileSetupDialog, but no AppShell)
const printLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'print-layout',
  component: () => (
    <PrintLayout>
      <Outlet />
    </PrintLayout>
  ),
});

// Admin layout route (standalone, no AuthGate or AppShell)
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: () => <Outlet />,
});

// Main app routes (under app-layout)
const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: DashboardPage,
});

const customersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/customers',
  component: CustomersPage,
});

const itemsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/items',
  component: ItemsPage,
});

const invoicesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/invoices',
  component: InvoicesPage,
});

const invoiceEditorRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/invoices/new',
  component: InvoiceEditorPage,
});

const invoiceEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/invoices/$invoiceId/edit',
  component: InvoiceEditorPage,
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/invoices/$invoiceId',
  component: InvoiceDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const gstFilingStatusRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/gst-filing-status',
  component: GstFilingStatusPage,
});

// Print routes (under print-layout)
const invoicePrintRoute = createRoute({
  getParentRoute: () => printLayoutRoute,
  path: '/invoices/$invoiceId/print',
  component: InvoicePrintPage,
});

// Admin routes (under admin-layout, standalone)
const adminPanelRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  component: AdminPanelPage,
});

const adminUserDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/users/$userId/dashboard',
  component: AdminUserDashboardPage,
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([
    indexRoute,
    customersRoute,
    itemsRoute,
    invoicesRoute,
    invoiceEditorRoute,
    invoiceEditRoute,
    invoiceDetailRoute,
    settingsRoute,
    gstFilingStatusRoute,
  ]),
  printLayoutRoute.addChildren([invoicePrintRoute]),
  adminLayoutRoute.addChildren([adminPanelRoute, adminUserDashboardRoute]),
]);
