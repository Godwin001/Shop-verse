import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockInventoryStorage, type InventoryItem, type InvoiceHistoryLog } from './mockInventoryStorage';
import { EditItemView, CheckHistoryView, MakeCommentView } from './InventoryChildViews';

type SubView = 'MAIN' | 'ADD' | 'EDIT' | 'HISTORY' | 'COMMENT';

interface SupplierRecord {
  code: string;
  name: string;
  status: 'Active' | 'Inactive';
}

interface IntakeRowItem {
  sn: number;
  sku: string;
  productName: string;
  qty: number;
  costPrice: number;
  sellPrice: number;
  expDate: string;
  category: string;
}

const FALLBACK_SUPPLIERS: SupplierRecord[] = [
  { code: 'SUP-001', name: 'AloFood Ltd', status: 'Active' },
  { code: 'SUP-002', name: 'NBC Nigeria', status: 'Active' },
  { code: 'SUP-003', name: 'Unilever Nig', status: 'Active' },
  { code: 'SUP-004', name: 'FrieslandCamp', status: 'Active' },
];

export default function InventorySubsystem() {
  const [currentView, setCurrentView] = useState<SubView>('MAIN');
  const navigate = useNavigate();
  
  const companyName = localStorage.getItem('company_name') || 'No Active Workspace Found';
  const companyId = localStorage.getItem('company_id') || 'No ID Tracked';
  const staffId = localStorage.getItem('staff_id') || 'Admin_User';

  const renderLayoutWrapper = (title: string, children: React.ReactNode) => (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative select-none w-full">
      <header className="bg-[#7884b0] text-white py-4 px-6 md:px-12 shadow-md text-center relative border-b border-black/10">
        <h1 className="text-xl font-bold tracking-widest uppercase">{title}</h1>
        <p className="text-xs font-medium mt-0.5 tracking-wider font-mono opacity-90">SHOP-VERSE MULTI-TENANT ENTERPRISE PLATFORM</p>
        <div className="absolute right-6 top-3 hidden md:flex flex-col text-right text-[10px] font-mono text-slate-100 bg-black/10 py-1 px-2.5 rounded border border-white/10">
          <span>🏢 WORKSPACE: <span className="font-bold text-yellow-300">{companyName}</span></span>
        </div>
      </header>

      <main className="flex-grow p-4 relative w-full mx-auto max-w-[1700px]">
        <button 
          onClick={() => currentView === 'MAIN' ? navigate('/dashboard') : setCurrentView('MAIN')}
          className="absolute top-4 left-6 text-slate-700 hover:text-slate-900 transition-transform hover:scale-105 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer z-50"
        >
          {currentView === 'MAIN' ? '↩ BACK TO DASHBOARD' : '↩ SUBSYSTEM ROOT MENU'}
        </button>
        {children}
      </main>

      <footer className="bg-[#7884b0] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-between items-center shadow-inner relative border-t border-white/10">
        <div className="bg-slate-950/20 px-3 py-1 rounded border border-white/10 flex items-center gap-1.5">
          <span>👤 AUTHORIZED SESSION ID:</span> <span className="font-bold text-emerald-300">{staffId}</span>
        </div>
        <div>© 2026 Shop-Verse</div>
      </footer>
    </div>
  );

  switch (currentView) {
    case 'ADD': return renderLayoutWrapper('INVENTORY COCKPIT MANAGEMENT', <AddAndIntakeCombinedView staffId={staffId} />);
    case 'EDIT': return renderLayoutWrapper('INVENTORY MANAGEMENT', <EditItemView />);
    case 'HISTORY': return renderLayoutWrapper('AUDIT HISTORY LEDGER', <CheckHistoryView />);
    case 'COMMENT': return renderLayoutWrapper('OPERATIONAL FEEDBACK', <MakeCommentView />);
    default: 
      return renderLayoutWrapper('INVENTORY SUBSYSTEM HUB', (
        <div className="h-full flex items-center justify-center py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
            {[
              { id: 'ADD', label: 'Supplier Stock Intake', desc: 'Process stock updates via PO pulls or split cockpit panel input' },
              { id: 'EDIT', label: 'Modify Catalog', desc: 'Modify cost rates, prices, and adjust quantities' },
              { id: 'HISTORY', label: 'Check History', desc: 'Audit creation timelines and categorical vectors' },
              { id: 'COMMENT', label: 'Make Comment', desc: 'File stock annotations and operational logs' }
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => setCurrentView(btn.id as SubView)} 
                className="bg-white hover:bg-slate-50 text-slate-800 p-8 rounded-2xl border border-slate-300/80 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between group cursor-pointer mt-4 md:mt-0"
              >
                <span className="font-mono text-lg font-bold uppercase tracking-wider text-[#7884b0] group-hover:text-slate-900 transition-colors">{btn.label}</span>
                <span className="text-slate-400 font-sans text-xs mt-2 font-medium">{btn.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ));
  }
}

/* ============================================================================
    SPLIT SCREEN COCKPIT DESIGN: LEFT INPUT PANEL vs RIGHT REFLIECTION GRID
   ============================================================================ */
function AddAndIntakeCombinedView({ staffId }: { staffId: string }) {
  const [suppliers] = useState<SupplierRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shopverse_suppliers');
      return saved ? JSON.parse(saved) : FALLBACK_SUPPLIERS;
    } catch { return FALLBACK_SUPPLIERS; }
  });

  const [masterInventory, setMasterInventory] = useState<InventoryItem[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceHistoryLog[]>([]);
  
  // Header state parameters mirroring "image 11.png" blueprint layout structural blocks
  const [supplierHeader, setSupplierHeader] = useState('');
  const [dateHeader, setDateHeader] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceHeader, setInvoiceHeader] = useState('');
  const [poSearchInput, setPoSearchInput] = useState('');

  // Right-side reflection ledger data source matrix array
  const [intakeRows, setIntakeRows] = useState<IntakeRowItem[]>([]);
  const [selectedRowSn, setSelectedRowSn] = useState<number | null>(null);
  const [selectedHistoryInvoice, setSelectedHistoryInvoice] = useState<InvoiceHistoryLog | null>(null);

  // Left-side working data entry state machinery variables
  const [formSku, setFormSku] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formQty, setFormQty] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSellPrice, setFormSellPrice] = useState('');
  const [formExpDate, setFormExpDate] = useState('');
  const [formCategory, setFormCategory] = useState('General Store');
  const [isNewProductDetected, setIsNewProductDetected] = useState(false);

  useEffect(() => {
    setMasterInventory(mockInventoryStorage.getItems());
    setInvoiceHistory(mockInventoryStorage.getInvoices());

    // Auto seed purchase order registries for simulation verification environments
    if (!localStorage.getItem('shopverse_purchase_orders')) {
      localStorage.setItem('shopverse_purchase_orders', JSON.stringify([
        {
          poNumber: 'PO-2026-001',
          supplier: 'AloFood Ltd',
          items: [
            { sku: 'SKU-MILK', productName: 'Premium Whole Milk 1L', qty: 50, costPrice: 1200 },
            { sku: 'SKU-BREAD', productName: 'Gourmet Sliced Bread', qty: 30, costPrice: 700 }
          ]
        }
      ]));
    }
  }, []);

  const cumulativeValuation = intakeRows.reduce((acc, row) => acc + (row.qty * row.costPrice), 0);

  // 🔍 Watch for SKU codes to toggle read-only flags or auto-resolve item names
  const handleSkuInputChange = (val: string) => {
    const code = val.toUpperCase().trim();
    setFormSku(code);
    
    const matched = masterInventory.find(inv => inv.itemCode.toUpperCase().trim() === code);
    if (matched) {
      setFormProductName(matched.itemName);
      setFormCostPrice(String(matched.costPrice));
      setFormSellPrice(String(matched.salePrice));
      setFormExpDate(matched.expiryDate || '');
      setFormCategory(matched.category || 'General Store');
      setIsNewProductDetected(false);
    } else {
      setFormProductName('');
      setFormCostPrice('');
      setFormSellPrice('');
      setFormExpDate('');
      setIsNewProductDetected(true);
    }
  };

  // Emulate hardware scan injection modules trigger mechanisms
  const triggerScanEmulation = () => {
    const hardwareInput = prompt("Scan tracking barcode reference label string indicator token:");
    if (hardwareInput) handleSkuInputChange(hardwareInput);
  };

  // 📂 Load entire bulk datasets from a Purchase Order reference token
  const handleLoadPurchaseOrder = () => {
    if (!poSearchInput.trim()) return alert('Provide a target valid Purchase Order sequence identifier.');
    try {
      const poCacheRaw = localStorage.getItem('shopverse_purchase_orders');
      if (!poCacheRaw) return alert('No Purchase Order sequence vectors mapping logs discovered.');
      
      const poList: any[] = JSON.parse(poCacheRaw);
      const targetPo = poList.find(po => po.poNumber.toUpperCase().trim() === poSearchInput.toUpperCase().trim());

      if (!targetPo) return alert(`PO configuration tracking instance sequence "${poSearchInput}" not located.`);

      setSupplierHeader(targetPo.supplier);
      
      const generatedRows: IntakeRowItem[] = targetPo.items.map((item: any, idx: number) => {
        const matchedItem = masterInventory.find(inv => inv.itemCode.toUpperCase().trim() === item.sku.toUpperCase().trim());
        return {
          sn: idx + 1,
          sku: item.sku,
          productName: item.productName,
          qty: item.qty,
          costPrice: item.costPrice,
          sellPrice: matchedItem ? matchedItem.salePrice : 0,
          expDate: matchedItem ? matchedItem.expiryDate : '',
          category: matchedItem ? matchedItem.category : 'General Store'
        };
      });

      setIntakeRows(generatedRows);
      alert(`Successfully synchronized ${generatedRows.length} matrix object rows out of context: ${targetPo.poNumber}`);
    } catch (err) {
      alert('Error extracting mapping configuration parameters.');
    }
  };

  // ➕ Append data entry line values directly into the right-hand reflection worksheet
  const appendEntryRowToMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim()) return alert('SKU product variable field cannot remain empty.');
    if (!formProductName.trim()) return alert('Item Description name designation label is required.');
    
    const qtyNum = parseInt(formQty) || 0;
    const costNum = parseFloat(formCostPrice) || 0;
    const sellNum = parseFloat(formSellPrice) || 0;

    if (qtyNum <= 0) return alert('Quantity dimension matrix input must be positive.');

    const newRow: IntakeRowItem = {
      sn: intakeRows.length + 1,
      sku: formSku.toUpperCase().trim(),
      productName: formProductName.trim(),
      qty: qtyNum,
      costPrice: costNum,
      sellPrice: sellNum,
      expDate: formExpDate,
      category: formCategory
    };

    setIntakeRows(prev => [...prev, newRow]);
    
    // Clear left working entry parameters for subsequent item captures
    setFormSku('');
    setFormProductName('');
    setFormQty('');
    setFormCostPrice('');
    setFormSellPrice('');
    setFormExpDate('');
    setIsNewProductDetected(false);
  };

  // ⚡ Side-dock actions block triggers matching "image 11.png"
  const triggerEditNotification = () => {
    if (selectedRowSn === null) return alert('Highlight a row index within the spreadsheet matrix canvas.');
    const row = intakeRows.find(r => r.sn === selectedRowSn);
    if (row) {
      setFormSku(row.sku);
      setFormProductName(row.productName);
      setFormQty(String(row.qty));
      setFormCostPrice(String(row.costPrice));
      setFormSellPrice(String(row.sellPrice));
      setFormExpDate(row.expDate);
      setFormCategory(row.category);
      alert(`Loaded line context index S/N ${selectedRowSn} back into left console panel for overrides.`);
    }
  };

  const removeSelectedRow = () => {
    if (selectedRowSn === null) return alert('Highlight a structural table tracking entry line to drop.');
    const filtered = intakeRows.filter(r => r.sn !== selectedRowSn);
    setIntakeRows(filtered.map((r, i) => ({ ...r, sn: i + 1 })));
    setSelectedRowSn(null);
  };

  const clearEntireWorksheet = () => {
    if (window.confirm('Wipe out all current transient ledger worksheet layout fields?')) {
      setIntakeRows([]);
      setSupplierHeader('');
      setInvoiceHeader('');
      setPoSearchInput('');
      setSelectedRowSn(null);
    }
  };

  // 🚀 Write live right-hand structural workspace metrics into historical engine vectors
  const handleCommitStockUpdate = () => {
    if (intakeRows.length === 0) return alert('Spreadsheet matrix reflection canvas is currently blank.');
    if (!supplierHeader) return alert('Assign a physical matching supplier tracking choice header.');
    if (!invoiceHeader.trim()) return alert('Invoice trace tracking validation identification reference number string is required.');

    const payloadItems: InventoryItem[] = intakeRows.map(row => ({
      id: '',
      itemCode: row.sku,
      itemName: row.productName,
      supplier: supplierHeader,
      invoiceNumber: invoiceHeader.trim(),
      costPrice: row.costPrice,
      salePrice: row.sellPrice,
      quantity: row.qty,
      salePercentage: row.costPrice > 0 ? parseFloat((((row.sellPrice - row.costPrice) / row.costPrice) * 100).toFixed(1)) : 0,
      expiryDate: row.expDate,
      category: row.category
    }));

    mockInventoryStorage.pushInvoice({
      invoiceNo: invoiceHeader.trim(),
      supplier: supplierHeader,
      totalCost: cumulativeValuation,
      staffId: staffId,
      date: dateHeader,
      items: payloadItems
    });

    setMasterInventory(mockInventoryStorage.getItems());
    setInvoiceHistory(mockInventoryStorage.getInvoices());

    // Purge variables completely
    setIntakeRows([]);
    setInvoiceHeader('');
    setPoSearchInput('');
    setSelectedRowSn(null);

    alert('Stock counts synchronized. Matrix payload successfully pushed to history records.');
  };

  return (
    <div className="flex flex-col gap-6 mt-10 w-full animate-fade-in">
      
      {/* GLOBAL MANAGEMENT MODULE ROW PANEL BAR */}
      <div className="bg-white p-4 border border-slate-300 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between font-mono text-xs w-full">
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <span className="font-bold text-slate-700 whitespace-nowrap">📥 PO STREAM INTERFACE:</span>
          <input 
            type="text" 
            placeholder="Search Target Purchase Order Code string..." 
            value={poSearchInput}
            onChange={e => setPoSearchInput(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-400 font-bold uppercase rounded outline-none text-slate-800"
          />
        </div>
        <button 
          onClick={handleLoadPurchaseOrder}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-950 text-white font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
        >
          Parse Incoming PO Document Matrix
        </button>
      </div>

      {/* COCKPIT WORKSPACE ARRANGEMENT CORE BODY BLOCK CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        
        {/* ====================================================================
            LEFT FIELD PANEL: DYNAMIC WORKING SYSTEM DATA CAPTURE CONTROL BOARD
           ==================================================================== */}
        <div className="lg:col-span-4 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4 font-mono text-xs">
          <div className="bg-[#7884b0] text-white py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-center text-xs">
            Data Entry Control Board
          </div>

          <form onSubmit={appendEntryRowToMatrix} className="space-y-3">
            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1 flex justify-between">
                <span>Scan / Product SKU Code</span>
                <span className="text-blue-600 cursor-pointer hover:underline" onClick={triggerScanEmulation}>[📷 Scan Device Mode]</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="Type or click Scan code pointer..." 
                value={formSku}
                onChange={e => handleSkuInputChange(e.target.value)}
                className="w-full p-2 border-2 border-slate-400 rounded bg-slate-50 font-bold uppercase outline-none focus:border-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1">Product Description Label Name</label>
              <input 
                type="text" 
                required
                placeholder={isNewProductDetected ? "Enter name string variable for missing catalog entry..." : "Auto-resolved description vector variable"}
                value={formProductName}
                onChange={e => setFormProductName(e.target.value)}
                readOnly={!isNewProductDetected}
                className={`w-full p-2 border rounded font-sans text-xs ${!isNewProductDetected ? 'bg-slate-100 border-slate-300 font-semibold text-slate-600' : 'bg-amber-50 border-amber-400 font-bold text-slate-900 focus:outline-none'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Quantity Ingest</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="0" 
                  value={formQty}
                  onChange={e => setFormQty(e.target.value)}
                  className="w-full p-2 border border-slate-400 rounded bg-white text-center font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Expiry Date Stamp</label>
                <input 
                  type="date" 
                  value={formExpDate}
                  onChange={e => setFormExpDate(e.target.value)}
                  className="w-full p-2 border border-slate-400 rounded bg-white text-center text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Cost Acquisition (₦)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={formCostPrice}
                  onChange={e => setFormCostPrice(e.target.value)}
                  className="w-full p-2 border border-slate-400 rounded bg-white text-right font-bold text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold uppercase mb-1">Resale Target Price (₦)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={formSellPrice}
                  onChange={e => setFormSellPrice(e.target.value)}
                  className="w-full p-2 border border-blue-400 rounded bg-blue-50/10 text-right font-bold text-blue-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-bold uppercase mb-1">Product Category Group Node</label>
              <select 
                value={formCategory} 
                onChange={e => setFormCategory(e.target.value)}
                className="w-full p-2 border border-slate-400 rounded font-sans text-xs bg-white text-slate-700 font-medium"
              >
                <option value="General Store">GENERAL STORE ENTITY</option>
                <option value="FMCG">FMCG LOGISTICS</option>
                <option value="Beverages">BEVERAGES & DRINKS</option>
                <option value="Toiletries">CLEANING & TOILETRIES</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full mt-4 py-3 bg-[#7884b0] hover:bg-slate-900 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md text-center block cursor-pointer"
            >
              Append Item to Matrix Line ➔
            </button>
          </form>
        </div>

        {/* ====================================================================
            RIGHT FIELD PANEL: LAYOUT BLUEPRINT MATCHING SPREADSHEET (IMAGE 11)
           ==================================================================== */}
        <div className="lg:col-span-8 flex flex-col xl:flex-row gap-3 items-start w-full">
          
          {/* CORE ACCOUNTING CANVAS LAYOUT SHEET */}
          <div className="w-full xl:flex-grow bg-white border-2 border-slate-900 shadow-xl p-4 font-mono text-xs relative overflow-x-auto min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="text-center font-bold text-sm tracking-widest border-b border-slate-900 pb-2 mb-3 uppercase text-slate-800">
                SUPPLIER'S UPDATE WORKSPACE CANVAS
              </div>

              {/* Dynamic Metadata Section Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border border-slate-900 p-2.5 mb-3 bg-slate-50/80">
                <div className="flex items-center gap-1">
                  <span className="font-bold whitespace-nowrap">SUPLIER:</span>
                  <select 
                    value={supplierHeader}
                    onChange={e => setSupplierHeader(e.target.value)}
                    className="flex-grow p-1 border border-slate-400 bg-white font-sans text-[11px] font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="">-- CHOOSE SUPPLIER --</option>
                    {suppliers.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold">DATE:</span>
                  <input type="date" value={dateHeader} onChange={e => setDateHeader(e.target.value)} className="flex-grow p-0.5 border border-slate-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-blue-900">INVOICE:</span>
                  <input 
                    type="text" 
                    placeholder="Reference Stamp ID" 
                    value={invoiceHeader} 
                    onChange={e => setInvoiceHeader(e.target.value)} 
                    className="flex-grow p-0.5 border border-blue-400 bg-white px-2 uppercase font-bold" 
                  />
                </div>
              </div>

              {/* Grid Spreadsheet Canvas Matrix */}
              <div className="overflow-x-auto border-t border-l border-r border-slate-900 w-full">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-900 text-center text-[10px]">
                      <th className="p-1.5 border-r border-slate-900 w-8">S/N</th>
                      <th className="p-1.5 border-r border-slate-900 w-28 text-left px-2">SKU</th>
                      <th className="p-1.5 border-r border-slate-900 text-left px-2">PRODUCT NAME</th>
                      <th className="p-1.5 border-r border-slate-900 w-12">QTY</th>
                      <th className="p-1.5 border-r border-slate-900 w-20 text-right px-2">COST PRICE</th>
                      <th className="p-1.5 border-r border-slate-900 w-20 text-right px-2">SELL PRICE</th>
                      <th className="p-1.5 w-24">EXP. DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 text-center text-[11px]">
                    {intakeRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-slate-400 font-sans italic tracking-wider bg-slate-50/40">
                          Spreadsheet canvas matrix is empty. Construct records on the left panel input deck to append entries.
                        </td>
                      </tr>
                    ) : (
                      intakeRows.map((row) => (
                        <tr 
                          key={row.sn}
                          onClick={() => setSelectedRowSn(row.sn)}
                          className={`transition-colors cursor-pointer ${selectedRowSn === row.sn ? 'bg-amber-100 font-bold text-slate-950' : 'hover:bg-slate-50/80 text-slate-700'}`}
                        >
                          <td className="p-1.5 border-r border-slate-900 font-bold bg-slate-50">{row.sn}</td>
                          <td className="p-1.5 border-r border-slate-900 text-left px-2 font-bold uppercase text-slate-900">{row.sku}</td>
                          <td className="p-1.5 border-r border-slate-900 text-left px-2 font-sans text-slate-600 font-medium">{row.productName}</td>
                          <td className="p-1.5 border-r border-slate-900 font-mono font-bold text-slate-900 bg-slate-50/30">{row.qty}</td>
                          <td className="p-1.5 border-r border-slate-900 text-right px-2 font-bold">₦{row.costPrice.toLocaleString()}.00</td>
                          <td className="p-1.5 border-r border-slate-900 text-right px-2 font-bold text-blue-900 bg-blue-50/10">₦{row.sellPrice.toLocaleString()}.00</td>
                          <td className="p-1.5 text-slate-500 font-mono text-[10px]">{row.expDate || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

           {/* Reflection Layout Footer Parameters Summary Blocks */}
            <div className="mt-4 space-y-1.5">
              <div className="grid grid-cols-12 border-2 border-slate-900 bg-slate-100 font-bold text-center items-center divide-x divide-slate-900">
                <div className="col-span-3 p-2 bg-slate-200 uppercase text-[10px] tracking-wider">
                  Total Cost Valuation:
                </div>
                <div className="col-span-9 p-2 text-right px-4 text-xs font-mono text-slate-700 bg-white">
                  ₦{intakeRows.reduce((acc, row) => acc + (row.qty * row.costPrice), 0).toLocaleString()}.00
                </div>
              </div>

              <div className="grid grid-cols-12 border-2 border-slate-900 bg-slate-100 font-bold text-center items-center divide-x divide-slate-900">
                <div className="col-span-3 p-2 bg-blue-100 uppercase text-[10px] tracking-wider text-blue-900">
                  Total Selling Value:
                </div>
                <div className="col-span-9 p-2 text-right px-4 text-sm font-mono text-blue-900 bg-white font-bold">
                  ₦{intakeRows.reduce((acc, row) => acc + (row.qty * row.sellPrice), 0).toLocaleString()}.00
                </div>
              </div>

              <div className="border-l border-r border-b border-slate-900 p-2 text-center text-[10px] text-slate-400 font-mono tracking-widest bg-slate-50/50">
                SIGN: ___________________________
              </div>
            </div>
          </div>

          {/* SIDE DOCK CONTROLS PANEL BLOCK MATCHING THE BLUEPRINT MATRIX EXCEL ATTACHMENT */}
          <div className="w-full xl:w-40 flex flex-row xl:flex-col gap-1.5 font-mono text-[10px] font-bold uppercase">
            <button onClick={triggerEditNotification} className="flex-1 xl:w-full py-2.5 bg-white border border-slate-500 hover:bg-slate-100 text-slate-900 shadow-sm rounded text-center cursor-pointer">
              EDIT
            </button>
            <button onClick={removeSelectedRow} className="flex-1 xl:w-full py-2.5 bg-[#f5d0c5] border border-rose-300 hover:bg-rose-600 text-rose-900 hover:text-white shadow-sm rounded text-center cursor-pointer transition-colors">
              DELETE
            </button>
            <button onClick={clearEntireWorksheet} className="flex-1 xl:w-full py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-sm rounded text-center cursor-pointer transition-colors">
              CLEAR ALL
            </button>
            <button onClick={() => alert('Worksheet cache parameters synced.')} className="flex-1 xl:w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded text-center cursor-pointer transition-colors">
              SAVE
            </button>
            <button onClick={handleCommitStockUpdate} className="flex-1 xl:w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[10px] shadow-md rounded text-center border border-emerald-800 tracking-tight cursor-pointer transition-colors">
              UPDATE STOCK ⚡
            </button>
          </div>

        </div>
      </div>

      {/* LOWER HISTORICAL COMPONENT LEDGER BLOCK CAPTURE */}
      <div className="w-full bg-white border border-slate-300 rounded-2xl p-4 shadow-sm mt-4">
        <h3 className="text-slate-800 font-mono text-xs font-bold uppercase mb-3">
          📜 Structural Intake Audit History Stream Logs (Layout 11)
        </h3>
        
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left font-mono text-xs border-collapse text-center">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                <th className="p-3">S/N</th>
                <th className="p-3 text-left">INVOICE NO</th>
                <th className="p-3 text-left">SUPPLIER STAMP</th>
                <th className="p-3 text-right px-6">TOTAL VALUE</th>
                <th className="p-3">STAFF ID</th>
                <th className="p-3">DATE INGESTED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {invoiceHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-slate-400 font-sans italic">
                    No historic intake data payloads discovered inside local storage matrices.
                  </td>
                </tr>
              ) : (
                invoiceHistory.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 text-left font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="p-3 text-left font-sans text-xs">{inv.supplier}</td>
                    <td className="p-3 text-right font-bold text-blue-900 px-6">₦{inv.totalCost.toLocaleString()}.00</td>
                    <td className="p-3 font-semibold text-emerald-700">{inv.staffId}</td>
                    <td className="p-3 text-slate-500">{inv.date}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => setSelectedHistoryInvoice(inv)}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold uppercase text-[10px] px-3 py-1 rounded cursor-pointer shadow-sm"
                      >
                        OPEN 👁️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OVERLAY POPUP ARCHIVE AUDITOR OVERVIEW SCREEN */}
      {selectedHistoryInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-slate-950 w-full max-w-4xl p-5 font-mono shadow-2xl relative">
            <h4 className="text-center font-bold text-sm text-slate-900 uppercase border-b border-slate-950 pb-2 mb-3 tracking-wider">
              HISTORIC STOCK INTAKE LEDGER DEEP AUDIT
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] bg-slate-50 border border-slate-300 p-2 rounded mb-3">
              <div><span className="font-bold text-slate-400">INVOICE:</span> <span className="font-bold text-slate-900">{selectedHistoryInvoice.invoiceNo}</span></div>
              <div><span className="font-bold text-slate-400">SUPPLIER:</span> <span>{selectedHistoryInvoice.supplier}</span></div>
              <div><span className="font-bold text-slate-400">OPERATOR:</span> <span className="text-emerald-700">{selectedHistoryInvoice.staffId}</span></div>
              <div><span className="font-bold text-slate-400">DATE:</span> <span>{selectedHistoryInvoice.date}</span></div>
            </div>

            <div className="overflow-x-auto max-h-[200px] border border-slate-900 rounded mb-3">
              <table className="w-full text-left text-[11px] border-collapse text-center">
                <thead className="bg-slate-900 text-white font-bold sticky top-0 uppercase text-[10px]">
                  <tr>
                    <th className="p-2 w-10">INDEX</th>
                    <th className="p-2 w-28">SKU</th>
                    <th className="p-2 text-left px-3">PRODUCT LABELS</th>
                    <th className="p-2 w-16">QTY</th>
                    <th className="p-2 w-24 text-right px-3">COST</th>
                    <th className="p-2 w-24 text-right px-3">RESALE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                  {selectedHistoryInvoice.items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 bg-slate-50 font-bold">{i + 1}</td>
                      <td className="p-2 font-bold uppercase text-blue-900">{item.itemCode}</td>
                      <td className="p-2 text-left px-3 font-sans text-xs">{item.itemName}</td>
                      <td className="p-2 font-bold">{item.quantity}</td>
                      <td className="p-2 text-right px-3">₦{item.costPrice.toLocaleString()}.00</td>
                      <td className="p-2 text-right px-3 font-bold text-emerald-700">₦{item.salePrice.toLocaleString()}.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center border-t border-slate-400 pt-2 text-xs">
              <span className="font-bold text-emerald-800">STATUS: COMMITTED</span>
              <div className="font-bold">
                TOTAL VALUE: <span className="bg-slate-900 text-emerald-400 px-3 py-1 rounded ml-1">₦{selectedHistoryInvoice.totalCost.toLocaleString()}.00</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setSelectedHistoryInvoice(null)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded cursor-pointer"
              >
                ✖ CLOSE OVERLAY
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}