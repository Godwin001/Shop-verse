import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// AG-GRID GRAPHICS IMPORT LABELS
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function StaffManagementPage() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => localStorage.getItem('staff_id') || 'Offline');
  
  // DYNAMICALLY RETRIEVE CURRENT LOGGED-IN COMPANY ID
  const [currentCompanyId] = useState(() => 
    localStorage.getItem('company_id') || ''
  ); 

  // Component State Matrices
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'support'>('add');
  const [staffList, setStaffList] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');

  // Form Field Inputs State Hooks
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier'); 

  // FETCH STAFF & COMPANY METADATA ALIGNED WITH LOGGED IN ENTITY
  const fetchStaffData = useCallback(async () => {
    if (!currentCompanyId) {
      setError("No logged in company ID session key found in storage.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch staff matching backend endpoint paths perfectly
      const response = await axios.get(`http://127.0.0.1:8000/companies/${currentCompanyId}/staff`);
      setStaffList(response.data);

      // 2. Query company context directly to pull name data arrays
      const companiesResponse = await axios.get('http://127.0.0.1:8000/companies');
      const company = companiesResponse.data.find(
        (c: any) => c.company_id === currentCompanyId
      );
      if (company) {
        setCompanyName(company.company_name);
      }
    } catch (err: any) {
      console.error("API Error Fetch Context Breakdown:", err);
      setError("Failed to load staff list data from management servers.");
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId]);

  // Synchronize when the table workspace components active state shifts
  useEffect(() => {
    if (activeTab === 'list') {
      fetchStaffData();
      setSelectedRow(null);
    }
  }, [activeTab, fetchStaffData]);

  // AG-GRID COLUMNS ALIGNED EXHAUSTIVELY TO SQL DATABASE KEYFIELDS
  const columnDefs = [
    { 
      field: 'user_id', 
      headerName: 'User ID', 
      flex: 1.2,
      filter: true,
      checkboxSelection: true // Enables row clicking reference target for deletes
    },
    { 
      field: 'full_name', 
      headerName: 'Name', 
      flex: 1.5,
      filter: true
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1.8,
      filter: true
    },
    { 
      field: 'user_role', 
      headerName: 'Role', 
      flex: 1.2,
      filter: true,
      cellClass: 'uppercase font-bold text-purple-700 text-center'
    }
  ];

  // ACTION: SAVE / CREATE STAFF IN BACKEND
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompanyId) {
      alert("Session expired error. Log in as a verified business instance again.");
      return;
    }

    const staffPayload = {
      full_name: name,  
      user_id: staffId,
      email: email,            
      password: password,      
      user_role: role,         
      company_id: currentCompanyId 
    };
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/staff', staffPayload);
      if (response.status === 200 || response.status === 201) {
        alert("Staff user registry created successfully!");
        setName(''); setEmail(''); setStaffId(''); setPassword('');
        setActiveTab('list');
      }
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.detail || "Action rejected by core api pipeline."));
    }
  };

  // ACTION: TARGET ROW DELETE FROM DATABASE ECOSYSTEM
  const handleDeleteStaff = async () => {
    if (!selectedRow || !selectedRow.user_id) {
      alert("Please click and select a staff member row inside the grid first.");
      return;
    }

    if (confirm(`Are you absolutely sure you want to delete Staff ID [${selectedRow.user_id}] from this company?`)) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/companies/${currentCompanyId}/staff/${selectedRow.user_id}`
        );
        if (response.status === 200) {
          alert("Staff member configuration successfully deleted.");
          setSelectedRow(null);
          fetchStaffData();
        }
      } catch (error: any) {
        alert("Deletion Error Context: " + (error.response?.data?.detail || "Action rejected by core api pipeline."));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      {/* SYSTEM MAIN LOGO PANEL STRIP */}
      <header className="bg-[#7884b0] text-white py-6 px-6 text-center relative shadow-md">
        <h1 className="text-3xl font-normal tracking-wide uppercase">SUPPORT</h1>
        <p className="text-sm font-medium tracking-widest mt-1 opacity-90 font-mono">SHOP-VERSE MANAGEMENT SYSTEM</p>
      </header>

      {/* WORKSPACE SHELL HUB */}
      <main className="flex-grow p-6 max-w-6xl mx-auto w-full relative flex flex-col lg:flex-row items-start justify-start gap-12 mt-4">
        {/* BACK ACTION TRIGGER */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-6 text-slate-700 hover:text-slate-900 transition-transform hover:scale-105 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer z-50"
        >
          ↩ BACK TO DASHBOARD
        </button>

        {/* LEFT ACTION UTILITY ROW SELECTORS */}
        <div className="w-full lg:w-64 flex flex-col justify-start gap-4 shrink-0 mt-6">
          <button 
            onClick={() => setActiveTab('add')}
            className={`w-full text-center font-sans text-lg font-bold py-4 px-6 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider ${
              activeTab === 'add' ? 'bg-[#5c6894] text-white ring-2 ring-blue-400' : 'bg-[#7884b0] hover:bg-[#65719d] text-white'
            }`}
          >
            Add Staff
          </button>
          
          <button 
            onClick={() => setActiveTab('list')}
            className={`w-full text-center font-sans text-lg font-bold py-4 px-6 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider ${
              activeTab === 'list' ? 'bg-[#5c6894] text-white ring-2 ring-blue-400' : 'bg-[#7884b0] hover:bg-[#65719d] text-white'
            }`}
          >
            View Staff List
          </button>

          <button 
            onClick={() => setActiveTab('support')}
            className={`w-full text-center font-sans text-base font-bold py-4 px-4 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider ${
              activeTab === 'support' ? 'bg-[#5c6894] text-white ring-2 ring-blue-400' : 'bg-[#7884b0] hover:bg-[#65719d] text-white'
            }`}
          >
            Contact Company Support
          </button>
        </div>

        {/* DYNAMIC DATA WORKSPACE PANELS */}
        <div className="flex-grow w-full bg-white/50 p-6 rounded-2xl border border-slate-300/60 min-h-[580px] flex flex-col justify-start">
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded text-red-700 font-mono text-xs">
              {error}
            </div>
          )}

          {/* VIEW: ADD ACCOUNT FRAME WORKFLOW */}
          {activeTab === 'add' && (
            <div className="w-full max-w-xl mx-auto">
              <h2 className="text-2xl font-sans text-center font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Add New Staff Account
              </h2>
              <p className="text-center text-[11px] font-mono text-blue-700 font-bold mb-6"> Scoped Context ID: {currentCompanyId || 'None Found'}</p>
              
              <form onSubmit={handleAddStaff} className="flex flex-col gap-5 font-sans">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-700 min-w-[140px]">Name:</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="flex-grow bg-white border border-slate-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7884b0] text-sm shadow-inner" placeholder="Enter Full Name" required />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-700 min-w-[140px]">Staff ID / User:</label>
                  <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)} className="flex-grow bg-white border border-slate-300 px-4 py-2 rounded-full font-mono focus:outline-none focus:ring-2 focus:ring-[#7884b0] text-sm shadow-inner" placeholder="e.g. ST-009" required />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-700 min-w-[140px]">Email Address:</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-grow bg-white border border-slate-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7884b0] text-sm shadow-inner" placeholder="staff@company.com" required />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-700 min-w-[140px]">Role:</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="flex-grow bg-white border border-slate-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7884b0] text-sm shadow-inner cursor-pointer font-sans">
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                    <option value="technician">Technician</option>
                    <option value="inventory">Inventory</option>
                  </select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-slate-700 min-w-[140px]">Password:</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-grow bg-white border border-slate-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#7884b0] text-sm shadow-inner placeholder-slate-300" placeholder="••••••••" required />
                </div>

                <div className="mt-4 flex justify-center">
                  <button type="submit" className="bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-base font-bold py-2.5 px-10 rounded-full shadow-md transition-transform active:scale-95 cursor-pointer uppercase tracking-wider">
                    Save / Update
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: AG-GRID INJECTED STAFF LEDGER GRID VIEW */}
          {activeTab === 'list' && (
            <div className="w-full flex flex-col justify-between h-full flex-grow">
              <div>
                <h2 className="text-2xl font-mono text-center font-bold text-slate-700 mb-1 uppercase tracking-tight">
                  COMPANY STAFF REGISTRY
                </h2>
                {companyName && (
                  <p className="text-center text-sm font-sans text-slate-600 mb-1">
                    Company: <span className="font-semibold text-slate-800">{companyName}</span>
                  </p>
                )}
                <p className="text-[10px] font-mono text-slate-400 mb-4 text-center">ID: {currentCompanyId}</p>
                
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-600 font-mono">
                    Staff Members ({staffList.length})
                  </h3>
                </div>

                {isLoading ? (
                  <div className="text-center py-20 font-mono text-sm text-slate-500 tracking-wider uppercase animate-pulse">
                    Loading staff data...
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="text-center py-20 font-mono text-sm text-slate-400 bg-white/70 rounded-xl border border-slate-200">
                    No staff members found for this company.
                  </div>
                ) : (
                  /* INJECTED ALPINE ALPINE-DARK AG-GRID CONTROLLER GRID MATRIX */
                  <div className="ag-theme-alpine w-full shadow-md rounded-xl overflow-hidden border border-slate-300" style={{ height: 400 }}>
                    <AgGridReact
                      rowData={staffList}
                      columnDefs={columnDefs}
                      pagination={true}
                      paginationPageSize={10}
                      rowSelection="single"
                      onRowClicked={(event) => setSelectedRow(event.data)}
                      defaultColDef={{
                        sortable: true,
                        resizable: true,
                        filter: true
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ACTION ROW BUTTON FOR CONTROL PURGING */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={handleDeleteStaff}
                  disabled={!selectedRow || isLoading}
                  className={`font-sans text-sm font-bold py-3 px-8 rounded-full shadow-md transition-all active:scale-95 uppercase tracking-wider ${
                    selectedRow 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Delete Selected Staff 🗑
                </button>
              </div>
            </div>
          )}

          {/* VIEW: CONTACT SUPPORT DIRECTORY INFO PANEL */}
          {activeTab === 'support' && (
            <div className="w-full max-w-xl mx-auto text-center flex flex-col items-center justify-center pt-8">
              <div className="text-5xl mb-4">🛡️</div>
              <h2 className="text-2xl font-sans font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Enterprise Support Desk
              </h2>
              <p className="text-sm font-sans text-slate-500 max-w-md mb-6">
                Having infrastructure configuration issues or require database restoration? Contact our national technical operators context hotline directly.
              </p>
              
              <div className="bg-slate-100 border border-slate-300 rounded-2xl p-6 w-full font-mono text-xs text-left flex flex-col gap-3 shadow-inner">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-500 uppercase">Support Email:</span>
                  <a href="mailto:support@shop-verse.ng" className="text-blue-600 font-bold underline">support@shop-verse.ng</a>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-500 uppercase">Direct Hotlines:</span>
                  <span className="font-bold text-slate-800">+234 813 8529 746</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500 uppercase">Service Hours:</span>
                  <span className="font-semibold text-emerald-600">24/7 Operations Coverage</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* SYSTEM BRANDED FOOTER STRIP */}
      <footer className="bg-[#7884b0] text-white py-3 px-6 text-xs font-mono tracking-wider flex justify-between items-center shadow-inner relative border-t border-white/10">
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