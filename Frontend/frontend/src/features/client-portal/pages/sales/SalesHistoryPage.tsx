import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HistoryLog {
  date: string;
  transactions: number;
  totalSales: number;
  expenses: number;
}

interface SaleItemDetail {
  sku: string;
  productName: string;
  qtySold: number;
  unitPrice: number;
  totalPrice: number;
}

export type { HistoryLog };

export default function SalesHistoryPage() {
  const navigate = useNavigate();
  const [staffId] = useState(() => localStorage.getItem('staff_id') || 'Offline');
  const [companyId] = useState(() => localStorage.getItem('company_id') || 'No_ID_Tracked');
  
  const [historyData, setHistoryData] = useState<HistoryLog[]>([]);
  const [selectedDateDetails, setSelectedDateDetails] = useState<{ date: string; items: SaleItemDetail[] } | null>(null);

  useEffect(() => {
    // 1. Static mock fallback archive data
    const baselineMock: HistoryLog[] = [
      { date: '2026-05-25', transactions: 45, totalSales: 820000, expenses: 590000 },
      { date: '2026-05-26', transactions: 57, totalSales: 910000, expenses: 655000 },
      { date: '2026-05-27', transactions: 69, totalSales: 1050000, expenses: 756000 },
      { date: '2026-05-28', transactions: 81, totalSales: 890000, expenses: 641000 },
      { date: '2026-05-29', transactions: 93, totalSales: 1120000, expenses: 806000 },
      { date: '2026-05-30', transactions: 105, totalSales: 980000, expenses: 706000 },
      { date: '2026-05-31', transactions: 117, totalSales: 1240000, expenses: 893000 },
    ];

    // 2. Read live dynamic data matching active terminal states
    const rawSalesHistory = localStorage.getItem('shopverse_sales_history');
    let compiledLog: HistoryLog[] = [...baselineMock];

    if (rawSalesHistory) {
      try {
        const allTransactions = JSON.parse(rawSalesHistory);
        
        // Filter out transaction collections matching your active workplace environment scope
        const companyTxns = allTransactions.filter((t: any) => !t.companyId || t.companyId === companyId);

        // Group operations by unique date metrics
        const groupedByDate: Record<string, { count: number; salesSum: number; costSum: number }> = {};

        companyTxns.forEach((txn: any) => {
          // Fallback to today if payment row string missing standard dates
          const dayKey = txn.date || new Date().toISOString().split('T')[0];
          if (!groupedByDate[dayKey]) {
            groupedByDate[dayKey] = { count: 0, salesSum: 0, costSum: 0 };
          }
          groupedByDate[dayKey].count += 1;
          groupedByDate[dayKey].salesSum += txn.totalSalesValuation || 0;
          groupedByDate[dayKey].costSum += txn.totalCostValuation || 0;
        });

        // Merge computed calculations into timeline array array list
        Object.entries(groupedByDate).forEach(([date, metrics]) => {
          const matchIndex = compiledLog.findIndex(item => item.date === date);
          if (matchIndex !== -1) {
            compiledLog[matchIndex].transactions += metrics.count;
            compiledLog[matchIndex].totalSales += metrics.salesSum;
            compiledLog[matchIndex].expenses += metrics.costSum;
          } else {
            compiledLog.unshift({
              date,
              transactions: metrics.count,
              totalSales: metrics.salesSum,
              expenses: metrics.costSum
            });
          }
        });
      } catch (err) {
        console.error("Failed processing historical sales record registers:", err);
      }
    }

    setHistoryData(compiledLog);
  }, [companyId]);

  // 👁️ Inspect details parser function trigger
  const handleViewDayDetails = (targetDate: string) => {
    const rawSalesHistory = localStorage.getItem('shopverse_sales_history');
    const rolledItems: SaleItemDetail[] = [];

    if (rawSalesHistory) {
      try {
        const allTransactions = JSON.parse(rawSalesHistory);
        const matchTxns = allTransactions.filter((t: any) => 
          (!t.companyId || t.companyId === companyId) && 
          (t.date === targetDate || (!t.date && targetDate === new Date().toISOString().split('T')[0]))
        );

        // Extract internal checkout items arrays
        matchTxns.forEach((txn: any) => {
          if (Array.isArray(txn.items)) {
            txn.items.forEach((line: any) => {
              const existingItem = rolledItems.find(i => i.sku === line.sku);
              if (existingItem) {
                existingItem.qtySold += line.qtySold || 0;
                existingItem.totalPrice += line.totalPrice || 0;
              } else {
                rolledItems.push({
                  sku: line.sku,
                  productName: line.productName || 'General Product Entry',
                  qtySold: line.qtySold || 0,
                  unitPrice: line.unitPrice || 0,
                  totalPrice: line.totalPrice || 0
                });
              }
            });
          }
        });
      } catch (e) {
        console.error("Error reading itemized date matrices:", e);
      }
    }

    setSelectedDateDetails({
      date: targetDate,
      items: rolledItems
    });
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      
      {/* HEADER PANEL */}
      <header className="bg-[#5c6e91] text-white py-6 px-6 text-center relative shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase drop-shadow-sm">
          Sales Ledger History
        </h1>
        <p className="text-xs font-semibold tracking-widest mt-1 opacity-90 font-mono">
          SHOP-VERSE AUDIT MONITOR SYSTEM
        </p>
      </header>

      {/* CORE FRAME CONTAINER */}
      <main className="flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full relative flex flex-col justify-start">
        
        {/* BACK ACTION CONTROL BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-4 py-2 rounded-lg border border-slate-300 shadow-sm cursor-pointer transition-transform hover:scale-102"
          >
            ↩ CORE DASHBOARD
          </button>
          <div className="text-[10px] bg-slate-800 text-white font-mono px-3 py-1 rounded">
            WORKSPACE ID: <span className="text-yellow-400 font-bold">{companyId}</span>
          </div>
        </div>

        {/* LOG ANALYTICS ARCHITECTURE TABLE MATRIX */}
        <div className="bg-white border-2 border-slate-900 shadow-2xl rounded-xl overflow-hidden max-w-4xl mx-auto w-full">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white uppercase text-[10px] tracking-wider border-b border-slate-900 text-center">
                <th className="p-3 border-r border-slate-700 font-bold">Trading Date</th>
                <th className="p-3 border-r border-slate-700 font-bold">Invoice Count</th>
                <th className="p-3 border-r border-slate-700 font-bold text-right px-4">Gross Revenue (₦)</th>
                <th className="p-3 border-r border-slate-700 font-bold text-right px-4">Acquisition Expenses (₦)</th>
                <th className="p-3 font-bold w-32">Action Deck</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-center text-slate-700 text-[11px]">
              {historyData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900 tracking-tight">{row.date}</td>
                  <td className="p-3 border-r border-slate-200 text-blue-900 font-sans font-bold">{row.transactions} txns</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-emerald-700 text-right px-4">₦{row.totalSales.toLocaleString()}.00</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-rose-700 bg-slate-50/20 text-right px-4">₦{row.expenses.toLocaleString()}.00</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleViewDayDetails(row.date)}
                      className="w-full bg-slate-100 hover:bg-blue-600 border border-slate-300 hover:border-blue-700 text-slate-700 hover:text-white font-mono py-1 rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      View Details 👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* POPUP DETAIL INSPECTOR MODAL MATRIX CONTAINER */}
        {selectedDateDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
            <div className="bg-white border-2 border-slate-900 max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              
              <div className="bg-slate-900 text-white p-4 font-mono flex justify-between items-center">
                <div>
                  <div className="text-xs uppercase text-slate-400 font-bold">Itemized Manifest Report</div>
                  <div className="text-sm font-bold text-yellow-400">Date Logged: {selectedDateDetails.date}</div>
                </div>
                <button 
                  onClick={() => setSelectedDateDetails(null)}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 font-bold text-xs rounded border border-rose-800 cursor-pointer"
                >
                  ✕ CLOSE SHEET
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-grow">
                {selectedDateDetails.items.length === 0 ? (
                  <div className="text-center py-12 font-mono text-xs text-slate-400 italic">
                    No live system inventory checkout records registered on this ledger day code.
                  </div>
                ) : (
                  <table className="w-full font-mono text-[11px] border-collapse text-left border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 uppercase text-[9px] border-b border-slate-300 font-bold">
                        <th className="p-2 border-r border-slate-300">SKU</th>
                        <th className="p-2 border-r border-slate-300 text-left">Description</th>
                        <th className="p-2 border-r border-slate-300 text-center w-12">Qty</th>
                        <th className="p-2 text-right">Gross Sum (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedDateDetails.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 font-bold uppercase text-slate-900">{item.sku}</td>
                          <td className="p-2 border-r border-slate-300 font-sans font-medium text-slate-600">{item.productName}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-900">{item.qtySold}</td>
                          <td className="p-2 text-right font-bold text-blue-900">₦{item.totalPrice.toLocaleString()}.00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="bg-slate-50 border-t border-slate-200 p-3 text-right text-[10px] font-mono text-slate-400">
                Total Unique SKU Classifications Sold: {selectedDateDetails.items.length}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER STATUS STRIP */}
      <footer className="bg-[#5c6e91] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-between items-center shadow-inner border-t border-white/10">
        <div className="bg-slate-950/20 px-3 py-1 rounded border border-white/10 flex items-center gap-1.5">
          <span>👤 TERMINAL ASSIGNMENT:</span> <span className="font-bold text-emerald-300">{staffId}</span>
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