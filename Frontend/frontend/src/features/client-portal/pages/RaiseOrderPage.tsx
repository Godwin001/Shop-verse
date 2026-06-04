import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrderLineItem {
  code: string;
  productName: string;
  qtyOrdered: number;
  unitCost: number;
}

export default function RaiseOrderPage() {
  const navigate = useNavigate();
  const [staffId] = useState(() => localStorage.getItem('staff_id') || 'Offline');

  // Metadata Form Fields
  const [supplier, setSupplier] = useState('AloFood Ltd');
  const [poNumber, setPoNumber] = useState('PO-2025-006');
  const [orderDate, setOrderDate] = useState('2026-05-27');
  const [expectedDate, setExpectedDate] = useState('2026-06-05');

  // Grid Items Array
  const [items] = useState<OrderLineItem[]>([
    { code: 'IND22322', productName: 'Indomie Noodles (Carton)', qtyOrdered: 100, unitCost: 450.00 },
    { code: 'CCC50501', productName: 'Coca Cola 50cl (Crate)', qtyOrdered: 5, unitCost: 2800.00 }, // Render text units accurately
    { code: 'OMP20205', productName: 'Omo Washing Powder 2kg', qtyOrdered: 80, unitCost: 1200.00 },
    { code: 'GPF10102', productName: 'Golden Penny Flour 10kg', qtyOrdered: 30, unitCost: 5500.00 },
    { code: 'PMT12501', productName: 'Peak Milk Tin (24 pcs)', qtyOrdered: 40, unitCost: 5200.00 },
  ]);

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + (item.qtyOrdered * item.unitCost), 0);
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      <header className="bg-[#7884b0] text-white py-6 px-6 text-center relative shadow-md">
        <h1 className="text-3xl font-normal tracking-wide uppercase">RAISE ORDER</h1>
        <p className="text-sm font-medium tracking-widest mt-1 opacity-90 font-mono">SHOP-VERSE MANAGEMENT SYSTEM</p>
      </header>

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full relative flex flex-col lg:flex-row items-stretch gap-6 mt-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-6 text-slate-700 hover:text-slate-900 transition-transform hover:scale-105 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer z-50"
        >
          ↩ BACK TO DASHBOARD
        </button>

        {/* WORK DESK MAIN GRID */}
        <div className="flex-grow bg-white p-4 border border-slate-300 shadow-lg rounded-xl flex flex-col justify-between">
          <div>
            {/* UPPER METADATA HEADER SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-collapse border border-slate-300 mb-6 font-mono text-xs">
              <div className="md:col-span-3 flex flex-col">
                <span className="bg-[#ea580c] text-white p-1.5 font-bold uppercase text-center border-b border-slate-300">Supplier</span>
                <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} className="p-2 text-center text-slate-800 font-sans focus:outline-none font-bold" />
              </div>
              <div className="flex flex-col border-t md:border-t-0 border-r border-slate-300">
                <span className="bg-[#ea580c] text-white p-1.5 font-bold uppercase text-center border-b border-slate-300">PO Number</span>
                <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} className="p-2 text-center text-slate-800 font-bold focus:outline-none" />
              </div>
              <div className="flex flex-col md:col-span-2 border-t md:border-t-0 border-slate-300">
                <span className="bg-[#ea580c] text-white p-1.5 font-bold uppercase text-center border-b border-slate-300">Order Date</span>
                <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="p-2 text-center text-slate-800 font-bold focus:outline-none" />
              </div>
            </div>

            {/* MAIN ITEMS LEDGER BLOCK */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-[#ea580c] text-white font-bold uppercase text-center border-b border-slate-300">
                    <th className="p-2.5 border-r border-orange-700">Code</th>
                    <th className="p-2.5 border-r border-orange-700 text-left px-4">Product Name</th>
                    <th className="p-2.5 border-r border-orange-700">Qty Ordered</th>
                    <th className="p-2.5 border-r border-orange-700 text-right px-4">Unit Cost (₦)</th>
                    <th className="p-2.5 text-right px-4">Total Cost (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, index) => {
                    const lineTotal = item.qtyOrdered * item.unitCost;
                    return (
                      <tr key={index} className="text-center font-bold text-slate-700">
                        <td className="p-2.5 border-r border-slate-200 text-slate-900 bg-slate-50/50">{item.code}</td>
                        <td className="p-2.5 border-r border-slate-200 text-left px-4 font-sans text-slate-800">{item.productName}</td>
                        <td className="p-2.5 border-r border-slate-200 text-slate-900">{item.qtyOrdered}</td>
                        <td className="p-2.5 border-r border-slate-200 text-right px-4 text-slate-500">₦{item.unitCost.toLocaleString()}.00</td>
                        <td className="p-2.5 text-right px-4 text-blue-900">₦{lineTotal.toLocaleString()}.00</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOWER BLOCK CONTROL ROW */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 items-end border border-slate-300 font-mono text-xs">
            <div className="md:col-span-2 flex flex-col border-r border-slate-300">
              <span className="bg-[#ea580c] text-white p-1.5 font-bold uppercase text-center border-b border-slate-300">Expected Date</span>
              <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="p-2 text-center text-slate-800 font-bold focus:outline-none" />
            </div>
            <div className="flex flex-col bg-slate-50">
              <span className="bg-[#ea580c] text-white p-1.5 font-bold uppercase text-center border-b border-slate-300">Total Cost (₦)</span>
              <div className="p-2 text-center text-sm font-black text-blue-950">
                ₦{calculateTotalCost().toLocaleString()}.00
              </div>
            </div>
          </div>
        </div>

        {/* SIDE ACTIONS PANEL STRIP */}
        <div className="w-full lg:w-36 flex flex-row lg:flex-col justify-center lg:justify-start gap-4 shrink-0">
          <button 
            onClick={() => alert('Order transmission successfully triggered to vendor gateway.')}
            className="flex-grow lg:flex-grow-0 bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-xl font-bold py-6 px-4 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer uppercase tracking-wider text-center"
          >
            Send
          </button>
          <button 
            onClick={() => alert('Draft saved successfully.')}
            className="flex-grow lg:flex-grow-0 bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-xl font-bold py-6 px-4 rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer uppercase tracking-wider text-center"
          >
            Save
          </button>
        </div>
      </main>

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