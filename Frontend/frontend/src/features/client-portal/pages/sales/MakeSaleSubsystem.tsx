import React, { useState, useEffect } from 'react';
import { mockInventoryStorage, type InventoryItem } from '../inventory/mockInventoryStorage';
import { mockSalesStorage, type SalesInvoiceLine } from './mockSalesStorage';

interface SubViewProps {
  onBack: () => void;
}

export default function SalesSubsystem({ onBack }: SubViewProps) {
  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'HISTORY'>('TERMINAL');
  
  const companyName = localStorage.getItem('company_name') || 'No Active Workspace Found';
  const staffId = localStorage.getItem('staff_id') || 'Admin_User';

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full select-none">
      {/* Dynamic Scoped CSS Injection to handle PDF isolation during print operations */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice-zone, #printable-invoice-zone * {
            visibility: visible !important;
          }
          #printable-invoice-zone {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <header className="bg-[#5c6e91] text-white py-4 px-6 shadow-md text-center relative border-b border-black/10">
        <h1 className="text-xl font-bold tracking-widest uppercase">POS SALES TERMINAL ENVIRONMENT</h1>
        <p className="text-xs font-medium mt-0.5 tracking-wider font-mono opacity-90">LIVE TRANSACTIONAL STOCK DEPRECIATION MODULE</p>
        <div className="absolute right-6 top-4 hidden md:flex text-right text-[10px] font-mono text-slate-100 bg-black/10 py-1 px-2.5 rounded border border-white/10">
          <span>🏢 NODE: <span className="font-bold text-yellow-300">{companyName}</span></span>
        </div>
      </header>

      <main className="flex-grow p-4 relative w-full mx-auto max-w-[1700px]">
        <div className="flex justify-between items-center mb-6 mt-2">
          <button 
            onClick={onBack}
            className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer"
          >
            ↩ CORE SYSTEM MENU
          </button>
          
          <div className="flex gap-2 font-mono text-xs">
            <button 
              onClick={() => setActiveTab('TERMINAL')}
              className={`px-4 py-1.5 font-bold rounded ${activeTab === 'TERMINAL' ? 'bg-[#5c6e91] text-white shadow' : 'bg-white text-slate-700 border border-slate-300'}`}
            >
              🎯 LOG TRANSACTION COCKPIT
            </button>
            <button 
              onClick={() => setActiveTab('HISTORY')}
              className={`px-4 py-1.5 font-bold rounded ${activeTab === 'HISTORY' ? 'bg-[#5c6e91] text-white shadow' : 'bg-white text-slate-700 border border-slate-300'}`}
            >
              📜 COMPLETED SALES LOGS
            </button>
          </div>
        </div>

        {activeTab === 'TERMINAL' ? (
          <SalesTerminalView staffId={staffId} />
        ) : (
          <div className="bg-white p-6 rounded-xl font-mono text-xs text-center text-slate-400">Sales log interface history tracker payload active.</div>
        )}
      </main>

      <footer className="bg-[#5c6e91] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-between items-center border-t border-white/10">
        <div className="bg-slate-950/20 px-3 py-1 rounded border border-white/10">
          👤 CLERK ASSIGNMENT: <span className="font-bold text-emerald-300">{staffId}</span>
        </div>
        <div>© 2026 Shop-Verse CRM Engine</div>
      </footer>
    </div>
  );
}

