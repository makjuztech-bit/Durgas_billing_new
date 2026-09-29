import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider, useData } from "@/contexts/DataContext";
import { Loader2 } from "lucide-react";

// Layouts
import { MainLayout } from "@/components/layout/MainLayout";

// Route-Level Code Splitting (Lazy-loaded chunks)
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SetupWizard = lazy(() => import("./pages/SetupWizard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Billing = lazy(() => import("./pages/Billing"));
const BillHistory = lazy(() => import("./pages/BillHistory"));
const StaffManagement = lazy(() => import("./pages/StaffManagement"));
const CustomerManagement = lazy(() => import("./pages/CustomerManagement"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Reports = lazy(() => import("./pages/Reports"));
const GstReports = lazy(() => import("./pages/GstReports"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const BarcodeGenerator = lazy(() => import("./pages/BarcodeGenerator"));
const LabelTestingStudioPage = lazy(() => import("./pages/LabelTestingStudioPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Missing / Orphaned Pages
const HoldBill = lazy(() => import("./pages/HoldBill"));
const DueManagement = lazy(() => import("./pages/DueManagement"));
const PurchaseReturn = lazy(() => import("./pages/PurchaseReturn"));
const AdminCustomization = lazy(() => import("./pages/AdminCustomization"));
const BackupRestore = lazy(() => import("./pages/BackupRestore"));
const WhatsappMessenger = lazy(() => import("./pages/WhatsappMessenger"));

const queryClient = new QueryClient();

// Elegant Page Loading Skeleton
const PageLoader = () => (
  <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="text-xs font-medium text-muted-foreground animate-pulse">Loading Durgas Billing...</span>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const ThemeInjector = () => {
  const { settings } = useData();
  
  React.useEffect(() => {
    if (settings?.primaryColor) {
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
    } else {
      document.documentElement.style.removeProperty('--primary');
    }

    if (settings?.backgroundPattern === 'minimal') {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = 'var(--background)';
    } else if (settings?.backgroundPattern === 'geometric') {
      document.body.style.backgroundImage = 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.05) 2px, transparent 0)';
      document.body.style.backgroundSize = '20px 20px';
    } else {
      // Default (Silk Texture or none)
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
    }
  }, [settings]);

  return null;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<SetupWizard />} />

        {/* Protected Routes with Main Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/bill-history" element={<BillHistory />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/barcode-generator" element={<BarcodeGenerator />} />
          <Route path="/label-testing" element={<LabelTestingStudioPage />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/gst-reports" element={<GstReports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hold-bills" element={<HoldBill />} />
          <Route path="/due-management" element={<DueManagement />} />
          <Route path="/purchase-return" element={<PurchaseReturn />} />
          <Route path="/admin-customization" element={<AdminCustomization />} />
          <Route path="/backup-restore" element={<BackupRestore />} />
          <Route path="/whatsapp-messenger" element={<WhatsappMessenger />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <ThemeInjector />
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
            </HashRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
