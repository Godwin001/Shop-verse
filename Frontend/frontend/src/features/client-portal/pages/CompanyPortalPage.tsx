import { useState } from 'react';
import axios from 'axios';
import DashboardOverviewPage from './DashboardOverviewPage'; 

interface CompanySession {
  company_id: string;
  company_name: string;
  is_active: boolean;
}

export default function CompanyPortalPage() {
  // --- AUTH STATES ---
  const [companyName, setCompanyName] = useState('');
  const [companyUuid, setCompanyUuid] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // --- SESSION STATE ---
  const [currentCompany, setCurrentCompany] = useState<CompanySession | null>(null);

  const API_BASE_URL = 'https://insightful-sparkle-production-f90d.up.railway.app';

  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyUuid.trim()) return;

    setAuthLoading(true);
    setErrorMsg('');

    try {
      const requestBody = {
        company_name: companyName.trim(),
        company_id: companyUuid.trim()
      };

      const response = await axios.post(`${API_BASE_URL}/companies/login`, requestBody);

      if (response.data && Object.keys(response.data).length > 0) {
        const data = response.data;
        
        const sanitizedSession: CompanySession = {
          company_id: data.company_id || data.id,
          company_name: data.company_name || data.name,
          is_active: data.is_active !== undefined ? data.is_active : true
        };

        localStorage.setItem('company_id', sanitizedSession.company_id);
        localStorage.setItem('company_name', sanitizedSession.company_name);

        setCurrentCompany(sanitizedSession);
      } else {
        setErrorMsg("Authentication failed: Server database returned an empty record.");
      }
    } catch (error: any) {
      console.error("Portal Login Error:", error);
      setErrorMsg(error.response?.data?.detail || "Invalid credentials. Please verify workspace identity.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('company_id');
    localStorage.removeItem('company_name');
    setCurrentCompany(null);
    setCompanyName('');
    setCompanyUuid('');
  };

  // GATEWAY LOGIN SCREEN
  if (!currentCompany) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800/60 p-8 rounded-2xl border border-slate-700/60 backdrop-blur-sm shadow-xl">
          <header className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 font-mono text-xs rounded-full border border-blue-500/20 mb-3">
              SECURE CLIENT NODE
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-slate-100">COMPANY PORTAL</h1>
            <p className="text-slate-400 text-xs mt-1">Initialize workspace infrastructure session</p>
          </header>

          {errorMsg && (
            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleCompanyLogin} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                placeholder="e.g., Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={authLoading}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-mono mb-1.5 uppercase tracking-wider">Secure Company UUID</label>
              <input
                type="text" 
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={companyUuid}
                onChange={(e) => setCompanyUuid(e.target.value)}
                disabled={authLoading}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-sm tracking-wide"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 font-mono text-xs font-bold rounded-xl text-white tracking-widest cursor-pointer"
            >
              {authLoading ? 'VERIFYING CREDENTIALS...' : 'ACCESS WORKSPACE'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Hands off full control to the dashboard workspace layer
  return <DashboardOverviewPage onLogout={handleLogout} />;
}