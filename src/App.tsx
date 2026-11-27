import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'

// Pages are split into their own chunks; the chart library only loads with the pages that use it.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const TripsPage = lazy(() => import('./pages/TripsPage').then((m) => ({ default: m.TripsPage })))
const DriversPage = lazy(() => import('./pages/DriversPage').then((m) => ({ default: m.DriversPage })))
const DriverDetailPage = lazy(() => import('./pages/DriverDetailPage').then((m) => ({ default: m.DriverDetailPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
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
