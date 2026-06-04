import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../../auth/pages/LoginPage'; 

// 📝 Cleaned up properties: Removing the custom parent view-switching callback 
interface DashboardProps {
  // If your CompanyPortalPage requires a direct logout callback, keep it here:
  onLogout?: () => void;
}

export default function DashboardOverviewPage({ onLogout }: DashboardProps) {
  const navigate = useNavigate();

  // --- COMPONENT ARCHITECTURE STATES ---
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [loggedInStaffId, setLoggedInStaffId] = useState(() => localStorage.getItem('staff_id') || '');
  
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('company_name') || 'No Active Workspace Found');
  const [companyId, setCompanyId] = useState(() => localStorage.getItem('company_id') || 'No ID Tracked');

  useEffect(() => {
    const activeId = localStorage.getItem('company_id');
    const activeName = localStorage.getItem('company_name');
    const activeStaff = localStorage.getItem('staff_id');

    if (activeId) setCompanyId(activeId);
    if (activeName) setCompanyName(activeName);
    if (activeStaff) setLoggedInStaffId(activeStaff);
  }, [showStaffLogin]);

  const handleStaffLoginSuccess = (staffId: string) => {
    setLoggedInStaffId(staffId);
    setShowStaffLogin(false);
  };

  const handleStaffLogout = () => {
    localStorage.removeItem('staff_id');
    localStorage.removeItem('token_role');
    setLoggedInStaffId('');
  };

  const handleGlobalPortalDisconnect = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans selection:bg-blue-200 relative w-full">
      
      {/* POPUP INTERCEPTOR MODAL SYSTEM */}
      {showStaffLogin && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-800 p-2 rounded-2xl border border-slate-700 max-w-md w-full relative">
            <button 
              onClick={() => setShowStaffLogin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-xs z-[10000] cursor-pointer"
            >
              ✕ CANCEL
            </button>
            <LoginPage 
              dashboardCompanyId={companyId}
              onLoginSuccess={handleStaffLoginSuccess} 
            />
          </div>
        </div>
      )}

      {/* HEADER PANEL */}
      <header className="bg-[#7884b0] text-white py-8 px-6 md:px-12 relative shadow-md flex justify-between items-center">
        <div className="flex flex-col items-center group relative z-20">
          <button 
            onClick={() => !loggedInStaffId && setShowStaffLogin(true)}
            className={`w-14 h-14 rounded-full border-2 border-white shadow-inner flex items-center justify-center text-xl transition-all ${
              loggedInStaffId 
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400' 
                : 'bg-[#e2e8f0] text-[#475569] hover:bg-blue-100 hover:text-blue-600 cursor-pointer'
            }`}
            title={loggedInStaffId ? "Staff Member Verified" : "Click to Authenticate"}
          >
            {loggedInStaffId ? '✅' : '👤'}
          </button>
          <span className="mt-1 bg-slate-950/20 text-white font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-sm tracking-wide">
            {loggedInStaffId ? `ID: ${loggedInStaffId}` : 'Offline'}
          </span>
          {loggedInStaffId && (
            <button
              onClick={handleStaffLogout}
              className="mt-1.5 text-[10px] font-mono font-bold tracking-wider text-rose-200 hover:text-rose-400 transition-colors uppercase cursor-pointer flex items-center gap-1 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-500/20 shadow-sm"
            >
              ❌ Log Out
            </button>
          )}
        </div>

        <div className="text-center flex-grow">
          <h1 className="text-3xl md:text-4xl font-normal tracking-wide uppercase drop-shadow-sm">
            Welcome To
          </h1>
          <p className="text-lg md:text-xl font-medium tracking-widest mt-1 opacity-90 font-mono">
            SHOP-VERSE MANAGEMENT SYSTEM
          </p>
          <div className="mt-2 text-xs font-mono text-blue-200 bg-slate-950/30 px-4 py-1.5 inline-flex flex-col gap-0.5 rounded-xl border border-white/10 uppercase tracking-wider shadow-inner">
            <div>🏢 Workspace: <span className="text-white font-sans font-bold normal-case">{companyName}</span></div>
          </div>
        </div>

        <div className="relative z-20">
          <button
            onClick={handleGlobalPortalDisconnect}
            className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200 bg-slate-950/20 hover:bg-slate-950/40 rounded border border-white/10 transition-colors cursor-pointer"
          >
            🔌 Disconnect Portal
          </button>
        </div>
      </header>

      {/* DYNAMIC HUB CONTENT GRID */}
      <main className="flex-grow p-6 md:p-10 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* CARD 1: OVERVIEW */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">01 / Pulse</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Overview</h3>
            </div>
            <div className="h-28 flex items-end gap-1 px-2 pt-4 bg-slate-50 rounded-lg border border-slate-100 relative">
              <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">Sales Trend Graph Array</div>
              <div className="w-full bg-blue-400/20 h-[40%] rounded-t-sm transition-all group-hover:bg-blue-400/40"></div>
              <div className="w-full bg-blue-400/20 h-[65%] rounded-t-sm transition-all group-hover:bg-blue-400/40"></div>
              <div className="w-full bg-blue-400/20 h-[50%] rounded-t-sm transition-all group-hover:bg-blue-400/40"></div>
              <div className="w-full bg-blue-500/40 h-[85%] rounded-t-sm font-mono text-[9px] text-center text-blue-700 font-bold pt-1">Peak</div>
              <div className="w-full bg-blue-400/20 h-[60%] rounded-t-sm transition-all group-hover:bg-blue-400/40"></div>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/tech/comp') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Overview' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 2: SALES */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">02 / Live Ledger</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Sales</h3>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-mono font-bold text-emerald-600 tracking-tight">RM,225,000.00</div>
              <p className="text-xs text-slate-400 font-medium font-mono">Today's Revenue Metrics Profile (+1.02%)</p>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/sales') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Sales' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 3: SALES HISTORY */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">03 / Analytics</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Sales History</h3>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg font-mono text-xs text-slate-500 space-y-1">
              <div className="flex justify-between"><span>Annual Stock Flow:</span> <span className="font-bold text-slate-700">32%</span></div>
              <div className="flex justify-between"><span>Audit Integrity Index:</span> <span className="text-blue-600 font-bold">100% Secure</span></div>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/sales-history') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Sales History' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 4: INVENTORY */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">04 / Stock Node</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Inventory</h3>
            </div>
            <div className="flex items-end justify-between h-24 gap-2 pt-4 px-2 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="bg-slate-300 h-[80%] w-full rounded-t-sm"></div>
              <div className="bg-slate-400 h-[40%] w-full rounded-t-sm"></div>
              <div className="bg-slate-300 h-[65%] w-full rounded-t-sm"></div>
              <div className="bg-slate-400 h-[60%] w-full rounded-t-sm"></div>
              <div className="bg-slate-500 h-[90%] w-full rounded-t-sm"></div>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/inventory') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Inventory' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 5: ORDERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">05 / Pipeline</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Orders</h3>
            </div>
            <div className="divide-y divide-slate-100 font-mono text-xs">
              <div className="py-1.5 flex justify-between"><span>Today's Revenue:</span><span className="font-semibold text-slate-700">$4,400.00</span></div>
              <div className="py-1.5 flex justify-between"><span>Total Processing:</span><span className="font-semibold text-slate-700">255 Units</span></div>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/orders') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Orders' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 6: SUPPLIERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">06 / Vendors</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Suppliers</h3>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center p-1.5 bg-amber-50 rounded border border-amber-100 text-amber-800">
                <span>Inbound Delivery Array</span> <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>
              </div>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/suppliers') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Suppliers' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 7: CUSTOMERS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between lg:col-span-1">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">07 / CRM Engine</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Customers</h3>
            </div>
            <div className="space-y-2 font-mono text-xs text-slate-500">
              <div className="flex justify-between items-center">
                <span>Active Profiles:</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Loyal Tier Linked</span>
              </div>
            </div>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/customers') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Customers' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

        {/* CARD 8: SUPPORT */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden group transition-all hover:shadow-xl flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">08 / Helpdesk</span>
              <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">Support</h3>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              Connected Terminal: Secure SSL Operational Handshake verified. Reach out directly to system engineers for component deployments or workspace configuration anomalies.
            </p>
          </div>
          <div 
            onClick={() => loggedInStaffId ? navigate('/dashboard/support') : setShowStaffLogin(true)}
            className="absolute inset-0 bg-[#9aa4c7]/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer z-10 p-6"
          >
            <div className="bg-[#8390b9] text-white font-mono text-lg font-bold py-4 px-8 rounded-xl shadow-lg border border-white/30 transform scale-90 group-hover:scale-100 transition-transform duration-300 tracking-widest uppercase text-center w-full max-w-[240px]">
              {loggedInStaffId ? 'Support' : '🔒 Auth Required'}
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER STATUS STRIP */}
      <footer className="bg-[#7884b0] text-white/90 text-center py-4 px-4 text-xs font-mono border-t border-white/10 tracking-wider flex flex-wrap justify-center items-center gap-2 md:gap-6 shadow-inner">
        <span>⚡ Shop-verse v4.0</span>
        <span className="hidden md:inline">|</span>
        <span>Lite Edition</span>
        <span className="hidden md:inline">|</span>
        <span>© 2026 Management Systems</span>
        <span className="hidden md:inline">|</span>
        <a href="mailto:sales@shop-verse.ng" className="hover:text-white transition-colors underline decoration-white/30">sales@shop-verse.ng</a>
        <span className="hidden md:inline">|</span>
        <span className="text-slate-100 font-bold">+243 813 8529 746</span>
      </footer>
    </div>
  );
}