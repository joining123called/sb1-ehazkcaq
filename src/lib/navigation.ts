import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Wallet,
  Users,
  BookOpen,
  Clock,
  ShieldCheck,
  PlusCircle,
  FileEdit,
  AlertTriangle,
  HelpCircle,
  Settings,
  BarChart3,
  type LucideIcon
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  route: string;
  icon: LucideIcon;
  isEnabled?: boolean;
}

type NavigationConfig = {
  [key in 'client' | 'writer' | 'admin']: NavigationItem[];
};

export const navigationConfig: NavigationConfig = {
  client: [
    { name: 'Dashboard', route: '/dashboard/client', icon: LayoutDashboard },
    { name: 'Place New Order', route: '/orders/new', icon: PlusCircle },
    { name: 'My Orders', route: '/orders', icon: FileText },
    { name: 'Revisions', route: '/revisions', icon: FileEdit },
    { name: 'Disputes', route: '/disputes', icon: AlertTriangle },
    { name: 'Messages', route: '/messages', icon: MessageSquare },
    { name: 'Finance', route: '/finance', icon: Wallet },
    { name: 'Support', route: '/support', icon: HelpCircle },
    { name: 'Settings', route: '/settings', icon: Settings },
  ],
  writer: [
    { name: 'Dashboard', route: '/dashboard/writer', icon: LayoutDashboard },
    { name: 'Available Orders', route: '/writer/available-orders', icon: BookOpen },
    { name: 'Active Projects', route: '/writer/active-projects', icon: Clock },
    { name: 'Revisions', route: '/writer/revisions', icon: FileEdit },
    { name: 'Disputes', route: '/writer/disputes', icon: AlertTriangle },
    { name: 'Messages', route: '/writer/messages', icon: MessageSquare },
    { name: 'Finance', route: '/writer/finance', icon: Wallet },
    { name: 'Support', route: '/writer/support', icon: HelpCircle },
    { name: 'Settings', route: '/writer/settings', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', route: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', route: '/admin/users', icon: Users },
    { name: 'Orders', route: '/admin/orders', icon: FileText },
    { name: 'Disputes', route: '/admin/disputes', icon: AlertTriangle },
    { name: 'Messages', route: '/admin/messages', icon: MessageSquare },
    { name: 'Finance', route: '/admin/finance', icon: Wallet },
    { name: 'Reports & Analytics', route: '/admin/reports', icon: BarChart3 },
    { name: 'Support', route: '/admin/support', icon: HelpCircle },
    { name: 'Settings', route: '/admin/settings', icon: Settings },
  ],
};