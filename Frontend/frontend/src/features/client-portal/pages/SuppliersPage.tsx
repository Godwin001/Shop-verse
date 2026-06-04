import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface SupplierRecord {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  leadTime: number;
  creditTerms: string;
  totalOrders: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
}

// Hardcoded seed data used ONLY if the user hasn't saved anything to localStorage yet
const INITIAL_SUPPLIERS: SupplierRecord[] = [
  { code: 'SUP-001', name: 'AloFood Ltd', contactPerson: 'Mr. Aloke James', phone: '08012345678', email: 'aloke@alofood.com', address: '12 Lagos St, Ikeja', category: 'Dry Food', leadTime: 7, creditTerms: 'Net 30', totalOrders: 45, lastOrderDate: '10-Mar-2025', status: 'Active' },
  { code: 'SUP-002', name: 'NBC Nigeria', contactPerson: 'Mrs. Ngozi Eze', phone: '08023456789', email: 'ngozi@nbc.ng', address: '15 Apapa Rd, Lagos', category: 'Beverages', leadTime: 5, creditTerms: 'Net 14', totalOrders: 120, lastOrderDate: '12-Mar-2025', status: 'Active' },
  { code: 'SUP-003', name: 'Unilever Nig', contactPerson: 'Mr. Tunde Badmus', phone: '08034567890', email: 'tunde@unilever.ng', address: 'Oregun, Lagos', category: 'Household', leadTime: 10, creditTerms: 'Net 30', totalOrders: 88, lastOrderDate: '08-Mar-2025', status: 'Active' },
  { code: 'SUP-004', name: 'FrieslandCamp', contactPerson: 'Mrs. Ada Obi', phone: '08045678901', email: 'ada@friesland.ng', address: '50 Ojota, Lagos', category: 'Dairy', leadTime: 7, creditTerms: 'Net 21', totalOrders: 33, lastOrderDate: '05-Mar-2025', status: 'Active' },
  { code: 'SUP-005', name: 'FMN Nigeria', contactPerson: 'Mr. Emeka Nweze', phone: '08056789012', email: 'emeka@fmn.ng', address: 'FMN House, Apapa', category: 'Dry Food', leadTime: 14, creditTerms: 'Net 45', totalOrders: 22, lastOrderDate: '01-Mar-2025', status: 'Active' },
  { code: 'SUP-006', name: 'Nestle Nigeria', contactPerson: 'Ms. Kemi Alade', phone: '08067890123', email: 'kemi@nestle.ng', address: '22-24 Industrial Ave', category: 'Multiple', leadTime: 7, creditTerms: 'Net 30', totalOrders: 67, lastOrderDate: '15-Mar-2025', status: 'Active' },
  { code: 'SUP-007', name: 'Dangote Ind', contactPerson: 'Mr. Gbenga Ojo', phone: '08078901234', email: 'gbenga@dangote.com', address: 'Dangote House, VI', category: 'Dry Food', leadTime: 5, creditTerms: 'Cash', totalOrders: 200, lastOrderDate: '13-Mar-2025', status: 'Active' },
  { code: 'SUP-008', name: 'Reckitt Benck', contactPerson: 'Mrs. Fatima B.', phone: '08089012345', email: 'fatima@rb.com', address: '10 Broad St, Lagos', category: 'Pharmacy', leadTime: 10, creditTerms: 'Net 30', totalOrders: 41, lastOrderDate: '09-Mar-2025', status: 'Active' },
];

