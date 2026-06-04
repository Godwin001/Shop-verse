import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Link } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const ClickableIdRenderer = (params: any) => {
  return (
    <Link 
      to={`/tech/companies/${params.value}`} 
      className="text-blue-400 font-bold hover:text-blue-300 underline decoration-blue-400/30 underline-offset-4 transition-colors"
    >
      {params.value}
    </Link>
  );
};

export default function CompanyDirectoryPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ACTIONS & CONTROL STATES ---
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const gridRef = useRef<AgGridReact>(null);
  const API_BASE_URL = 'http://127.0.0.1:8000';

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies`);
      setCompanies(response.data);
      setSelectedCompany(null); // Clear active selection on update
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Safe event handling without breaking top-level imports
  const onSelectionChanged = (event: any) => {
    const selectedRows = event.api.getSelectedRows();
    if (selectedRows && selectedRows.length > 0) {
      setSelectedCompany(selectedRows[0]);
    } else {
      setSelectedCompany(null);
    }
  };

  // 1. Create a Company Workspace
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    setActionLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/companies`, {
        company_name: newCompanyName.trim()
      });
      if (response.status === 200 || response.status === 201) {
        setNewCompanyName('');
        setShowAddForm(false);
        await fetchCompanies();
        alert('Company registered successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create company.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Pause / Resume Workspace Toggle
  const handleToggleStatus = async () => {
    if (!selectedCompany) return;
    
    setActionLoading(true);
    const updatedStatus = !selectedCompany.is_active;
    try {
      await axios.put(`${API_BASE_URL}/companies/${selectedCompany.company_id}?is_active=${updatedStatus}`);
      await fetchCompanies();
      alert(`Company ${updatedStatus ? 'Resumed' : 'Paused'} successfully!`);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete Company Infrastructure Row
  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;
    
    const confirmDelete = window.confirm(
      `Warning: Deleting "${selectedCompany.company_name}" will drop all associated staff profiles. Proceed?`
    );
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/companies/${selectedCompany.company_id}`);
      await fetchCompanies();
      alert('Company and staff registry cleared.');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete company.');
    } finally {
      setActionLoading(false);
    }
  };

  const columnDefs = [
    { 
      field: 'company_id', 
      headerName: 'Company UUID / ID', 
      flex: 1.5, 
      filter: true,
      cellRenderer: ClickableIdRenderer,
      checkboxSelection: true 
    },
    { field: 'company_name', headerName: 'Company Name', flex: 1, filter: true },
    { 
      field: 'is_active', 
      headerName: 'Operational Status', 
      flex: 0.8, 
      filter: true,
      valueFormatter: (params: any) => params.value ? "Active" : "Paused"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-mono font-bold tracking-tight text-blue-400">TECHNICIAN CENTRAL</h1>
          <p className="text-slate-400 text-sm mt-1">Global Company Infrastructure Registry</p>
        </header>

        <main className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 font-mono">System Registries</h2>
          
          {/* --- ACTION SYSTEM MANAGEMENT DASHBOARD --- */}
          <div className="mb-6 p-4 bg-slate-900/60 rounded-xl border border-slate-700/40">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                  showAddForm 
                    ? 'bg-slate-700 text-slate-200' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {showAddForm ? '✕ CANCEL' : '➕ REGISTER NEW COMPANY'}
              </button>

              {selectedCompany && (
                <div className="flex flex-wrap gap-3 items-center bg-slate-800 p-2 rounded-lg border border-slate-700/50">
                  <span className="text-xs font-mono text-slate-300">
                    Selected: <strong className="text-blue-400">{selectedCompany.company_name}</strong>
                  </span>

                  <button
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold text-white ${
                      selectedCompany.is_active ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    {selectedCompany.is_active ? '⏸ PAUSE' : '▶ RESUME'}
                  </button>

                  <button
                    onClick={handleDeleteCompany}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-mono font-bold"
                  >
                    🗑 DELETE
                  </button>
                </div>
              )}
            </div>

            {/* Form for Creating Entries */}
            {showAddForm && (
              <form onSubmit={handleAddCompany} className="mt-4 flex gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <input
                  type="text"
                  placeholder="Type Company Name..."
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  disabled={actionLoading}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 flex-1 focus:outline-none focus:border-blue-500 font-mono text-sm"
                  required
                />
                <button 
                  type="submit" 
                  disabled={actionLoading || !newCompanyName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-mono text-xs font-bold rounded-lg"
                >
                  {actionLoading ? 'SAVING...' : 'INITIALIZE'}
                </button>
              </form>
            )}
          </div>
          
          {/* --- DATAGRID DISPLAY LAYER --- */}
          {loading ? (
            <div className="text-center py-10 text-slate-400 animate-pulse font-mono">Querying database registries...</div>
          ) : (
            <div className="ag-theme-alpine-dark w-full" style={{ height: 500 }}>
              <AgGridReact 
                ref={gridRef}
                rowData={companies} 
                columnDefs={columnDefs}
                pagination={true}
                rowSelection="single"
                onSelectionChanged={onSelectionChanged}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}