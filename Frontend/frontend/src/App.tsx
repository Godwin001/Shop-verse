import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StaffManagementPage from './features/client-portal/pages/StaffManagementPage';
import CompanyDirectoryPage from './features/technician-portal/pages/CompanyDirectoryPage.tsx';
import CompanyStaffPage from './features/technician-portal/pages/CompanyStaffPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Client Side Route */}
        <Route path="/client/staff" element={<StaffManagementPage />} />
        
        {/* Technician Side Route - Entirely separate look, feel, and logic */}
        <Route path="/tech/companies" element={<CompanyDirectoryPage />} />
        <Route path="/tech/companies/:companyId" element={<CompanyStaffPage />} />
      </Routes>
    </BrowserRouter>
  );
}