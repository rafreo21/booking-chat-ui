import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MenuCatalogProvider } from './menu/MenuCatalogContext'
import { HomePage } from './guest/pages/HomePage'
import { ManageReservationPage } from './guest/pages/ManageReservationPage'
import { ReservationPreviewPage } from './guest/pages/ReservationPreviewPage'
import { StaffPrepPage } from './guest/pages/StaffPrepPage'
import { RestaurantAuthCallbackPage } from './restaurant/pages/auth/RestaurantAuthCallbackPage'
import { RestaurantLoginPage } from './restaurant/pages/auth/RestaurantLoginPage'
import { RestaurantSignupPage } from './restaurant/pages/auth/RestaurantSignupPage'
import { RestaurantDashboardLayout } from './restaurant/pages/dashboard/RestaurantDashboardLayout'
import { RestaurantOverviewPage } from './restaurant/pages/dashboard/overview/RestaurantOverviewPage'
import { RestaurantMenuPage } from './restaurant/pages/dashboard/menu/RestaurantMenuPage'

export default function App() {
  return (
    <BrowserRouter>
      <MenuCatalogProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reservation/:reservationId/customize" element={<ManageReservationPage />} />
          <Route path="/reservation/:reservationId" element={<ReservationPreviewPage />} />
          <Route path="/staff/prep" element={<StaffPrepPage />} />

          <Route path="/restaurant/login" element={<RestaurantLoginPage />} />
          <Route path="/restaurant/signup" element={<RestaurantSignupPage />} />
          <Route path="/restaurant/auth/callback" element={<RestaurantAuthCallbackPage />} />
          <Route path="/restaurant" element={<Navigate to="/restaurant/dashboard" replace />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboardLayout />}>
            <Route index element={<RestaurantOverviewPage />} />
            <Route path="menu" element={<RestaurantMenuPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuCatalogProvider>
    </BrowserRouter>
  )
}
