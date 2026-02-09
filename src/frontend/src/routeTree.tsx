import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ItemsPage from './pages/ItemsPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceEditorPage from './pages/InvoiceEditorPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import SettingsPage from './pages/SettingsPage';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomersPage,
});

const itemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items',
  component: ItemsPage,
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices',
  component: InvoicesPage,
});

const invoiceNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/new',
  component: InvoiceEditorPage,
});

const invoiceEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId/edit',
  component: InvoiceEditorPage,
});

const invoiceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId',
  component: InvoiceDetailPage,
});

const invoicePrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invoices/$invoiceId/print',
  component: InvoicePrintPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  customersRoute,
  itemsRoute,
  invoicesRoute,
  invoiceNewRoute,
  invoiceEditRoute,
  invoiceDetailRoute,
  invoicePrintRoute,
  settingsRoute,
]);
