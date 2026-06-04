"use no memo";
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// 1. Register the modules (This tells AG Grid to load the features)
ModuleRegistry.registerModules([AllCommunityModule]);

interface StaffTableProps {
  staffData: any[];
}

//this place is connected to staff managementpage to display the just added staff CODE:SMP29/ST14
const StaffTable = ({ staffData }: StaffTableProps) => {
  const columnDefs = [
  { field: 'staff_id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'role', headerName: 'Role', flex: 1 },
  { field: 'lastActive', headerName: 'Last Active', flex: 1 }
];

  return (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* 2. The height MUST be defined here */}
      <div className="ag-theme-alpine w-full" style={{ height: 400 }}>
        <AgGridReact 
          rowData={staffData} 
          columnDefs={columnDefs}
          pagination={true}
        />
      </div>
    </div>
  );
};

export default StaffTable;