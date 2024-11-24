import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/LoadingScreen';
import { NavigationProvider } from './contexts/NavigationContext';
import { queryClient } from './lib/queryClient';
import { useQueryError } from './hooks/useQueryError';
import { registerServiceWorker, checkForUpdate } from './lib/pwa';
import { syncService } from './services/syncService';
import { pushNotifications } from './services/pushNotifications';
import { notificationService } from './services/notificationService';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const CustomerSignup = lazy(() => import('./pages/CustomerSignup'));
const BusinessSignup = lazy(() => import('./pages/BusinessSignup'));
const Services = lazy(() => import('./pages/Services'));
const Admin = lazy(() => import('./pages/Admin'));
const Business = lazy(() => import('./pages/Business'));
const Bookings = lazy(() => import('./pages/Bookings'));

function AppContent() {
  useQueryError(); // Add global error handling

  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    
    // Initialize notifications
    notificationService.init().catch(console.error);
    
    // Initialize offline sync
    syncService.init().catch(console.error);
    
    // Check for updates every hour
    const interval = setInterval(checkForUpdate, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <NavigationProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/signup/customer" element={<CustomerSignup />} />
                <Route path="/signup/business" element={<BusinessSignup />} />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                      <Admin />
                    </PrivateRoute>
                  }
                />

                {/* Business Routes */}
                <Route
                  path="/business/*"
                  element={
                    <PrivateRoute allowedRoles={['provider']}>
                      <Business />
                    </PrivateRoute>
                  }
                />

                {/* Main Layout Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="services" element={<Services />} />
                  <Route
                    path="bookings"
                    element={
                      <PrivateRoute allowedRoles={['client']}>
                        <Bookings />
                      </PrivateRoute>
                    }
                  />
                  {/* Add more routes as needed */}
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                error: {
                  duration: 10000,
                },
              }} 
            />
          </NavigationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}