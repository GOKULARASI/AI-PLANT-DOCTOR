import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, lazy, Suspense } from 'react';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';

// Layouts
import AppLayout from '@/components/layout/app-layout';
import AuthLayout from '@/components/layout/auth-layout';

// Eager-loaded pages
import Landing from '@/pages/landing';

// Lazy-loaded pages
const Login = lazy(() => import('@/features/auth/pages/login'));
const Register = lazy(() => import('@/features/auth/pages/register'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/forgot-password'));
const ResetPassword = lazy(() => import('@/features/auth/pages/reset-password'));
const VerifyEmail = lazy(() => import('@/features/auth/pages/verify-email'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/dashboard'));
const MyPlants = lazy(() => import('@/features/plants/pages/my-plants'));
const AddPlant = lazy(() => import('@/features/plants/pages/add-plant'));
const PlantDetail = lazy(() => import('@/features/plants/pages/plant-detail'));
const ScanDisease = lazy(() => import('@/features/disease-detection/pages/scan'));
const Treatment = lazy(() => import('@/features/treatment/pages/treatment'));
const Fertilizer = lazy(() => import('@/features/fertilizer/pages/fertilizer'));
const WaterScheduler = lazy(() => import('@/features/water-scheduler/pages/scheduler'));
const GrowthTracker = lazy(() => import('@/features/growth-tracker/pages/growth'));
const PlantLibrary = lazy(() => import('@/features/plant-library/pages/library'));
const DiseaseLibrary = lazy(() => import('@/features/disease-library/pages/diseases'));
const Chatbot = lazy(() => import('@/features/chatbot/pages/chat'));
const WeatherPage = lazy(() => import('@/features/weather/pages/weather'));
const Notifications = lazy(() => import('@/features/notifications/pages/notifications'));
const Reports = lazy(() => import('@/features/reports/pages/reports'));
const Profile = lazy(() => import('@/features/profile/pages/profile'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/admin-dashboard'));
const ManageUsers = lazy(() => import('@/features/admin/pages/manage-users'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
  },
});

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      <p style={{ color: 'var(--text-muted)' }} className="text-sm font-medium">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { theme } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Route>

            {/* Protected - Dashboard */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/plants" element={<MyPlants />} />
              <Route path="/plants/add" element={<AddPlant />} />
              <Route path="/plants/:id" element={<PlantDetail />} />
              <Route path="/scan" element={<ScanDisease />} />
              <Route path="/treatment" element={<Treatment />} />
              <Route path="/fertilizer" element={<Fertilizer />} />
              <Route path="/water-scheduler" element={<WaterScheduler />} />
              <Route path="/growth" element={<GrowthTracker />} />
              <Route path="/plant-library" element={<PlantLibrary />} />
              <Route path="/disease-library" element={<DiseaseLibrary />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
