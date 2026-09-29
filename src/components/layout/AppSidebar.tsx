import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  History,
  Users,
  Package,
  DollarSign,
  UserCog,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  Scan,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface NavItem {
  title: string;
  titleKey: string;
  url: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Prefetch route chunks on link hover to eliminate navigation latency
const routeLoaders: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('../../pages/Dashboard'),
  '/billing': () => import('../../pages/Billing'),
  '/bill-history': () => import('../../pages/BillHistory'),
  '/staff': () => import('../../pages/StaffManagement'),
  '/customers': () => import('../../pages/CustomerManagement'),
  '/inventory': () => import('../../pages/Inventory'),
  '/barcode-generator': () => import('../../pages/BarcodeGenerator'),
  '/label-testing': () => import('../../pages/LabelTestingStudioPage'),
  '/expenses': () => import('../../pages/Expenses'),
  '/reports': () => import('../../pages/Reports'),
  '/gst-reports': () => import('../../pages/GstReports'),
  '/settings': () => import('../../pages/Settings'),
  '/profile': () => import('../../pages/Profile'),
  '/hold-bills': () => import('../../pages/HoldBill'),
  '/due-management': () => import('../../pages/DueManagement'),
  '/purchase-return': () => import('../../pages/PurchaseReturn'),
  '/admin-customization': () => import('../../pages/AdminCustomization'),
  '/backup-restore': () => import('../../pages/BackupRestore'),
  '/whatsapp-messenger': () => import('../../pages/WhatsappMessenger'),
};

export function preloadRoute(url: string) {
  try {
    const loader = routeLoaders[url];
    if (loader) {
      loader();
    }
  } catch (err) {
    // Non-blocking prefetch failure
  }
}

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', titleKey: 'nav.dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'New Bill', titleKey: 'nav.billing', url: '/billing', icon: Receipt },
      { title: 'Hold Bills', titleKey: 'Hold Bills', url: '/hold-bills', icon: History },
      { title: 'Bill History', titleKey: 'nav.billHistory', url: '/bill-history', icon: History },
    ],
  },
  {
    label: 'Operations & Staff',
    items: [
      { title: 'Employees', titleKey: 'Employees', url: '/staff', icon: Users },
      { title: 'Customers', titleKey: 'Customers', url: '/customers', icon: UserCog },
      { title: 'Due Collection', titleKey: 'Due Collection', url: '/due-management', icon: DollarSign },
      { title: 'Inventory', titleKey: 'Inventory', url: '/inventory', icon: Package },
      { title: 'Barcode Generator', titleKey: 'Barcode Generator', url: '/barcode-generator', icon: Package },
      { title: 'Label Testing Studio', titleKey: 'Label Testing Studio', url: '/label-testing', icon: Scan },
      { title: 'Purchase Returns', titleKey: 'Purchase Returns', url: '/purchase-return', icon: Package },
      { title: 'Expenses', titleKey: 'Expenses', url: '/expenses', icon: DollarSign },
      { title: 'WhatsApp', titleKey: 'WhatsApp', url: '/whatsapp-messenger', icon: Users },
    ],
  },
  {
    label: 'Reports & Settings',
    items: [
      { title: 'Sales Reports', titleKey: 'Reports', url: '/reports', icon: BarChart3 },
      { title: 'GST Reports', titleKey: 'GST Reports', url: '/gst-reports', icon: FileText },
      { title: 'Backup / Restore', titleKey: 'Backup / Restore', url: '/backup-restore', icon: Settings },
      { title: 'Admin Settings', titleKey: 'Admin Settings', url: '/admin-customization', icon: Settings },
      { title: 'Settings', titleKey: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];

export const AppSidebar: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const isActive = (url: string) => location.pathname === url;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src="./logo.png"
            alt="Durgas"
            className="h-10 w-10 object-contain rounded-lg bg-white p-0.5 shadow-sm border border-amber-200/50 shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-amber-500 leading-tight truncate">
                துர்காஸ்
              </span>
              <span className="font-display text-sm font-black tracking-tight text-sidebar-foreground uppercase leading-tight mt-0.5 truncate">
                Durgas
              </span>
              <span className="text-[9.5px] font-medium text-sidebar-foreground/70 truncate">
                Billing System
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {navGroups.map((group) => (
          <Collapsible key={group.label} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex cursor-pointer items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/70">
                  {!collapsed && group.label}
                  {!collapsed && (
                    <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.titleKey}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={collapsed ? t(item.titleKey) : undefined}
                        >
                          <NavLink
                            to={item.url}
                            onMouseEnter={() => preloadRoute(item.url)}
                            onFocus={() => preloadRoute(item.url)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                              isActive(item.url)
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>{t(item.titleKey)}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
