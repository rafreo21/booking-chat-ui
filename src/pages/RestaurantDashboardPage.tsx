import { Navigate, Route, Routes } from 'react-router-dom'
import { RestaurantDashboardLayout } from '@/restaurant/pages/dashboard/RestaurantDashboardLayout'
import { RestaurantMenuPage } from '@/restaurant/pages/dashboard/menu/RestaurantMenuPage'
import { RestaurantOverviewPage } from '@/restaurant/pages/dashboard/overview/RestaurantOverviewPage'

export function RestaurantDashboardPage() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<RestaurantDashboardLayout />}>
        <Route index element={<RestaurantOverviewPage />} />
        <Route path="menu" element={<RestaurantMenuPage />} />
      </Route>
    </Routes>
  )
}
