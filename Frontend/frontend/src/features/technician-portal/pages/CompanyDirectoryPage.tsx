import { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Link } from 'react-router-dom'; // Import Link
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

// 1. Create a custom component for the clickable cell
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

  const columnDefs = [
    { 
      field: 'company_id', 
      headerName: 'Company UUID / ID', 
      flex: 1.5, 
      filter: true,
      cellRenderer: ClickableIdRenderer // 2. Attach the renderer here
    },
    { field: 'company_name', headerName: 'Company Name', flex: 1, filter: true }
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
          
          {loading ? (
            <div className="text-center py-10 text-slate-400 animate-pulse font-mono">Querying database registries...</div>
          ) : (
            <div className="ag-theme-alpine-dark w-full" style={{ height: 500 }}>
              <AgGridReact 
                rowData={companies} 
                columnDefs={columnDefs}
                pagination={true}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}