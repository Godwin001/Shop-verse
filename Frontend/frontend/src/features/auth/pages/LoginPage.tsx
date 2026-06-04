import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Updated prop interface to accept the company ID dynamically from the dashboard
interface LoginPageProps {
  onLoginSuccess?: (staffId: string) => void;
  dashboardCompanyId?: string; 
}

export default function LoginPage({ onLoginSuccess, dashboardCompanyId }: LoginPageProps) {
  // Initialize states with empty defaults to avoid stale state mismatches
  const [currentCompanyId, setCurrentCompanyId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ⚡ FORCE REACTIVE SYNC: Listens to workspace mutations instantly 
  useEffect(() => {
    const activeTargetId = dashboardCompanyId || localStorage.getItem('company_id');
    if (activeTargetId) {
      setCurrentCompanyId(activeTargetId);
      setErrorMessage(''); // Instantly clear error blocks if context becomes valid
    } else {
      setCurrentCompanyId('');
    }
  }, [dashboardCompanyId]); // Triggers immediately when you log out/login with another workspace node

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Stop execution early if there isn't a company context bound to the session
    if (!currentCompanyId) {
      setErrorMessage("System Error: No active company workspace context discovered.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/login', {
        staff_id: staffId,
        password: password,
        company_id: currentCompanyId // Dynamic company payload context matching the dashboard!
      });

      if (response.data.status === 'success') {
        const { user_role, company_id, full_name } = response.data.user;

        // Save states to localstorage so they persist if the user refreshes
        localStorage.setItem('token_role', user_role);
        localStorage.setItem('company_id', company_id);
        localStorage.setItem('staff_id', staffId); 

        alert(`Welcome back, ${full_name}!`);

        // Fire the success hook back up to the Dashboard layout engine
        if (onLoginSuccess) {
          onLoginSuccess(staffId);
        }
      }
    } catch (error: any) {
      console.error("Login Error Details:", error);
      const serverMessage = error.response?.data?.detail || "Authentication validation mismatch or connection failure.";
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-slate-800 rounded-xl">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight font-mono uppercase">
          Staff Portal Access Gate
        </h2>
        
        {/* Dynamic target verification label element */}
        <p className="mt-2 inline-block text-[10px] font-mono text-blue-400 border border-blue-500/20 bg-blue-500/5 px-3 py-0.5 rounded tracking-wider uppercase">
          Scope Target ID: {currentCompanyId ? `${currentCompanyId.substring(0, 8)}...` : 'Undefined Node'}
        </p>
      </div>

      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/30">
        <form className="space-y-4" onSubmit={handleLogin}>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs font-mono">
              ⚠️ {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-1">
              Staff ID / Username
            </label>
            <input
              type="text"
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. JD001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider mb-1">
              Secret Access Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 rounded-lg text-xs font-mono font-bold tracking-widest text-white bg-blue-600 hover:bg-blue-500 border border-blue-400/20 shadow-md transition-colors uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify Identity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}