import { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { Link } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function CompanyDirectory() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/companies');
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const columnDefs: ColDef[] = [
    { field: 'company_id', headerName: 'Company UUID / ID', flex: 1.5, filter: true },
    { field: 'company_name', headerName: 'Company Name', flex: 1, filter: true },
    // Add columns here based on extra fields in your DB (e.g., status, registration date)
    { 
      field: 'is_active', 
      headerName: 'Status', 
      flex: 0.8,
      cellRenderer: (params: any) => params.value ? '🟢 Active' : '🔴 Paused'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Technician Terminal</h1>
            <p className="text-slate-500 text-sm">Global Company Infrastructure Registry</p>
          </div>
          <Link to="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors">
            ← Back to Staff Portal
          </Link>
        </header>

        <main className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Registered Companies Directory</h2>
          
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading company registry...</div>
          ) : (
            <div className="ag-theme-alpine w-full" style={{ height: 500 }}>
              <AgGridReact 
                rowData={companies} 
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={10}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}