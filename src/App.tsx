import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'

// Pages are split into their own chunks; the chart library only loads with the pages that use it.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const TripsPage = lazy(() => import('./pages/TripsPage').then((m) => ({ default: m.TripsPage })))
const DriversPage = lazy(() => import('./pages/DriversPage').then((m) => ({ default: m.DriversPage })))
const DriverDetailPage = lazy(() => import('./pages/DriverDetailPage').then((m) => ({ default: m.DriverDetailPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="login"
          element={
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="drivers/:driverId" element={<DriverDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
