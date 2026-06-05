import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MakeSaleSubsystem from './MakeSaleSubsystem';
import TodaySalesSubsystem from './TodaySalesSubsystem';

export default function SalesHubPage() {
  const navigate = useNavigate();
  const [activeSubView, setActiveSubView] = useState<'menu' | 'make-sale' | 'today-sales'>('menu');
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);

  const [companyName] = useState(() => localStorage.getItem('company_name') || 'SHOP-VERSE WORKSPACE');
  const [staffId] = useState(() => localStorage.getItem('staff_id') || 'Offline');


  if (activeSubView === 'make-sale') {
    return <MakeSaleSubsystem onBack={() => setActiveSubView('menu')} />;
  }

  if (activeSubView === 'today-sales') {
    return <TodaySalesSubsystem onBack={() => setActiveSubView('menu')} />;
  }

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1e293b] flex flex-col justify-between font-sans relative w-full">
      {/* HEADER PANEL */}
      <header className="bg-[#7884b0] text-white py-8 px-6 text-center relative shadow-md">
        <h1 className="text-3xl md:text-4xl font-normal tracking-wide uppercase drop-shadow-sm">
          Sales
        </h1>
        <p className="text-lg md:text-xl font-medium tracking-widest mt-1 opacity-90 font-mono">
          SHOP-VERSE MANAGEMENT SYSTEM
        </p>
        <div>
           <span>🏢 WORKSPACE: <span className="font-bold text-yellow-300">{companyName}</span></span>
        </div>
      </header>

      {/* MAIN NAV CONTENT */}
      <main className="flex-grow p-6 flex flex-col items-center justify-center relative max-w-4xl mx-auto w-full">
        {/* BACK ARROW */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-4 left-6 text-slate-700 hover:text-slate-900 transition-transform hover:scale-105 flex items-center gap-1 font-mono font-bold text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm cursor-pointer z-50"
        >
          ↩ BACK TO DASHBOARD
        </button>


        {/* BUTTON ACTION GRID */}
        <div className="flex flex-col gap-6 w-full max-w-md items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <button
              onClick={() => setActiveSubView('make-sale')}
              className="bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-xl font-bold py-6 px-4 rounded-3xl shadow-md transition-all uppercase tracking-wider cursor-pointer transform hover:scale-105"
            >
              Make a Sale
            </button>

            <button
              onClick={() => setActiveSubView('today-sales')}
              className="bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-xl font-bold py-6 px-4 rounded-3xl shadow-md transition-all uppercase tracking-wider cursor-pointer transform hover:scale-105"
            >
              Check Today's Sales
            </button>
          </div>

          <button
            onClick={() => setShowCommentModal(true)}
            className="bg-[#7884b0] hover:bg-[#65719d] text-white font-sans text-xl font-bold py-6 px-8 rounded-3xl shadow-md transition-all uppercase tracking-wider cursor-pointer transform hover:scale-105 w-full max-w-[280px] mt-4"
          >
            Make Comment
          </button>
        </div>
      </main>

      {/* COMMENT DIALOG MODAL */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-300 max-w-md w-full shadow-2xl">
            <h3 className="font-mono font-bold text-lg text-slate-800 mb-2 uppercase tracking-wide">📝 Record Sales Commentary</h3>
            <textarea
              className="w-full h-32 p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-slate-700"
              placeholder="Type audit or operational log comments here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Comment logged successfully.');
                  setCommentText('');
                  setShowCommentModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-mono text-xs font-bold rounded-lg uppercase cursor-pointer"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}

    

      {/* FOOTER STRIP */}
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