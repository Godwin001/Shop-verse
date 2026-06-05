import { mockInventoryStorage } from '../inventory/mockInventoryStorage';

export interface SalesInvoiceLine {
  sn: number;
  sku: string;
  productName: string;
  qtySold: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface HistoricalSalesInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  staffId: string;
  date: string;
  paymentMethod: string;
  items: SalesInvoiceLine[];
  totalCostValuation: number;
  totalSalesValuation: number;
}

export const mockSalesStorage = {
  getSalesHistory(): HistoricalSalesInvoice[] {
    try {
      const saved = localStorage.getItem('shopverse_sales_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  },

  commitSaleTransaction(invoice: Omit<HistoricalSalesInvoice, 'id'>): { success: boolean; error?: string } {
    const currentInventory = mockInventoryStorage.getItems();
    
    // 1. Pre-transaction safety check: ensure all stock deductions are valid
    for (const line of invoice.items) {
      const invItem = currentInventory.find(i => i.itemCode.toUpperCase().trim() === line.sku.toUpperCase().trim());
      if (!invItem) {
        return { success: false, error: `SKU code "${line.sku}" no longer exists in database records.` };
      }
      if (invItem.quantity < line.qtySold) {
        return { success: false, error: `Insufficent stock volume level for ${invItem.itemName}. Available: ${invItem.quantity}, Requested: ${line.qtySold}` };
      }
    }

    // 2. Perform Stock Level Deductions across inventory items
    invoice.items.forEach(line => {
      const idx = currentInventory.findIndex(i => i.itemCode.toUpperCase().trim() === line.sku.toUpperCase().trim());
      if (idx !== -1) {
        currentInventory[idx].quantity -= line.qtySold;
      }
    });

    // Save mutated inventory array state
    localStorage.setItem('shopverse_inventory', JSON.stringify(currentInventory));

    // 3. Write historical sale log trace
    const salesLog = this.getSalesHistory();
    const uniqueSaleInvoice: HistoricalSalesInvoice = {
      ...invoice,
      id: `SAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    };
    salesLog.unshift(uniqueSaleInvoice);
    localStorage.setItem('shopverse_sales_history', JSON.stringify(salesLog));

    return { success: true };
  }
};