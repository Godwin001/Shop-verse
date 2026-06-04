import { useState, useEffect, useMemo } from 'react';
import { mockInventoryStorage, type InventoryItem } from './mockInventoryStorage';

interface SupplierRecord {
  code: string;
  name: string;
  status: 'Active' | 'Inactive';
}

const getUniqueCategories = (items: InventoryItem[]): string[] => {
  const defaults = ['FMCG', 'Beverages', 'Toiletries', 'Cosmetics', 'General Store'];
  const existing = items
    .map(i => i.category)
    .filter((cat): cat is string => !!cat && cat.trim() !== '');
  return Array.from(new Set([...defaults, ...existing])).sort();
};

/* ============================================================================
    2. SUB-VIEW VIEW COMPONENT: EDIT/UPDATE ITEM (UNTOUCHED INTEGRATION LAYER)
   ============================================================================ */
export function EditItemView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSuppliers] = useState<SupplierRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shopverse_suppliers');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => { setItems(mockInventoryStorage.getItems()); }, []);
  const availableCategories = useMemo(() => getUniqueCategories(items), [items]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    mockInventoryStorage.updateItem(selectedItem.id, selectedItem);
    setItems(mockInventoryStorage.getItems());
    alert("System Ledger Entry Synchronized successfully.");
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    if (window.confirm(`Are you sure you want to permanently delete data tuple entry: ${selectedItem.itemName}?`)) {
      mockInventoryStorage.deleteItem(selectedItem.id);
      setItems(mockInventoryStorage.getItems());
      setSelectedItem(null);
    }
  };

  const filteredItems = items.filter(i => 
    i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
      <div className="lg:col-span-5 space-y-4 font-mono text-xs">
        <div className="bg-[#7884b0] text-white px-4 py-2 rounded-xl text-center font-bold text-sm tracking-widest uppercase">Metadata Modification Node</div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
          <label className="block text-slate-500 font-bold uppercase mb-1">Index Filter String Lookup</label>
          <input type="text" placeholder="Scan by Name, Code, or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
        </div>

        {selectedItem ? (
          <form onSubmit={handleUpdate} className="space-y-3.5 p-5 bg-white border border-slate-300 rounded-xl shadow-sm">
            <div className="text-[#7884b0] font-bold text-[11px] uppercase tracking-wider border-b pb-1.5 flex items-center justify-between">
              <span>Selected Tuple Vector Reference</span>
              <span className="text-slate-400 font-normal">ID: {selectedItem.id.substring(0,8)}...</span>
            </div>
            <div>
              <label className="block text-slate-400 font-medium uppercase mb-0.5">Edit Item Label Name</label>
              <input type="text" value={selectedItem.itemName} onChange={e => setSelectedItem({...selectedItem, itemName: e.target.value})} required className="w-full p-2 bg-slate-50 border border-slate-300 rounded outline-none" />
            </div>
            <div>
              <label className="block text-slate-400 font-medium uppercase mb-0.5">Choose Supplier</label>
              <select value={selectedItem.supplier} onChange={e => setSelectedItem({...selectedItem, supplier: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded outline-none font-sans text-sm font-semibold text-slate-700">
                {activeSuppliers.map((sup) => <option key={sup.code} value={sup.name}>{sup.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium uppercase mb-0.5">Sale Target Price ($)</label>
                <input type="number" step="0.01" value={selectedItem.salePrice} onChange={e => setSelectedItem({...selectedItem, salePrice: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded outline-none" />
              </div>
              <div>
                <label className="block text-slate-400 font-medium uppercase mb-0.5">Stock Volume Level</label>
                <input type="number" value={selectedItem.quantity} onChange={e => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value) || 0})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 font-medium uppercase mb-0.5">Categorical Mapping</label>
              <select value={selectedItem.category} onChange={e => setSelectedItem({...selectedItem, category: e.target.value})} className="w-full p-2 bg-slate-50 border border-slate-300 rounded outline-none font-sans text-xs font-semibold text-slate-700">
                {availableCategories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-3">
              <button type="submit" className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded uppercase tracking-wider transition-colors shadow-sm cursor-pointer">Save Transformations</button>
              <button type="button" onClick={handleDelete} className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded uppercase tracking-wider transition-colors shadow-sm cursor-pointer">Purge Tuple</button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-400 rounded-xl bg-slate-50 font-sans text-xs">Select an element out of the filtered workspace array registry to pull editable metadata variables into the form structure.</div>
        )}
      </div>

      <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-4 shadow-sm">
        <div className="text-slate-500 font-mono text-xs font-bold uppercase mb-3">Workspace Isolated Matrix:</div>
        <div className="overflow-y-auto max-h-[450px]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-300 uppercase">
                <th className="p-2.5">S/N</th>
                <th className="p-2.5">SKU Code</th>
                <th className="p-2.5">Item Name</th>
                <th className="p-2.5 text-right">Data Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item, index) => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${selectedItem?.id === item.id ? 'bg-blue-50' : ''}`}>
                  <td className="p-2.5 font-bold text-slate-400">{index + 1}</td>
                  <td className="p-2.5 font-bold text-slate-800">{item.itemCode}</td>
                  <td className="p-2.5 text-slate-600 font-sans font-medium">{item.itemName}</td>
                  <td className="p-2.5 text-right">
                    <button onClick={() => setSelectedItem(item)} className="px-3 py-1 bg-[#7884b0] hover:bg-slate-900 text-white rounded text-[10px] uppercase font-bold transition-colors shadow-sm cursor-pointer">Load Config</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
    3. SUB-VIEW VIEW COMPONENT: HISTORY TRACE AUDIT (UNTOUCHED INTEGRATION LAYER)
   ============================================================================ */
export function CheckHistoryView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchField, setSearchField] = useState<'itemName' | 'category'>('itemName');
  const [query, setQuery] = useState('');

  useEffect(() => { setItems(mockInventoryStorage.getItems()); }, []);
  const matchedItems = items.filter(item => item[searchField].toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
      <div className="lg:col-span-4 space-y-4 font-mono text-xs">
        <div className="bg-[#7884b0] text-white px-4 py-2 rounded-xl text-center font-bold text-sm tracking-widest uppercase">Audit Filtering Rules</div>
        <div className="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm space-y-4">
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Target Dimension Column</label>
            <select value={searchField} onChange={e => setSearchField(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold text-slate-700 text-xs">
              <option value="itemName">ITEM PROFILE NAME</option>
              <option value="category">PRODUCT CATEGORY TAXONOMY</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-500 font-bold uppercase mb-1">Lookup Filter Query</label>
            <input type="text" placeholder={`Match on ${searchField === 'itemName' ? 'name trace' : 'category string'}...`} value={query} onChange={e => setQuery(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 bg-white border border-slate-300 rounded-2xl p-5 shadow-sm">
        <div className="text-slate-400 font-mono text-[10px] tracking-wider uppercase mb-3 border-b pb-2">Tenant Ledger Timeline Result Stream Mapping Array</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-300 uppercase text-[11px]">
                <th className="p-2.5">Index</th>
                <th className="p-2.5">Date Ingested</th>
                <th className="p-2.5">SKU Target</th>
                <th className="p-2.5">Name Label String</th>
                <th className="p-2.5">Category Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matchedItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-2.5 text-slate-500 font-semibold">{item.dateAdded}</td>
                  <td className="p-2.5 font-bold text-slate-800">{item.itemCode}</td>
                  <td className="p-2.5 text-slate-600 font-sans font-medium">{item.itemName}</td>
                  <td className="p-2.5"><span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border font-bold text-[10px] tracking-wide uppercase">{item.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
    4. SUB-VIEW VIEW COMPONENT: MAKE COMMENT (UNTOUCHED INTEGRATION LAYER)
   ============================================================================ */
export function MakeCommentView() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(-1);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    setItems(mockInventoryStorage.getItems());
    setComments(mockInventoryStorage.getComments());
  }, []);

  const pushComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIdx === -1 || !commentText.trim()) return alert("Error: Select a data node object.");
    
    const targetItem = items[selectedItemIdx];
    mockInventoryStorage.saveComment({
      itemCode: targetItem.itemCode,
      itemName: targetItem.itemName,
      comment: commentText.trim()
    });

    setComments(mockInventoryStorage.getComments());
    setCommentText('');
    setSelectedItemIdx(-1);
    alert("Operational annotation log committed successfully.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
      <form onSubmit={pushComment} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-300 shadow-sm space-y-4 font-mono text-xs">
        <div className="bg-[#7884b0] text-white px-4 py-2 rounded-xl text-center font-bold text-sm tracking-widest uppercase">Log Observation</div>
        <div>
          <label className="block text-slate-500 font-bold uppercase mb-1">Target Element Association Node</label>
          <select value={selectedItemIdx} onChange={e => setSelectedItemIdx(parseInt(e.target.value))} required className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-sans text-xs">
            <option value={-1}>-- CHOOSE ISOLATED SKU VALUE --</option>
            {items.map((item, index) => <option key={item.id} value={index}>[{item.itemCode}] {item.itemName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-slate-500 font-bold uppercase mb-1">Observations Text Area</label>
          <textarea rows={5} placeholder="Document operational annotations..." value={commentText} onChange={e => setCommentText(e.target.value)} required className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-sans text-sm" />
        </div>
        <button type="submit" className="w-full py-3 bg-[#7884b0] hover:bg-slate-800 text-white font-bold rounded-xl tracking-wider uppercase transition-colors shadow-sm cursor-pointer">Commit Annotation Instance</button>
      </form>

      <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-5 flex flex-col shadow-sm">
        <div className="text-slate-500 font-mono text-xs font-bold uppercase mb-3 pb-1 border-b">Active Tenant Annotation Loop Feed:</div>
        <div className="space-y-4.5 overflow-y-auto max-h-[450px] pr-2 flex-grow">
          {comments.map((c) => (
            <div key={c.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl font-mono text-xs shadow-inner mb-4">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wide">
                <span>📌 TARGET ELEMENT: <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-mono">{c.itemCode}</span> ({c.itemName})</span>
                <span className="text-slate-500">{c.timestamp}</span>
              </div>
              <p className="text-slate-700 font-sans text-sm mt-1 bg-white p-3 rounded-lg border border-slate-300/60 leading-relaxed whitespace-pre-wrap">{c.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}