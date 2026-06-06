import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community'; // Added ColDef import
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

// 1. ADDED: Define an explicit interface matching your SQL field keys
interface StaffMember {
  user_id: string | number;
  full_name: string;
  email: string;
  user_role: string;
}

export default function CompanyStaffPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  
  // 2. HIGHLIGHTED FIX: Typed your useState hook with your interface instead of leaving it empty
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        
        const staffResponse = await axios.get(
          `https://bright-bats-warn.loca.lt/companies/${companyId}/staff`
        );
        setStaff(staffResponse.data);

        const companiesResponse = await axios.get('https://bright-bats-warn.loca.lt/companies');
        const company = companiesResponse.data.find(
          (c: any) => c.company_id === companyId
        );
        if (company) {
          setCompanyName(company.company_name);
        }
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError('Failed to load staff data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchStaffData();
    }
  }, [companyId]);

  // 3. HIGHLIGHTED FIX: Explicitly typed the column array configuration with ColDef<StaffMember>[]
  const columnDefs: ColDef<StaffMember>[] = [
    { 
      field: 'user_id', 
      headerName: 'User ID', 
      flex: 1.2,
      filter: true
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
      filter: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/tech/companies')}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-3 font-mono text-sm">
              ← Back to Companies
            </button>
            <h1 className="text-3xl font-mono font-bold tracking-tight text-blue-400">
              COMPANY STAFF REGISTRY
            </h1>
            {companyName && (
              <p className="text-slate-400 text-sm mt-2">
                Company: <span className="text-slate-300 font-semibold">{companyName}</span>
              </p>
            )}
            {companyId && (
              <p className="text-slate-500 text-xs mt-1 font-mono">
                ID: {companyId}
              </p>
            )}
          </div>
        </header>

        <main className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200 font-mono">
              Staff Members ({staff.length})
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded text-red-300 font-mono text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-slate-400 animate-pulse font-mono">
              Loading staff data...
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-mono">
              No staff members found for this company.
            </div>
          ) : (
            <div className="ag-theme-alpine-dark w-full" style={{ height: 500 }}>
              {/* 4. HIGHLIGHTED FIX: Added the matching <StaffMember> type assignment string parameter directly here */}
              <AgGridReact<StaffMember>
                rowData={staff}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={10}
                defaultColDef={{
                  sortable: true,
                  resizable: true
                }}
              />
            </div>
          )}
        </main>

        <footer className="mt-6 text-center text-slate-500 text-xs font-mono">
          <p>Staff directory for {companyName || 'company'}</p>
        </footer>
      </div>
    </div>
  );
}