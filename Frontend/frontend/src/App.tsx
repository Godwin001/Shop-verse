import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StaffManagementPage from './features/client-portal/pages/StaffManagementPage';
import CompanyPortalPage from './features/client-portal/pages/CompanyPortalPage'; 
import CompanyDirectoryPage from './features/technician-portal/pages/CompanyDirectoryPage'; // Cleaned .tsx extension
import CompanyStaffPage from './features/technician-portal/pages/CompanyStaffPage';
import LoginPage from './features/auth/pages/LoginPage'; 
import DashboardOverviewPage from './features/client-portal/pages/DashboardOverviewPage'; 
import InventorySubsystem from './features/client-portal/pages/inventory/InventorySubsystem';
import SalesHubPage from './features/client-portal/pages/sales/SalesHubPage';
import OrdersPage from './features/client-portal/pages/OrdersPage';
import SuppliersPage from './features/client-portal/pages/SuppliersPage';
import CustomersPage from './features/client-portal/pages/CustomersPage';
import RaiseOrderPage from './features/client-portal/pages/RaiseOrderPage';
import SalesHistoryPage from './features/client-portal/pages/sales/SalesHistoryPage';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* --- Gateway: Company Identity Login --- */}
        <Route path="/" element={<CompanyPortalPage />} /> 

        {/* --- Step 2: Staff Verification Credentials Portal --- */}
        <Route path="/login_portal" element={<LoginPage />} /> 

        {/* --- Main Management Systems Hub Grid --- */}
        <Route path="/dashboard" element={<DashboardOverviewPage />} /> 

        {/* 🔑 Ensure this exact path inventory */}
        <Route path="/dashboard/inventory" element={<InventorySubsystem />} />

        {/* 🔑 Ensure this exact path sale */}
        <Route path="/dashboard/sales" element={<SalesHubPage />} />

        {/* 🔑 Ensure this exact path sale history */}
        <Route path="/dashboard/sales-history" element={<SalesHistoryPage />} />

        {/* 🔑 Ensure this exact path orders */}
        <Route path="/dashboard/orders" element={<OrdersPage />} />

        {/* 🔑 Ensure this exact path suppliers */}
        <Route path="/dashboard/suppliers" element={<SuppliersPage />} />

        {/* 🔑 Ensure this exact path customers */}
        <Route path="/dashboard/customers" element={<CustomersPage />} />

        {/* 🔑 Ensure this exact path raise orders */}
        <Route path="/dashboard/orders/raise-orders" element={<RaiseOrderPage />} />

           {/* 🔑 Ensure this exact path customers */}
        <Route path="/dashboard/support" element={<StaffManagementPage />} />






        {/* --- Secondary Action Panels --- */}
        <Route path="/company/add_staff" element={<StaffManagementPage />} /> 
        
        {/* --- Technician Core Workspace Profiles --- */}
        <Route path="/tech/companies" element={<CompanyDirectoryPage />} />
        <Route path="/tech/companies/:companyId" element={<CompanyStaffPage />} />

        {/* --- Optional Safety Catch-All Fallback (Saves you from blank screen freezes) --- */}
        <Route path="*" element={<CompanyPortalPage />} />

      </Routes>
    </BrowserRouter>
  );
}