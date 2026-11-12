import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CustomerRecord {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateJoined: string;
  totalPurchases: number;
  loyaltyPoints: number;
  tier: 'Gold' | 'Silver' | 'Platinum' | 'Bronze';
  status: 'Active' | 'Inactive';
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const [staffId] = useState(() => localStorage.getItem('staff_id') || 'Offline');
  
  const [customers] = useState<CustomerRecord[]>([
    { id: 'CUST-001', firstName: 'Adaeze', lastName: 'Okonkwo', phone: '08011111111', email: 'adaeze@gmail.com', dateJoined: '01-Jan-2025', totalPurchases: 85000, loyaltyPoints: 850, tier: 'Gold', status: 'Active' },
    { id: 'CUST-002', firstName: 'Babatunde', lastName: 'Fashola', phone: '08022222222', email: 'baba@yahoo.com', dateJoined: '15-Jan-2025', totalPurchases: 45000, loyaltyPoints: 450, tier: 'Silver', status: 'Active' },
    { id: 'CUST-003', firstName: 'Chiamaka', lastName: 'Eze', phone: '08033333333', email: 'chiama@gmail.com', dateJoined: '20-Jan-2025', totalPurchases: 120000, loyaltyPoints: 1200, tier: 'Platinum', status: 'Active' },
    { id: 'CUST-004', firstName: 'David', lastName: 'Nwosu', phone: '08044444444', email: 'david@hotmail.com', dateJoined: '05-Feb-2025', totalPurchases: 22000, loyaltyPoints: 220, tier: 'Bronze', status: 'Active' },
    { id: 'CUST-005', firstName: 'Emeka', lastName: 'Uba', phone: '08055555555', email: 'emeka@gmail.com', dateJoined: '10-Feb-2025', totalPurchases: 67000, loyaltyPoints: 670, tier: 'Silver', status: 'Active' },
    { id: 'CUST-006', firstName: 'Fatima', lastName: 'Abdullahi', phone: '08066666666', email: 'fatima@gmail.com', dateJoined: '14-Feb-2025', totalPurchases: 155000, loyaltyPoints: 1550, tier: 'Platinum', status: 'Active' },
    { id: 'CUST-007', firstName: 'Grace', lastName: 'Okafor', phone: '08077777777', email: 'grace@gmail.com', dateJoined: '20-Feb-2025', totalPurchases: 18000, loyaltyPoints: 180, tier: 'Bronze', status: 'Active' },
    { id: 'CUST-008', firstName: 'Hassan', lastName: 'Ibrahim', phone: '08088888888', email: 'hassan@gmail.com', dateJoined: '25-Feb-2025', totalPurchases: 9000, loyaltyPoints: 90, tier: 'Bronze', status: 'Inactive' },
  ]);

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      {/* HEADER PANEL */}
      <header className="bg-[#7884b0] text-white py-6 px-6 text-center relative shadow-md">
        <h1 className="text-3xl font-normal tracking-wide uppercase">CUSTOMERS</h1>
        <p className="text-sm font-medium tracking-widest mt-1 opacity-90 font-mono">SHOP-VERSE MANAGEMENT SYSTEM</p>
      </header>

      {/* CORE WORKSPACE */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full relative flex flex-col items-center">
        {/* BACK ARROW CONTROL */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-6 text-slate-700 hover:text-slate-900 transition-transform hover:scale-105 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer z-50"
        >
          ↩ BACK TO DASHBOARD
        </button>


        {/* ORANGE BANNER CARD HEADER */}
        <div className="w-full bg-[#f97316] text-white p-4 rounded-t-xl shadow-md mt-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <h2 className="text-2xl font-bold tracking-wider uppercase">Customer Database & Loyalty</h2>
          </div>
          <p className="text-xs font-mono mt-1 opacity-90 italic">
            Customer Profiles &nbsp;|&nbsp; Purchase History &nbsp;|&nbsp; Loyalty Points
          </p>
        </div>

        {/* CUSTOMER LEDGER TABLE */}
        <div className="w-full bg-white border border-slate-300 shadow-md rounded-b-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#f97316] text-white font-bold uppercase border-t border-orange-400">
                <th className="p-2.5 border-r border-orange-400/30">Customer ID</th>
                <th className="p-2.5 border-r border-orange-400/30">First Name</th>
                <th className="p-2.5 border-r border-orange-400/30">Last Name</th>
                <th className="p-2.5 border-r border-orange-400/30">Phone</th>
                <th className="p-2.5 border-r border-orange-400/30">Email</th>
                <th className="p-2.5 border-r border-orange-400/30">Date Joined</th>
                <th className="p-2.5 border-r border-orange-400/30 text-right">Total Purchases</th>
                <th className="p-2.5 border-r border-orange-400/30 text-center">Loyalty Points</th>
                <th className="p-2.5 border-r border-orange-400/30 text-center">Tier</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
              {customers.map((cust, idx) => (
                <tr key={cust.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{cust.id}</td>
                  <td className="p-2.5 border-r border-slate-200 font-sans">{cust.firstName}</td>
                  <td className="p-2.5 border-r border-slate-200 font-sans">{cust.lastName}</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-700 font-bold">{cust.phone}</td>
                  <td className="p-2.5 border-r border-slate-200 font-sans lowercase">{cust.email}</td>
                  <td className="p-2.5 border-r border-slate-200 text-slate-500">{cust.dateJoined}</td>
                  <td className="p-2.5 border-r border-slate-200 text-right font-bold text-slate-900">₦{cust.totalPurchases.toLocaleString()}.00</td>
                  <td className="p-2.5 border-r border-slate-200 text-center font-bold text-blue-700">{cust.loyaltyPoints}</td>
                  <td className="p-2.5 border-r border-slate-200 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cust.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                      cust.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                      cust.tier === 'Silver' ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
                    }`}>{cust.tier}</span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`font-sans font-bold text-[11px] ${cust.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {cust.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COMING SOON FOOTNOTE BLOCK */}
        <div className="my-8 text-center">
          <h3 className="text-xl font-mono tracking-widest text-slate-500 font-bold uppercase animate-pulse">
            COMING SOON...
          </h3>
        </div>
      </main>

      {/* SYSTEM FOOTER */}
      <footer className="bg-[#7884b0] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-center items-center shadow-inner relative border-t border-white/10">
        <div className="bg-slate-950/20 px-3 py-1 rounded border border-white/10 flex items-center gap-1.5">
          <span>👤 AUTHORIZED SESSION ID:</span> <span className="font-bold text-emerald-300">{staffId}</span>
        </div>
        <div className="flex gap-4 opacity-90 text-[11px]">
          <span>⚡ Secure Node Segment</span>
          <span className="hidden sm:inline">|</span>
          <span>© 2026 Shop-Verse</span>
        </div>
      </footer>
    </div>
  );
}