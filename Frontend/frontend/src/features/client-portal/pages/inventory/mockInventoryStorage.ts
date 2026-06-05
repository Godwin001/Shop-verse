export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  supplier: string;
  invoiceNumber: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  salePercentage: number;
  expiryDate: string;
  category: string;
  dateAdded?: string;
}

export interface InvoiceHistoryLog {
  id: string;
  invoiceNo: string;
  supplier: string;
  totalCost: number;
  staffId: string;
  date: string;
  items: InventoryItem[];
}

export interface OperationalComment {
  id: string;
  itemCode: string;
  itemName: string;
  comment: string;
  timestamp: string;
}

// Global persistence safely bound to localStorage
export const mockInventoryStorage = {
  getItems(): InventoryItem[] {
    try {
      const saved = localStorage.getItem('shopverse_inventory');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  },

  saveItem(item: Omit<InventoryItem, 'id'> & { id?: string }) {
    const items = this.getItems();
    const newItem: InventoryItem = {
      ...item,
      id: item.id || Math.random().toString(36).substring(2, 11),
      dateAdded: item.dateAdded || new Date().toISOString().split('T')[0]
    };
    items.push(newItem);
    localStorage.setItem('shopverse_inventory', JSON.stringify(items));
    return newItem;
  },

  updateItem(id: string, updatedFields: Partial<InventoryItem>) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updatedFields };
      localStorage.setItem('shopverse_inventory', JSON.stringify(items));
    }
  },

  deleteItem(id: string) {
    const items = this.getItems();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem('shopverse_inventory', JSON.stringify(filtered));
  },

  // 🧾 Supplier Ingest Invoice Stock Processing Audit Layers
  getInvoices(): InvoiceHistoryLog[] {
    try {
      const saved = localStorage.getItem('shopverse_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  },

  pushInvoice(invoice: Omit<InvoiceHistoryLog, 'id'>) {
    const invoices = this.getInvoices();
    const newInvoice: InvoiceHistoryLog = {
      ...invoice,
      id: `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    };
    invoices.unshift(newInvoice); // Newest items on top
    localStorage.setItem('shopverse_invoices', JSON.stringify(invoices));
    
    // Process stock addition automatically for matching SKU matrix elements
    const currentInventory = this.getItems();
    invoice.items.forEach(incomingItem => {
      const existingIdx = currentInventory.findIndex(
        inv => inv.itemCode.toUpperCase().trim() === incomingItem.itemCode.toUpperCase().trim()
      );

      if (existingIdx !== -1) {
        // Product exists: update quantities and prices
        currentInventory[existingIdx].quantity += incomingItem.quantity;
        currentInventory[existingIdx].costPrice = incomingItem.costPrice;
        currentInventory[existingIdx].salePrice = incomingItem.salePrice;
        currentInventory[existingIdx].expiryDate = incomingItem.expiryDate;
        currentInventory[existingIdx].supplier = incomingItem.supplier;
        currentInventory[existingIdx].invoiceNumber = incomingItem.invoiceNumber;
        if (incomingItem.costPrice > 0) {
          currentInventory[existingIdx].salePercentage = parseFloat(
            (((incomingItem.salePrice - incomingItem.costPrice) / incomingItem.costPrice) * 100).toFixed(1)
          );
        }
      } else {
        // Product is new: append as independent item vector entry
        currentInventory.push({
          ...incomingItem,
          id: Math.random().toString(36).substring(2, 11),
          dateAdded: new Date().toISOString().split('T')[0]
        });
      }
    });
    localStorage.setItem('shopverse_inventory', JSON.stringify(currentInventory));
  },

  getComments(): OperationalComment[] {
    try {
      const saved = localStorage.getItem('shopverse_comments');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  },

  saveComment(comment: Omit<OperationalComment, 'id' | 'timestamp'>) {
    const comments = this.getComments();
    const newComment: OperationalComment = {
      ...comment,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toLocaleString()
    };
    comments.unshift(newComment);
    localStorage.setItem('shopverse_comments', JSON.stringify(comments));
  }
};