import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import PrivateRoute from '../components/PrivateRoute';
import LoadingScreen from '../components/LoadingScreen';
import Login from '../pages/Login';
import Signup from '../pages/CustomerSignup';
import BusinessSignup from '../pages/BusinessSignup';

// Lazy load components
const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/Services'));
const ServiceDetails = lazy(() => import('../pages/ServiceDetails'));
const Businesses = lazy(() => import('../pages/Businesses'));
const BusinessDetails = lazy(() => import('../pages/BusinessDetails'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Categories = lazy(() => import('../pages/Categories'));
const CategoryDetails = lazy(() => import('../pages/CategoryDetails'));

// Admin routes
const AdminDashboard = lazy(() => import('../pages/Admin'));
const AdminUsers = lazy(() => import('../pages/Admin/UserManagement'));
const AdminServices = lazy(() => import('../pages/Admin/Services'));
const AdminBookings = lazy(() => import('../pages/Admin/Bookings'));
const AdminCategories = lazy(() => import('../pages/Admin/Categories'));

// Business routes
const BusinessDashboard = lazy(() => import('../pages/Business'));
const BusinessServices = lazy(() => import('../pages/Business/Services'));
const BusinessBookings = lazy(() => import('../pages/Business/Bookings'));
const BusinessStaff = lazy(() => import('../pages/Business/Staff'));
const BusinessAnalytics = lazy(() => import('../pages/Business/Analytics'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<LoadingScreen />}><Home /></Suspense> },
      { path: 'services', element: <Suspense fallback={<LoadingScreen />}><Services /></Suspense> },
      { path: 'services/:id', element: <Suspense fallback={<LoadingScreen />}><ServiceDetails /></Suspense> },
      { path: 'businesses', element: <Suspense fallback={<LoadingScreen />}><Businesses /></Suspense> },
      { path: 'businesses/:id', element: <Suspense fallback={<LoadingScreen />}><BusinessDetails /></Suspense> },
      { path: 'categories', element: <Suspense fallback={<LoadingScreen />}><Categories /></Suspense> },
      { path: 'categories/:id', element: <Suspense fallback={<LoadingScreen />}><CategoryDetails /></Suspense> },
      {
        path: 'bookings',
        element: (
          <PrivateRoute allowedRoles={['client']}>
            <Suspense fallback={<LoadingScreen />}>
              <Bookings />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <PrivateRoute allowedRoles={['admin', 'super_admin']}>
            <Suspense fallback={<LoadingScreen />}>
              <AdminDashboard />
            </Suspense>
          </PrivateRoute>
        ),
        children: [
          { path: 'users', element: <AdminUsers /> },
          { path: 'services', element: <AdminServices /> },
          { path: 'bookings', element: <AdminBookings /> },
          { path: 'categories', element: <AdminCategories /> },
        ],
      },
      {
        path: 'business',
        element: (
          <PrivateRoute allowedRoles={['provider']}>
            <Suspense fallback={<LoadingScreen />}>
              <BusinessDashboard />
            </Suspense>
          </PrivateRoute>
        ),
        children: [
          { path: 'services', element: <BusinessServices /> },
          { path: 'bookings', element: <BusinessBookings /> },
          { path: 'staff', element: <BusinessStaff /> },
          { path: 'analytics', element: <BusinessAnalytics /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'signup/business', element: <BusinessSignup /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
} 