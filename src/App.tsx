import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MenuCatalogProvider } from './menu/MenuCatalogContext'
import { HomePage } from './pages/HomePage'
import { ManageReservationPage } from './pages/ManageReservationPage'
import { StaffPrepPage } from './pages/StaffPrepPage'

export default function App() {
  return (
    <BrowserRouter>
      <MenuCatalogProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reservation/:reservationId" element={<ManageReservationPage />} />
          <Route path="/staff/prep" element={<StaffPrepPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuCatalogProvider>
    </BrowserRouter>
  )
}
