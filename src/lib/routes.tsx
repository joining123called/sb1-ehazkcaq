import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';

// Import components directly
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';

// Client pages
import ClientDashboard from '../pages/client/Dashboard';
import NewOrder from '../pages/client/NewOrder';
import Orders from '../pages/client/Orders';
import Revisions from '../pages/client/Revisions';
import Disputes from '../pages/client/Disputes';
import Messages from '../pages/client/Messages';
import Finance from '../pages/client/Finance';
import Support from '../pages/client/Support';
import Settings from '../pages/client/Settings';

// Writer pages
import WriterDashboard from '../pages/writer/Dashboard';
import AvailableOrders from '../pages/writer/AvailableOrders';
import ActiveProjects from '../pages/writer/ActiveProjects';
import WriterMessages from '../pages/writer/Messages';
import WriterDisputes from '../pages/writer/Disputes';
import WriterRevisions from '../pages/writer/Revisions';
import WriterFinance from '../pages/writer/Finance';
import WriterSupport from '../pages/writer/Support';
import WriterSettings from '../pages/writer/Settings';

// Admin pages
import AdminLogin from '../pages/admin/Login';
import AdminRegister from '../pages/admin/Register';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminForgotPassword from '../pages/admin/ForgotPassword';
import AdminUsers from '../pages/admin/Users';
import AdminOrders from '../pages/admin/Orders';
import AdminDisputes from '../pages/admin/Disputes';
import AdminMessages from '../pages/admin/Messages';
import AdminFinance from '../pages/admin/Finance';
import AdminReports from '../pages/admin/Reports';
import AdminSupport from '../pages/admin/Support';
import AdminSettings from '../pages/admin/Settings';

// Route configurations
export const publicRoutes: RouteObject[] = [
  { path: '/', element: createElement(Login) },
  { path: '/register', element: createElement(Register) },
  { path: '/forgot-password', element: createElement(ForgotPassword) },
  { path: '/admin/login', element: createElement(AdminLogin) },
  { path: '/admin/register', element: createElement(AdminRegister) },
  { path: '/admin/forgot-password', element: createElement(AdminForgotPassword) },
];

export const clientRoutes: RouteObject[] = [
  { path: '/dashboard/client', element: createElement(ClientDashboard) },
  { path: '/orders/new', element: createElement(NewOrder) },
  { path: '/orders', element: createElement(Orders) },
  { path: '/revisions', element: createElement(Revisions) },
  { path: '/disputes', element: createElement(Disputes) },
  { path: '/messages', element: createElement(Messages) },
  { path: '/finance', element: createElement(Finance) },
  { path: '/support', element: createElement(Support) },
  { path: '/settings', element: createElement(Settings) },
];

export const writerRoutes: RouteObject[] = [
  { path: '/dashboard/writer', element: createElement(WriterDashboard) },
  { path: '/writer/available-orders', element: createElement(AvailableOrders) },
  { path: '/writer/active-projects', element: createElement(ActiveProjects) },
  { path: '/writer/messages', element: createElement(WriterMessages) },
  { path: '/writer/disputes', element: createElement(WriterDisputes) },
  { path: '/writer/revisions', element: createElement(WriterRevisions) },
  { path: '/writer/finance', element: createElement(WriterFinance) },
  { path: '/writer/support', element: createElement(WriterSupport) },
  { path: '/writer/settings', element: createElement(WriterSettings) },
];

export const adminRoutes: RouteObject[] = [
  { path: '/admin/dashboard', element: createElement(AdminDashboard) },
  { path: '/admin/users', element: createElement(AdminUsers) },
  { path: '/admin/orders', element: createElement(AdminOrders) },
  { path: '/admin/disputes', element: createElement(AdminDisputes) },
  { path: '/admin/messages', element: createElement(AdminMessages) },
  { path: '/admin/finance', element: createElement(AdminFinance) },
  { path: '/admin/reports', element: createElement(AdminReports) },
  { path: '/admin/support', element: createElement(AdminSupport) },
  { path: '/admin/settings', element: createElement(AdminSettings) },
];