import { useState } from 'react';
import axios from 'axios';
import StaffTable from '../../../components/StaffTable';

export default function StaffManagementPage() {
  const [currentCompanyId, setCurrentCompanyId] = useState('1fb83444-cc40-420b-9887-9434bc9b3cfc'); 
  const [staffList, setStaffList] = useState([]);
  
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cashier'); 

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffPayload = {
      full_name: name,         
      email: email,            
      password: password,      
      user_role: role,         
      company_id: currentCompanyId 
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/staff', staffPayload);
      if (response.status === 200 || response.status === 201) {
        setStaffList([...staffList, { staff_id: staffId, name: name, role: role, lastActive: 'Just now' }]);
        setName(''); setEmail(''); setStaffId(''); setPassword('');
        alert("Staff created successfully!");
      }
    } catch (error: any) {
      alert("Error: " + (error.response?.data?.detail || "Check console for details"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Staff Management Portal</h1>
          <p className="text-slate-500 text-sm">Company ID: <span className="font-mono font-bold text-blue-600">{currentCompanyId}</span></p>
        </header>

        <form onSubmit={handleAddStaff} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10 grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Staff ID / Username</label>
            <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. JD001" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="John Doe" required />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="staff@company.com" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="••••••••" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded bg-white">
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="technician">Technician</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>
          <button className="col-span-2 bg-blue-600 text-white font-bold py-2 rounded-lg mt-2 hover:bg-blue-700 transition-colors">
            Create Staff Account
          </button>
        </form>

        <StaffTable staffData={staffList} />
      </div>
    </div>
  );
}