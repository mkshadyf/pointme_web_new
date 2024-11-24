import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { MobileAppLayout } from '../layouts/MobileAppLayout';

const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/mobile/Services'));
const ServiceDetails = lazy(() => import('../pages/mobile/ServiceDetails'));
const Bookings = lazy(() => import('../pages/Bookings'));

export const mobileRoutes: RouteObject[] = [
  {
    element: <MobileAppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'services',
        children: [
          {
            index: true,
            element: <Services />,
          },
          {
            path: ':id',
            element: <ServiceDetails />,
          },
        ],
      },
      {
        path: 'bookings/*',
        element: <Bookings />,
      },
    ],
  },
]; 