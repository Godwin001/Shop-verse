import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Defensive import check for the storage module wrapper
import * as InventoryModule from './inventory/mockInventoryStorage';

interface PurchaseOrder {
  poNumber: string;
  orderDate: string;
  supplier: string;
  totalCost: number;
  expectedDate: string;
  status: 'Received' | 'Pending' | 'In Transit' | 'Confirmed';
  items: POItemRow[];
}

interface POItemRow {
  sn: number;
  sku: string;
  productName: string;
  qty: number;
  costPrice: number;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  
  // Safe initializers for storage keys
  const [staffId] = useState(() => {
    try {
      return localStorage.getItem('staff_id') || 'Offline';
    } catch {
      return 'Offline';
    }
  });
  
  const [viewMode, setViewMode] = useState<'ledger' | 'raise'>('ledger');
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [viewingPODetails, setViewingPODetails] = useState<PurchaseOrder | null>(null);

  // Safe JSON Parsing Core with structural fallback arrays
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const cached = localStorage.getItem('shopverse_purchase_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Error fetching registered purchase order registry:', e);
    }
    return [];
  });

  // Write changes safely to system disk channels
  useEffect(() => {
    try {
      localStorage.setItem('shopverse_purchase_orders', JSON.stringify(orders));
    } catch (err) {
      console.error("Storage writing write error:", err);
    }
  }, [orders]);

  const [systemInventory, setSystemInventory] = useState<any[]>([]);

  // Safe check to verify your custom import mock is available 
  useEffect(() => {
    try {
      if (InventoryModule && InventoryModule.mockInventoryStorage && typeof InventoryModule.mockInventoryStorage.getItems === 'function') {
        setSystemInventory(InventoryModule.mockInventoryStorage.getItems() || []);
      } else {
        console.warn("mockInventoryStorage system module or getItems function is missing.");
      }
    } catch (err) {
      console.error("Failed handling internal system inventory vectors pull:", err);
    }
  }, [viewMode]);

  // Safe supplier list engine mapping processing pipeline 
  const [systemSuppliers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopverse_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((s: any) => {
            if (!s) return '';
            return typeof s === 'object' ? (s.name || s.supplierName || '') : String(s);
          }).filter(Boolean);
        }
      }
    } catch (e) { 
      console.error("Failed executing strict supplier JSON parse stream:", e); 
    }
    return ['AloFood Ltd', 'NBC Nigeria', 'Unilever Nig', 'FrieslandCamp', 'FMN Nigeria', 'Nestle Nigeria', 'Dangote Ind', 'Reckitt Benck'];
  });

  const [poFormHeader, setPoFormHeader] = useState({
    poNumber: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    expectedDate: ''
  });

  useEffect(() => {
    setPoFormHeader(prev => ({
      ...prev,
      poNumber: `PO-2026-${String((orders?.length || 0) + 1).padStart(3, '0')}`
    }));
  }, [orders, viewMode]);

  const [poItems, setPoItems] = useState<POItemRow[]>([
    { sn: 1, sku: '', productName: '', qty: 0, costPrice: 0 }
  ]);
  
  const [selectedItemSn, setSelectedItemSn] = useState<number | null>(null);

  const currentTotalCost = Array.isArray(poItems) 
    ? poItems.reduce((acc, row) => acc + ((row.qty || 0) * (row.costPrice || 0)), 0) 
    : 0;

  const handleItemRowChange = (sn: number, field: keyof POItemRow, value: string | number) => {
    setPoItems(prev => prev.map(row => {
      if (row.sn === sn) {
        const updatedRow = { ...row, [field]: value };
        
        if (field === 'sku') {
          const typedSku = String(value).toUpperCase().trim();
          const matchedProduct = Array.isArray(systemInventory) && systemInventory.find(
            (item) => String(item?.itemCode || '').toUpperCase().trim() === typedSku
          );

          if (matchedProduct) {
            updatedRow.productName = matchedProduct.itemName || 'Unnamed Item';
          } else {
            updatedRow.productName = value ? '❌ Unknown Code' : '';
          }
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const addNewRowLine = () => {
    setPoItems(prev => [...prev, {
      sn: prev.length + 1,
      sku: '',
      productName: '',
      qty: 0,
      costPrice: 0
    }]);
  };

  const handleClearAll = () => {
    if (window.confirm('Purge active draft layout matrix values?')) {
      setPoItems([{ sn: 1, sku: '', productName: '', qty: 0, costPrice: 0 }]);
      setPoFormHeader(prev => ({ ...prev, supplier: '', expectedDate: '' }));
      setSelectedItemSn(null);
    }
  };

  const handleDeleteItemRow = () => {
    if (selectedItemSn === null) return alert('Highlight a row index cell to delete first.');
    if (poItems.length <= 1) {
      setPoItems([{ sn: 1, sku: '', productName: '', qty: 0, costPrice: 0 }]);
      setSelectedItemSn(null);
      return;
    }
    const filtered = poItems.filter(item => item.sn !== selectedItemSn);
    const reindexed = filtered.map((item, idx) => ({ ...item, sn: idx + 1 }));
    setPoItems(reindexed);
    setSelectedItemSn(null);
  };

  const handleEditItemRow = () => {
    if (selectedItemSn === null) return alert('Select/Highlight a row pattern first.');
    alert(`Row Line Context S/N-${selectedItemSn} is active for editing in the grid.`);
  };

  const handleViewPOContent = () => {
    if (!selectedPO) return alert('Please highlight a transaction log from the spreadsheet row index to check first.');
    const match = Array.isArray(orders) && orders.find(o => o.poNumber === selectedPO);
    if (match) {
      setViewingPODetails(match);
    }
  };

  const handleUpdateStockPush = () => {
    if (!poFormHeader.supplier) return alert('Please assign an authorized Supplier.');
    if (poItems.some(item => !item.sku || !item.productName || item.productName.includes('Unknown') || item.qty <= 0)) {
      return alert('Ensure all items possess valid system registered SKU codes and quantities above 0.');
    }

    const compiledPO: PurchaseOrder = {
      poNumber: poFormHeader.poNumber,
      orderDate: poFormHeader.date,
      supplier: poFormHeader.supplier,
      totalCost: currentTotalCost,
      expectedDate: poFormHeader.expectedDate || 'None Set',
      status: 'Confirmed',
      items: [...poItems]
    };

    setOrders(prev => [compiledPO, ...(Array.isArray(prev) ? prev : [])]);
    setPoItems([{ sn: 1, sku: '', productName: '', qty: 0, costPrice: 0 }]);
    setSelectedItemSn(null);
    setViewMode('ledger'); 
    alert('Purchase Record successfully written to disk buffer matrices.');
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full select-none">
      <header className="bg-[#5c6e91] text-white py-6 px-6 text-center relative shadow-md">
        <h1 className="text-2xl font-bold tracking-widest uppercase">
          {viewMode === 'raise' ? "Supplier's Purchase Order Desk" : "Purchase Order Database"}
        </h1>
        <p className="text-xs font-semibold tracking-widest mt-1 opacity-90 font-mono">SHOP-VERSE MANAGEMENT SYSTEM</p>
      </header>

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full relative flex flex-col items-center justify-start gap-6">
        <div className="w-full flex justify-start items-center">
          <button 
            onClick={() => viewMode === 'raise' ? setViewMode('ledger') : navigate('/dashboard')}
            className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-4 py-2 rounded-lg border border-slate-300 shadow-sm cursor-pointer transition-colors"
          >
            {viewMode === 'raise' ? '↩ CANCEL AND RETURN' : '↩ BACK TO DASHBOARD'}
          </button>
        </div>

        {viewMode === 'raise' ? (
          <div className="w-full flex flex-col md:flex-row gap-4 items-start justify-center mt-2">
            <div className="w-full md:flex-grow bg-white border-2 border-slate-900 shadow-2xl p-4 font-mono text-xs">
              <div className="text-center font-bold text-base border-b-2 border-slate-900 pb-2 mb-4 tracking-wider uppercase">
                PURCHASE ORDER MATRIX
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-900 p-3 mb-4 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-bold">SUPPLIER:</span>
                  <select 
                    value={poFormHeader.supplier}
                    onChange={(e) => setPoFormHeader(prev => ({ ...prev, supplier: e.target.value }))}
                    className="flex-grow p-1 border border-slate-400 bg-white font-sans text-xs"
                  >
                    <option value="">-- Select Active Registered Supplier --</option>
                    {Array.isArray(systemSuppliers) && systemSuppliers.map((sup, i) => (
                      <option key={i} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">PO #:</span>
                  <input type="text" readOnly value={poFormHeader.poNumber} className="flex-grow p-1 border border-slate-300 bg-slate-100 font-bold px-2" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">DATE:</span>
                  <input type="date" value={poFormHeader.date} onChange={(e) => setPoFormHeader(prev => ({ ...prev, date: e.target.value }))} className="flex-grow p-1 border border-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900">EXPECTED DATE:</span>
                  <input type="date" value={poFormHeader.expectedDate} onChange={(e) => setPoFormHeader(prev => ({ ...prev, expectedDate: e.target.value }))} className="flex-grow p-1 border border-blue-400 bg-blue-50/50" />
                </div>
              </div>

              <div className="overflow-x-auto border-t border-l border-r border-slate-900">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold uppercase border-b-2 border-slate-900 text-center">
                      <th className="p-2 border-r border-slate-900 w-12">S/N</th>
                      <th className="p-2 border-r border-slate-900 w-36">SKU CODE</th>
                      <th className="p-2 border-r border-slate-900 text-left px-3">PRODUCT NAME</th>
                      <th className="p-2 border-r border-slate-900 w-24">QTY</th>
                      <th className="p-2 w-32">COST PRICE (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 text-center">
                    {Array.isArray(poItems) && poItems.map((item) => (
                      <tr 
                        key={item.sn} 
                        onClick={() => setSelectedItemSn(item.sn)}
                        className={`transition-colors cursor-pointer ${selectedItemSn === item.sn ? 'bg-amber-100/80 font-bold' : 'hover:bg-slate-50'}`}
                      >
                        <td className="p-1 border-r border-slate-900 font-bold bg-slate-100">{item.sn}</td>
                        <td className="p-1 border-r border-slate-900 px-1">
                          <input 
                            type="text" 
                            placeholder="e.g. Code string"
                            value={item.sku} 
                            onChange={(e) => handleItemRowChange(item.sn, 'sku', e.target.value)}
                            className="w-full p-1 border border-slate-300 font-bold text-center rounded uppercase font-mono text-xs bg-amber-50/40" 
                          />
                        </td>
                        <td className="p-2 border-r border-slate-900 text-left px-3 font-sans text-xs text-slate-800 font-semibold bg-slate-50">
                          {item.productName || <span className="text-slate-400 italic font-normal">Auto-assigned upon code entry...</span>}
                        </td>
                        <td className="p-1 border-r border-slate-900">
                          <input 
                            type="number" 
                            min="0"
                            value={item.qty || ''} 
                            onChange={(e) => handleItemRowChange(item.sn, 'qty', parseInt(e.target.value) || 0)}
                            className="w-full p-1 border border-transparent hover:border-slate-400 focus:bg-white text-center rounded text-slate-900 font-bold" 
                          />
                        </td>
                        <td className="p-1">
                          <input 
                            type="number" 
                            min="0"
                            placeholder="0.00"
                            value={item.costPrice || ''} 
                            onChange={(e) => handleItemRowChange(item.sn, 'costPrice', parseFloat(e.target.value) || 0)}
                            className="w-full p-1 border border-transparent hover:border-slate-400 focus:bg-white text-right rounded text-blue-950 font-bold px-2" 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center border-2 border-slate-900 border-t-4 p-3 bg-slate-50 mt-4">
                <button 
                  type="button" 
                  onClick={addNewRowLine}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1 font-sans text-xs rounded font-bold cursor-pointer"
                >
                  ➕ ADD ROW LINE
                </button>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold tracking-wider text-slate-800 uppercase">Total:</span>
                  <span className="font-mono font-bold text-base bg-slate-950 text-emerald-400 px-4 py-1 border border-slate-800 rounded">
                    ₦{currentTotalCost.toLocaleString()}.00
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-44 flex flex-row md:flex-col gap-2 font-mono text-xs uppercase font-bold">
              <button onClick={handleEditItemRow} className="flex-1 md:w-full py-3 bg-white border border-slate-400 hover:bg-slate-100 text-slate-900 shadow-sm text-center rounded cursor-pointer">EDIT</button>
              <button onClick={handleDeleteItemRow} className="flex-1 md:w-full py-3 bg-[#f5d0c5] border border-rose-300 hover:bg-rose-600 text-rose-900 hover:text-white shadow-sm text-center rounded cursor-pointer">DELETE</button>
              <button onClick={handleClearAll} className="flex-1 md:w-full py-3 bg-red-600 hover:bg-red-700 text-white shadow-sm text-center rounded cursor-pointer">CLEAR ALL</button>
              <button onClick={() => alert('Progress cached safely.')} className="flex-1 md:w-full py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-center rounded cursor-pointer">SAVE</button>
              <button onClick={handleUpdateStockPush} className="flex-1 md:w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-center text-[11px] tracking-tight rounded cursor-pointer border border-emerald-800">UPDATE STOCK ⚡</button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full bg-white border-2 border-slate-900 shadow-xl rounded-none overflow-hidden mt-2">
              <table className="w-full text-left text-xs font-mono border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider text-center">
                    <th className="p-3 border-r border-slate-700">PO #</th>
                    <th className="p-3 border-r border-slate-700">Order Date</th>
                    <th className="p-3 border-r border-slate-700 text-left px-4">Supplier</th>
                    <th className="p-3 border-r border-slate-700 text-right px-6">Total Valuation</th>
                    <th className="p-3 border-r border-slate-700">Expected Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-center text-slate-700 min-h-[200px]">
                  {!Array.isArray(orders) || orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-slate-400 font-sans italic text-center bg-slate-50/50">
                        No transactions registered in system buffer. Click "RAISE ORDER" to generate logs.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr 
                        key={order?.poNumber || Math.random().toString()} 
                        onClick={() => order?.poNumber && setSelectedPO(order.poNumber)}
                        className={`hover:bg-blue-50/60 cursor-pointer transition-colors ${selectedPO === order?.poNumber ? 'bg-blue-100 font-bold text-slate-950' : ''}`}
                      >
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-900">{order?.poNumber || 'N/A'}</td>
                        <td className="p-3 border-r border-slate-200">{order?.orderDate || 'N/A'}</td>
                        <td className="p-3 border-r border-slate-200 font-sans text-left px-4 font-semibold">{order?.supplier || 'N/A'}</td>
                        <td className="p-3 border-r border-slate-200 text-right px-6 text-blue-900 font-bold">₦{(order?.totalCost || 0).toLocaleString()}.00</td>
                        <td className="p-3 border-r border-slate-200 text-slate-500">{order?.expectedDate || 'N/A'}</td>
                        <td className="p-3 font-sans font-bold text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase block w-24 mx-auto text-center bg-blue-100 text-blue-800 border border-blue-200">
                            {order?.status || 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 w-full max-w-4xl font-mono text-xs font-bold uppercase">
              <button onClick={() => setViewMode('raise')} className="flex-1 py-3 px-4 bg-[#5c6e91] hover:bg-slate-900 text-white shadow text-center tracking-wider cursor-pointer rounded">RAISE ORDER</button>
              <button 
                onClick={handleViewPOContent} 
                className={`flex-1 py-3 px-4 border shadow text-center tracking-wider cursor-pointer rounded ${
                  selectedPO ? 'bg-amber-500 text-slate-950 border-slate-900 font-extrabold' : 'bg-white border-slate-300 text-slate-400 opacity-60'
                }`}
              >
                VIEW DETAILS 🔍
              </button>
              <button onClick={() => alert('Dispatching summary parameters...')} className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 shadow text-center tracking-wider cursor-pointer rounded">SEND</button>
              <button onClick={() => alert('Verification ledger status validated.')} className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 shadow text-center tracking-wider cursor-pointer rounded">CONFIRM</button>
            </div>
          </>
        )}
      </main>

      {/* OVERLAY POPUP MODAL */}
      {viewingPODetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-slate-950 w-full max-w-3xl p-5 font-mono shadow-2xl relative rounded-xl">
            <div className="text-center font-bold text-base text-slate-900 uppercase border-b-2 border-slate-950 pb-2 mb-4 tracking-wider">
              PURCHASE ORDER BREAKDOWN RECORD
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs bg-slate-50 border border-slate-300 p-3 mb-4 rounded">
              <div><span className="font-bold text-slate-500">ORDER NUMBER:</span> <span className="font-bold text-blue-900">{viewingPODetails.poNumber}</span></div>
              <div><span className="font-bold text-slate-500">SUPPLIER STAMP:</span> <span className="font-bold font-sans text-slate-800">{viewingPODetails.supplier}</span></div>
              <div><span className="font-bold text-slate-500">DATE RECORDED:</span> <span>{viewingPODetails.orderDate}</span></div>
              <div><span className="font-bold text-slate-500">EXPECTED SHIPMENT:</span> <span className="text-blue-950">{viewingPODetails.expectedDate}</span></div>
            </div>
            <div className="overflow-x-auto max-h-[260px] border border-slate-300 rounded">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-center sticky top-0 text-[10px]">
                    <th className="p-2 w-12">S/N</th>
                    <th className="p-2 w-28">SKU CODE</th>
                    <th className="p-2 text-left px-3">PRODUCT NAME</th>
                    <th className="p-2 w-20">QTY</th>
                    <th className="p-2 w-28 text-right px-3">COST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center text-slate-800 bg-white">
                  {Array.isArray(viewingPODetails.items) && viewingPODetails.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="p-2 bg-slate-100 font-bold border-r border-slate-200">{item.sn}</td>
                      <td className="p-2 font-bold uppercase border-r border-slate-200 tracking-wide text-slate-900">{item.sku}</td>
                      <td className="p-2 text-left px-3 font-sans font-semibold text-slate-700 border-r border-slate-200">{item.productName}</td>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-200 bg-blue-50/20">{item.qty} units</td>
                      <td className="p-2 text-right px-3 font-bold text-slate-950">₦{(item.costPrice || 0).toLocaleString()}.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-500">STATUS: <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded font-bold uppercase">APPROVED</span></div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase text-slate-700">VALUATION SUM:</span>
                <span className="bg-slate-950 text-emerald-400 font-bold px-4 py-1.5 rounded border border-slate-800 text-sm">
                  ₦{(viewingPODetails.totalCost || 0).toLocaleString()}.00
                </span>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setViewingPODetails(null)} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase shadow tracking-widest rounded cursor-pointer border border-rose-700">✖ CLOSE PREVIEW</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#5c6e91] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-between items-center shadow-inner relative border-t border-white/10">
        <div className="bg-slate-950/20 px-3 py-1 rounded border border-white/10 flex items-center gap-1.5">
          <span>👤 AUTHORIZED SESSION ID:</span> <span className="font-bold text-emerald-300">{staffId}</span>
        </div>
        <div className="flex gap-4 opacity-90 text-[11px]">
          <span>© 2026 Shop-Verse CRM</span>
        </div>
      </footer>
    </div>
  );
}