function SalesTerminalView({ staffId }: { staffId: string }) {
  const [masterInventory, setMasterInventory] = useState<InventoryItem[]>([]);
  
  // Adjusted document parameters matching transaction properties
  const [customerName, setCustomerName] = useState('Walk-In Customer');
  const [dateHeader, setDateHeader] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceHeader, setInvoiceHeader] = useState(() => `INV-${Date.now().toString().slice(-6)}`);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Holds: 'Cash' or 'E-Transact'

  // Input fields hook states
  const [formSku, setFormSku] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStockAvailable, setFormStockAvailable] = useState<number | null>(null);
  const [activeItemRef, setActiveItemRef] = useState<InventoryItem | null>(null);

  // Core items array table row matching parameters
  const [invoiceRows, setInvoiceRows] = useState<SalesInvoiceLine[]>([]);
  const [selectedRowSn, setSelectedRowSn] = useState<number | null>(null);

  useEffect(() => {
    setMasterInventory(mockInventoryStorage.getItems());
  }, []);

  // Compute inner financial aggregates
  const calculatedTotalCost = invoiceRows.reduce((acc, row) => {
    const originalItem = masterInventory.find(i => i.itemCode === row.sku);
    return acc + (row.qtySold * (originalItem?.costPrice || 0));
  }, 0);

  const calculatedTotalSales = invoiceRows.reduce((acc, row) => acc + row.totalPrice, 0);

  const handleSalesSkuChange = (val: string) => {
    const code = val.toUpperCase().trim();
    setFormSku(code);

    const matched = masterInventory.find(i => i.itemCode.toUpperCase().trim() === code);
    if (matched) {
      setFormProductName(matched.itemName);
      setFormPrice(String(matched.salePrice));
      setFormStockAvailable(matched.quantity);
      setActiveItemRef(matched);
    } else {
      setFormProductName('');
      setFormPrice('');
      setFormStockAvailable(null);
      setActiveItemRef(null);
    }
  };

  const triggerBarcodeScanner = () => {
    const hardwareInput = prompt("Emulating laser hardware code trigger scan input lens:");
    if (hardwareInput) handleSalesSkuChange(hardwareInput);
  };

  const pushItemToInvoiceCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemRef) return alert('Scan or input a recognized SKU.');
    
    const quantityInput = parseInt(formQty) || 0;
    if (quantityInput <= 0) return alert('Transaction requires quantity parameter greater than 0.');
    
    if (quantityInput > activeItemRef.quantity) {
      return alert(`Insufficient stock. Only ${activeItemRef.quantity} units remaining.`);
    }

    const duplicateIdx = invoiceRows.findIndex(r => r.sku === activeItemRef.itemCode);
    if (duplicateIdx !== -1) {
      const expandedRows = [...invoiceRows];
      const combinedQty = expandedRows[duplicateIdx].qtySold + quantityInput;
      
      if (combinedQty > activeItemRef.quantity) {
        return alert(`Cannot exceed available warehouse constraints (${activeItemRef.quantity} units).`);
      }
      
      expandedRows[duplicateIdx].qtySold = combinedQty;
      expandedRows[duplicateIdx].totalPrice = combinedQty * expandedRows[duplicateIdx].unitPrice;
      setInvoiceRows(expandedRows);
    } else {
      const newInvoiceRow: SalesInvoiceLine = {
        sn: invoiceRows.length + 1,
        sku: activeItemRef.itemCode,
        productName: activeItemRef.itemName,
        qtySold: quantityInput,
        unitPrice: activeItemRef.salePrice,
        totalPrice: quantityInput * activeItemRef.salePrice,
        category: activeItemRef.category || 'General Store'
      };
      setInvoiceRows(prev => [...prev, newInvoiceRow]);
    }

    setFormSku('');
    setFormProductName('');
    setFormQty('');
    setFormPrice('');
    setFormStockAvailable(null);
    setActiveItemRef(null);
  };

  const dropHighlightedRow = () => {
    if (selectedRowSn === null) return alert('Highlight a transaction line index row first.');
    const filtered = invoiceRows.filter(r => r.sn !== selectedRowSn);
    setInvoiceRows(filtered.map((r, i) => ({ ...r, sn: i + 1 })));
    setSelectedRowSn(null);
  };

  // 🚀 Print Scoped PDF & Deduct Stock Volume Pipeline
  const commitTransactionCheckout = () => {
    if (invoiceRows.length === 0) return alert('Active invoice workspace holds no data entries.');
    if (!invoiceHeader.trim()) return alert('Verify transaction index confirmation mapping ID code.');

    // 1. Commit backend mutations to save transaction and decrement stock values
    const txnResult = mockSalesStorage.commitSaleTransaction({
      invoiceNo: invoiceHeader.trim(),
      customerName: customerName.trim(),
      staffId: staffId,
      date: dateHeader,
      paymentMethod: paymentMethod,
      items: invoiceRows,
      totalCostValuation: calculatedTotalCost,
      totalSalesValuation: calculatedTotalSales
    });

    if (!txnResult.success) {
      return alert(`TRANSACTION DENIED: \n${txnResult.error}`);
    }

    // 2. Trigger native print subsystem targeted exclusively at the isolated layout ID zone
    window.print();

    // 3. Clear interface hooks and restore default states
    setMasterInventory(mockInventoryStorage.getItems());
    setInvoiceRows([]);
    setInvoiceHeader(`INV-${Date.now().toString().slice(-6)}`);
    setSelectedRowSn(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
      
      {/* LEFT SIDE: POS INPUT CONTROLS TERMINAL DECK */}
      <div className="lg:col-span-4 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4 font-mono text-xs">
        <div className="bg-[#5c6e91] text-white py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-center">
          Sales Input Terminal
        </div>

        <form onSubmit={pushItemToInvoiceCart} className="space-y-3">
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1 flex justify-between">
              <span>Scan Barcode / Product Code</span>
              <span className="text-blue-600 cursor-pointer hover:underline" onClick={triggerBarcodeScanner}>[📷 Scan Input Mode]</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="Scan item barcode tracking token code..." 
              value={formSku}
              onChange={e => handleSalesSkuChange(e.target.value)}
              className="w-full p-2.5 border-2 border-slate-400 rounded bg-slate-50 font-bold uppercase outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-0.5">Identified Product Name</label>
            <input 
              type="text" 
              readOnly 
              placeholder="System tracking designation match..."
              value={formProductName}
              className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-600 font-sans text-xs font-semibold rounded outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-0.5">Warehouse Balance</label>
              <div className={`w-full p-2 border text-center font-bold text-xs rounded ${formStockAvailable !== null ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-400'}`}>
                {formStockAvailable !== null ? `${formStockAvailable} available` : 'No Item Loaded'}
              </div>
            </div>
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-0.5">Retail Unit Value (₦)</label>
              <input 
                type="text" 
                readOnly
                placeholder="0.00"
                value={formPrice ? `₦${parseFloat(formPrice).toLocaleString()}` : ''}
                className="w-full p-2 bg-slate-100 border border-slate-200 text-right font-bold text-slate-900 rounded outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Quantity to Purchase</label>
            <input 
              type="number" 
              min="1"
              required
              placeholder="Specify sales target quantity count..."
              value={formQty}
              onChange={e => setFormQty(e.target.value)}
              className="w-full p-2.5 border-2 border-slate-800 rounded text-center font-bold text-sm bg-white outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-3 bg-[#5c6e91] hover:bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md text-center block cursor-pointer"
          >
            Add Item to Invoice Cart ➔
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: CLEAN VOUCHER RECEIPT SHEET DESIGN MODULE */}
      <div className="lg:col-span-8 flex flex-col xl:flex-row gap-3 items-start w-full">
        
        {/* ISOLATED PRINT WRAPPER ZONE CONTAINER */}
        <div 
          id="printable-invoice-zone" 
          className="w-full xl:flex-grow bg-white border-2 border-slate-900 shadow-xl p-5 font-mono text-xs relative flex flex-col justify-between min-h-[480px]"
        >
          <div>
            <div className="text-center font-bold text-sm tracking-widest border-b-2 border-slate-900 pb-2 mb-4 uppercase text-slate-900">
              RETAIL SALES TRANSACTION LEDGER VOUCHER
            </div>

            {/* Custom Headers Matrix (Now housing the split Cash / E-Transact Option Switcher) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 border border-slate-900 p-2.5 mb-4 bg-slate-50/80 text-[10px]">
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-slate-500">CLIENT:</span>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="flex-grow p-0.5 border border-slate-300 bg-white px-1 font-sans text-xs" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-slate-500">DATE:</span>
                <input type="date" value={dateHeader} onChange={e => setDateHeader(e.target.value)} className="flex-grow p-0.5 border border-slate-300 text-center" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-blue-900">VOUCHER:</span>
                <input type="text" value={invoiceHeader} onChange={e => setInvoiceHeader(e.target.value)} className="flex-grow p-0.5 border border-blue-400 font-bold uppercase text-center bg-white text-blue-950" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold uppercase text-slate-500">METHOD:</span>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)} 
                  className="flex-grow p-0.5 border-2 border-slate-900 bg-yellow-50 font-bold text-center text-slate-900 cursor-pointer"
                >
                  <option value="Cash">💵 CASH</option>
                  <option value="E-Transact">⚡ E-TRANSACT</option>
                </select>
              </div>
            </div>

            {/* Main Itemized Line Entries Data Table Grid */}
            <div className="overflow-x-auto border border-slate-900 w-full mb-4">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-center text-[10px]">
                    <th className="p-1.5 border-r border-slate-700 w-8">S/N</th>
                    <th className="p-1.5 border-r border-slate-700 w-28 text-left px-2">SKU REFERENCE</th>
                    <th className="p-1.5 border-r border-slate-700 text-left px-2">ITEM DESCRIPTION</th>
                    <th className="p-1.5 border-r border-slate-700 w-12">QTY</th>
                    <th className="p-1.5 border-r border-slate-700 w-24 text-right px-2">UNIT VALUE</th>
                    <th className="p-1.5 w-24 text-right px-2">NET TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-center text-[11px]">
                  {invoiceRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-slate-400 font-sans italic bg-slate-50/50 tracking-wider">
                        Active purchase receipt holds no parameters. Register lines via left scanning module panel index.
                      </td>
                    </tr>
                  ) : (
                    invoiceRows.map((row) => (
                      <tr 
                        key={row.sn}
                        onClick={() => setSelectedRowSn(row.sn)}
                        className={`transition-colors cursor-pointer ${selectedRowSn === row.sn ? 'bg-amber-100 font-bold text-slate-950' : 'hover:bg-slate-50/80 text-slate-700'}`}
                      >
                        <td className="p-1.5 border-r border-slate-300 font-bold bg-slate-50">{row.sn}</td>
                        <td className="p-1.5 border-r border-slate-300 text-left px-2 font-bold uppercase text-slate-900">{row.sku}</td>
                        <td className="p-1.5 border-r border-slate-300 text-left px-2 font-sans font-medium text-slate-600">{row.productName}</td>
                        <td className="p-1.5 border-r border-slate-300 font-bold text-slate-900 bg-slate-50/40">{row.qtySold}</td>
                        <td className="p-1.5 border-r border-slate-300 text-right px-2">₦{row.unitPrice.toLocaleString()}.00</td>
                        <td className="p-1.5 text-right px-2 font-bold text-blue-900">₦{row.totalPrice.toLocaleString()}.00</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary Blocks (Clean, simple, no cost information visible to customers) */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-12 border-2 border-slate-900 bg-slate-900 font-bold text-center items-center">
              <div className="col-span-5 p-2 bg-slate-100 text-slate-900 uppercase text-[10px] tracking-wider text-left px-3">
                Gross Sale Voucher Balance Total:
              </div>
              <div className="col-span-7 p-2 text-right px-4 text-sm font-mono text-emerald-400 bg-slate-900 font-bold">
                ₦{calculatedTotalSales.toLocaleString()}.00
              </div>
            </div>
            <div className="border border-dashed border-slate-400 p-2 text-center text-[9px] text-slate-400 font-mono tracking-widest uppercase">
              *** Thank you for your business. Store copy auto-generated via system audit print driver ***
            </div>
          </div>
        </div>

        {/* SIDE OPERATIONS CONTROL DOCK */}
        <div className="w-full xl:w-40 flex flex-row xl:flex-col gap-1.5 font-mono text-[10px] font-bold uppercase print:hidden">
          <button onClick={dropHighlightedRow} className="flex-1 xl:w-full py-2.5 bg-rose-50 border border-rose-300 hover:bg-rose-600 text-rose-900 hover:text-white shadow-sm rounded text-center cursor-pointer transition-colors">
            DELETE ROW
          </button>
          <button 
            onClick={commitTransactionCheckout} 
            className="flex-grow xl:w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[10px] shadow-md rounded text-center border border-emerald-800 tracking-wider font-bold cursor-pointer transition-colors"
          >
            CHECKOUT & PRINT ⚡
          </button>
        </div>

      </div>
    </div>
  );
}