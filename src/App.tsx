import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MenuCatalogProvider } from './menu/MenuCatalogContext'
import { HomePage } from './pages/HomePage'
import { ManageReservationPage } from './pages/ManageReservationPage'
import { ReservationPreviewPage } from './pages/ReservationPreviewPage'
import { RestaurantAuthCallbackPage } from './pages/RestaurantAuthCallbackPage'
import { RestaurantDashboardPage } from './pages/RestaurantDashboardPage'
import { RestaurantLoginPage } from './pages/RestaurantLoginPage'
import { RestaurantSignupPage } from './pages/RestaurantSignupPage'
import { StaffPrepPage } from './pages/StaffPrepPage'

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
          <Route path="/restaurant" element={<RestaurantDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuCatalogProvider>
    </BrowserRouter>
  )
}
