import { useState, useEffect } from 'react';

interface SubViewProps {
  onBack: () => void;
}

interface TodaySaleRecord {
  sn: string;
  invoiceNo: string;
  paymentMode: 'Cash' | 'Card' | 'Transfer' | 'POS Terminal' | 'Bank Transfer';
  totalCostValue: number;
  totalSalesValue: number;
}

export type { TodaySaleRecord };

export default function TodaySalesSubsystem({ onBack }: SubViewProps) {
  const [salesRecords, setSalesRecords] = useState<TodaySaleRecord[]>([]);

  useEffect(() => {
    // Read current authorization profiles
    const currentCompanyId = localStorage.getItem('company_id') || 'No_ID_Tracked';
    
    // Retrieve tracking matrices out of the live unified transaction logs
    const rawSalesHistory = localStorage.getItem('shopverse_sales_history');
    
    if (rawSalesHistory) {
      try {
        const allSales: any[] = JSON.parse(rawSalesHistory);
        
        // Filter historical records matching your enterprise instance criteria 
        // fallback to include them if companyId fields aren't initialized yet
        const localCompanySales = allSales.filter((sale: any) => 
          !sale.companyId || sale.companyId === currentCompanyId
        );
        
        // Remap data fields dynamically, factoring in both cost and sales margins
        const mappedRecords: TodaySaleRecord[] = localCompanySales.map((item: any, index: number) => ({
          sn: (index + 1).toString(),
          invoiceNo: item.invoiceNo || 'N/A',
          paymentMode: item.paymentMethod || 'Cash',
          totalCostValue: item.totalCostValuation || 0,
          totalSalesValue: item.totalSalesValuation || 0
        }));
        
        setSalesRecords(mappedRecords);
      } catch (err) {
        console.error("Error formatting unified transaction timeline log arrays:", err);
      }
    }
  }, []);

  // Compute grand aggregated operational valuations
  const grandTotalCostValuation = salesRecords.reduce((sum, item) => sum + item.totalCostValue, 0);
  const grandTotalSalesValuation = salesRecords.reduce((sum, item) => sum + item.totalSalesValue, 0);

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      {/* HEADER PANEL */}
      <header className="bg-[#5c6e91] text-white py-6 px-6 text-center relative shadow-md border-b border-black/10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase drop-shadow-sm">
          Live Audit Workspace
        </h1>
        <p className="text-xs font-semibold tracking-widest mt-1 opacity-90 font-mono">
          SHOP-VERSE TRANSACTION MONITORING ENGINE
        </p>
      </header>

      {/* WORKSPACE CONTENT SHEET */}
      <main className="flex-grow p-4 md:p-6 max-w-[1200px] mx-auto w-full relative flex flex-col gap-6">
        
        {/* UPPER NAVIGATION BAR STRIP */}
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={onBack}
            className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-4 py-2 rounded-lg border border-slate-300 shadow-sm cursor-pointer"
          >
            ↩ BACK TO DASHBOARD
          </button>

          <div className="bg-[#5c6e91] text-white font-mono font-bold px-5 py-2 rounded-lg uppercase tracking-wider text-xs shadow-sm">
            Today's Invoice Matrix Monitor
          </div>
        </div>

        {/* DATA TABLE MATRIX */}
        <div className="bg-white border-2 border-slate-900 shadow-xl overflow-hidden rounded-xl">
          {salesRecords.length === 0 ? (
            <div className="text-center py-24 font-mono text-xs text-slate-400 italic bg-slate-50/50">
              No historical checkout updates detected today. Completed receipts will manifest here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-800 text-white uppercase text-[10px] tracking-wider border-b border-slate-900 text-center">
                    <th className="p-3 border-r border-slate-700 w-16">S/N</th>
                    <th className="p-3 border-r border-slate-700 text-left px-4">Invoice Voucher Ref</th>
                    <th className="p-3 border-r border-slate-700">Payment Channel</th>
                    <th className="p-3 border-r border-slate-700 text-right px-4 w-44">Store Cost Value</th>
                    <th className="p-3 text-right px-4 w-44">Retail Gross Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center text-[11px]">
                  {salesRecords.map((item) => (
                    <tr key={item.sn} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border-r border-slate-200 font-bold bg-slate-50 text-slate-400">{item.sn}</td>
                      <td className="p-3 border-r border-slate-200 text-left px-4 font-sans font-semibold text-slate-900 uppercase tracking-wide">{item.invoiceNo}</td>
                      <td className="p-3 border-r border-slate-200">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          item.paymentMode === 'Cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.paymentMode === 'Card' || item.paymentMode === 'POS Terminal' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {item.paymentMode}
                        </span>
                      </td>
                      <td className="p-3 border-r border-slate-200 text-right px-4 text-slate-500 font-bold">
                        ₦{item.totalCostValue.toLocaleString()}.00
                      </td>
                      <td className="p-3 text-right px-4 text-blue-900 font-bold bg-blue-50/10">
                        ₦{item.totalSalesValue.toLocaleString()}.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BOTTOM REAL-TIME SUMMARY ACCUMULATORS */}
        {salesRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="bg-white border-2 border-slate-900 p-3 font-mono text-xs flex justify-between items-center shadow-md">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Aggregated Acquisition Cost:</span>
              <span className="text-slate-800 font-bold text-sm">₦{grandTotalCostValuation.toLocaleString()}.00</span>
            </div>
            <div className="bg-white border-2 border-slate-900 p-3 font-mono text-xs flex justify-between items-center shadow-md">
              <span className="font-bold text-blue-900 uppercase text-[10px]">Aggregated Revenue Sales:</span>
              <span className="text-blue-900 font-bold text-sm">₦{grandTotalSalesValuation.toLocaleString()}.00</span>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER STRIP */}
      <footer className="bg-[#5c6e91] text-white/90 text-center py-4 px-4 text-xs font-mono border-t border-white/10 tracking-wider flex flex-wrap justify-center items-center gap-2 md:gap-6 shadow-inner">
        <span>⚡ Shop-verse v4.0</span>
        <span className="hidden md:inline">|</span>
        <span>Corporate Audit Layer</span>
      </footer>
    </div>
  );
}