const getUniqueCategories = (suppliers: SupplierRecord[]): string[] => {
  const defaults = ['Dry Food', 'Beverages', 'Household', 'Dairy', 'Multiple', 'Pharmacy', 'General Store'];
  const existing = suppliers
    .map(s => s.category)
    .filter((cat): cat is string => !!cat && cat.trim() !== '');

  return Array.from(new Set([...defaults, ...existing])).sort();
};

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [staffId] = useState(() => localStorage.getItem('staff_id') || 'Offline');

  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(() => {
    const saved = localStorage.getItem('shopverse_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', phone: '', email: '',
    address: '', category: '', leadTime: '', creditTerms: 'Cash'
  });

  const availableCategories = useMemo(() => getUniqueCategories(suppliers), [suppliers]);

  useEffect(() => {
    localStorage.setItem('shopverse_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextIndex = suppliers.length + 1;
    const computedCode = `SUP-${String(nextIndex).padStart(3, '0')}`;

    const newSupplier: SupplierRecord = {
      code: computedCode,
      name: formData.name,
      contactPerson: formData.contactPerson || 'N/A',
      phone: formData.phone || 'N/A',
      email: formData.email || 'N/A',
      address: formData.address || 'N/A',
      category: formData.category || 'General Store',
      leadTime: parseInt(formData.leadTime) || 0,
      creditTerms: formData.creditTerms,
      totalOrders: 0,
      lastOrderDate: 'None Listed',
      status: 'Active'
    };

    setSuppliers(prev => [...prev, newSupplier]);
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '', category: '', leadTime: '', creditTerms: 'Cash' });
    setIsAdding(false);
  };

  // 🗑️ Purge specific instance from matrix collection
  const handleDelete = (code: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} (${code}) from the database?`)) {
      setSuppliers(prev => prev.filter(sup => sup.code !== code));
    }
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      <header className="bg-[#7884b0] text-white py-6 px-6 text-center relative shadow-md">
        <h1 className="text-3xl font-normal tracking-wide uppercase">
          {isAdding ? 'Onboard New Vendor' : 'SUPPLIERS LIST'}
        </h1>
        <p className="text-sm font-medium tracking-widest mt-1 opacity-90 font-mono">SHOP-VERSE MANAGEMENT SYSTEM</p>
      </header>

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full relative flex flex-col items-center justify-start gap-6">
        
        <button 
          onClick={() => isAdding ? setIsAdding(false) : navigate('/dashboard')}
          className="absolute top-4 left-6 text-slate-700 hover:text-slate-900 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer z-50"
        >
          {isAdding ? '↩ CANCEL AND RETURN' : '↩ BACK TO DASHBOARD'}
        </button>

        {isAdding ? (
          /* ============================================================================
              INPUT GRID PROFILE SUBMISSION ARCHITECTURE
             ============================================================================ */
          <div className="w-full max-w-2xl bg-white border border-slate-300 shadow-xl rounded-xl p-6 mt-6 font-mono text-xs">
            <div className="bg-[#4c1d95] text-white px-4 py-2.5 rounded-lg text-center font-bold text-sm tracking-widest uppercase mb-6">
              Supplier Matrix Entry Form
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Supplier Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Dangote Dist." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-sans text-sm" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Contact Representative Name</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-sans text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Phone String Link</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. 0801234..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Email Endpoint Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="e.g. contact@firm.ng" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Physical Warehouse / Corporate Location</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Complete physical logistics vector route..." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-sans text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Category Type</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-sans text-xs font-semibold text-slate-700 h-[38px]"
                  >
                    <option value="">-- CHOOSE CATEGORY --</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Lead Time (Days)</label>
                  <input type="number" name="leadTime" value={formData.leadTime} onChange={handleInputChange} placeholder="e.g. 7" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold uppercase mb-1">Credit Arrangements</label>
                  <select name="creditTerms" value={formData.creditTerms} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold text-slate-700 text-xs h-[38px]">
                    <option value="Cash">Cash Basis</option>
                    <option value="Net 14">Net 14 Days</option>
                    <option value="Net 21">Net 21 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-grow py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl tracking-wider uppercase transition-colors cursor-pointer shadow-md text-sm">
                  Commit Supplier Entry
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="py-3.5 px-6 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl tracking-wider uppercase transition-colors cursor-pointer shadow-md text-sm">
                  Abort
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ============================================================================
              DATA LEDGER VIEW
             ============================================================================ */
          <>
            <div className="w-full bg-white border border-slate-300 shadow-xl rounded-xl overflow-x-auto mt-6">
              <table className="w-full text-left text-xs font-mono border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-[#4c1d95] text-white font-bold uppercase text-[11px] tracking-wider text-center">
                    <th className="p-2.5 border-r border-purple-900">Supplier Code</th>
                    <th className="p-2.5 border-r border-purple-900 text-left px-3">Supplier Name</th>
                    <th className="p-2.5 border-r border-purple-900 text-left px-3">Contact Person</th>
                    <th className="p-2.5 border-r border-purple-900">Phone</th>
                    <th className="p-2.5 border-r border-purple-900 text-left px-3">Email</th>
                    <th className="p-2.5 border-r border-purple-900 text-left px-3">Address</th>
                    <th className="p-2.5 border-r border-purple-900">Category Supplied</th>
                    <th className="p-2.5 border-r border-purple-900">Lead Time (Days)</th>
                    <th className="p-2.5 border-r border-purple-900">Credit Terms</th>
                    <th className="p-2.5 border-r border-purple-900">Total Orders</th>
                    <th className="p-2.5 border-r border-purple-900">Last Order Date</th>
                    <th className="p-2.5 border-r border-purple-900">Status</th>
                    <th className="p-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 text-center">
                  {suppliers.map((sup, idx) => (
                    <tr key={sup.code} className={`hover:bg-purple-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900 bg-slate-100/30">{sup.code}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-slate-800 text-left px-3">{sup.name}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans text-left px-3">{sup.contactPerson}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-900">{sup.phone}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans lowercase text-left px-3 text-blue-800 underline">{sup.email}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans text-left px-3 text-slate-500 max-w-xs truncate">{sup.address}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans text-slate-600">{sup.category}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-slate-800">{sup.leadTime}</td>
                      <td className="p-2.5 border-r border-slate-200 font-semibold">{sup.creditTerms}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-purple-950">{sup.totalOrders}</td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-semibold">{sup.lastOrderDate}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-emerald-600 text-[11px]">{sup.status}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleDelete(sup.code, sup.name)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-sans font-bold border border-rose-200 hover:border-rose-600 rounded transition-colors duration-150 cursor-pointer text-[10px]"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-xl font-bold py-5 px-10 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider mt-4"
            >
              Add New Supplier
            </button>
          </>
        )}
      </main>

      <footer className="bg-[#7884b0] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-center items-center shadow-inner border-t border-white/10">
        <div className="bg-slate-950/20 px-3 py-1 rounded border border-white/10 flex items-center gap-1.5">
          <span>👤 AUTHORIZED SESSION ID:</span> <span className="font-bold text-emerald-300">{staffId}</span>
        </div>
        <div className="flex gap-4 opacity-90 text-[11px] ml-4">
          <span>⚡ Secure Node Segment</span>
        </div>
      </footer>
    </div>
  );
}