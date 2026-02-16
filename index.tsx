
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Printer, 
  ChevronRight, 
  Download,
  X,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Menu as MenuIcon,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Leaf,
  BarChart3,
  ChevronLeft,
  UserPlus,
  FileDown,
  Loader2,
  CalendarDays
} from 'lucide-react';

// --- Types & Interfaces ---

type Category = 'Vegetable' | 'Fruit' | 'Grocery' | 'Other';
type UnitType = 'Kg' | 'Lb' | 'Box' | 'Bunch' | 'Piece';

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  category: Category;
  unitType: UnitType;
  price: number;
}

interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// --- Constants ---

const BUSINESS_NAME = "EVER GREEN PRODUCE L.L.C";
const BUSINESS_PHONE = "646-667-9749";
const ORDER_PHONE = "646-667-9749"; // Updated as requested

const PRODUCT_NAMES = [
  "Baby Mustard", "Cabbage", "Cauliflower(12 head)", "Chilli (Finger Hot)", "Chilli (Small Thai)",
  "Chinese Okra (Tori)", "Coriander 60 Bunches", "Dosaki", "Dry Coconut (bag)", "Edo (Arvi)",
  "Egg Plant-Big", "Eggplant-Chinese", "Eggplant-Round", "Garlic-5 pack", "Ginger", "Green Mango",
  "Guava Big", "Karela Indian", "Lime", "Long Bean", "Long Squash (Indian)", "Long Squash (regular)",
  "Lychee", "Methi", "Mint", "Muli (Daikon)", "Okra-Indian", "Okra-Regular", "Onion-Red 10 lb",
  "Onion-Red 2 lb", "Onion-Red Pearl", "Onion Yellow 10 lb", "Onion-Yellow 2 lb", "Potato Idaho Red-5lb",
  "Potato Idaho White-5lb", "Potatao White Loose B# 1", "Potato Red Loose B #1", "Spinach Bunch",
  "Tindora", "Tomato (Plum)", "Tomato (Reg)", "Valor-flat", "Valor-long",
  "Banana (Regular)", "Bell Pepper Green", "Carrot 2 Lb", "Carrot Loose 50lbs", "Cucumber - Persian",
  "Cucumber- Regular", "Curry Leave", "Dill", "Drum Stick", "Garlic-Peeled (1lb box )",
  "Garlic-Peeled (5lb Box )", "Guar Bean", "Lemon", "Lettuce", "Mango Leaf", "Onion-Red 25 lb",
  "Onion (Green Fresh)", "Paan Leaf", "Papaya-Ripe", "Parval", "Ripe Mango", "Red Beets",
  "String Bean Green", "Sugarcane", "Sweet Potato-Red", "Turnips", "Zucchini Green"
].sort((a, b) => a.localeCompare(b));

const INITIAL_PRODUCTS: Product[] = PRODUCT_NAMES.map((name, idx) => ({
  id: `p-${idx}`,
  name: name,
  category: name.toLowerCase().includes('fruit') || name.toLowerCase().includes('mango') || name.toLowerCase().includes('banana') ? 'Fruit' : 'Vegetable',
  unitType: name.toLowerCase().includes('box') ? 'Box' : name.toLowerCase().includes('lb') ? 'Lb' : 'Piece',
  price: 0
}));

// --- Utility Functions ---

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateInvoiceNumber = () => `${Math.floor(100000 + Math.random() * 900000)}`;

// --- Local Storage Hooks ---
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// --- Components ---

const Sidebar = ({ 
  currentView, 
  setView, 
  isOpen, 
  setIsOpen 
}: { 
  currentView: string, 
  setView: (v: string) => void,
  isOpen: boolean,
  setIsOpen: (o: boolean) => void
}) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'invoices', icon: FileText, label: 'Invoices' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  const handleSelect = (id: string) => {
    setView(id);
    if (window.innerWidth < 1024) setIsOpen(false); 
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isOpen ? 'translate-x-0' : '-translate-x-full'} no-print h-full`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <Leaf className="w-6 h-6" />
              <span>Ever Green Hub</span>
            </h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-6 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center uppercase tracking-widest">
            &copy; 2025 EVER GREEN
          </div>
        </div>
      </aside>
    </>
  );
};

const MobileTopBar = ({ setIsOpen }: { setIsOpen: (o: boolean) => void }) => (
  <header className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between no-print">
    <button onClick={() => setIsOpen(true)} className="p-1 text-slate-600">
      <MenuIcon size={24} />
    </button>
    <div className="flex items-center gap-2 font-black text-slate-800">
      <Leaf className="text-green-600" size={20} />
      <span className="text-xs uppercase tracking-widest">Ever Green</span>
    </div>
    <div className="w-8" />
  </header>
);

const ViewHeader = ({ 
  title, 
  onBack, 
  action 
}: { 
  title: string, 
  onBack?: () => void, 
  action?: React.ReactNode 
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      {onBack && (
        <button 
          onClick={onBack} 
          className="p-1.5 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors no-print border border-slate-200 shadow-sm"
        >
          <ChevronLeft size={18} className="text-slate-700" />
        </button>
      )}
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
    </div>
    {action && <div className="no-print">{action}</div>}
  </div>
);

// --- Adaptive Professional Produce Invoice Print ---
const InvoicePrint = React.forwardRef<HTMLDivElement, { invoice: Invoice }>(({ invoice }, ref) => {
  // Only show items with quantity > 0
  const activeItems = invoice.items.filter(item => item.quantity > 0);
  const itemCount = activeItems.length;
  
  const tableFontSize = itemCount > 45 ? 'text-[7pt]' : itemCount > 25 ? 'text-[8pt]' : 'text-[9.5pt]';
  const rowHeight = itemCount > 45 ? 'h-[17px]' : itemCount > 25 ? 'h-[21px]' : 'h-[28px]';
  const paddingY = itemCount > 45 ? 'py-0' : 'py-0.5';

  return (
    <div ref={ref} id="invoice-content" className="bg-white min-h-[296mm] w-full max-w-[210mm] mx-auto p-8 text-slate-900 font-sans flex flex-col leading-tight overflow-hidden">
      
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded text-white flex items-center justify-center h-10 w-10">
             <Leaf size={24} />
          </div>
          <div>
            <h1 className="text-[13pt] font-bold text-slate-900 leading-none uppercase tracking-tight">{BUSINESS_NAME}</h1>
            <p className="text-[9pt] font-semibold text-slate-600 mt-1">Phone: {BUSINESS_PHONE}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[6.5pt] font-black text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
            <p className="text-[9pt] font-bold text-slate-900">{new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 text-center min-w-[110px]">
            <p className="text-[6pt] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Invoice #</p>
            <p className="text-[10pt] font-mono font-black leading-none uppercase">{invoice.number}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-12">
        <div className="flex-1">
          <h2 className="text-[8pt] font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-200 inline-block pb-0.5">BILL TO</h2>
          <div className="pl-0 mt-1">
            <p className="text-[11pt] font-bold text-slate-900 uppercase leading-none mb-1">{invoice.customerName}</p>
            <p className="text-[8.5pt] text-slate-600 font-medium leading-tight max-w-[420px]">{invoice.customerAddress}</p>
          </div>
        </div>
        <div className="text-right pt-6">
           <p className="text-[7.5pt] font-bold text-slate-500 uppercase tracking-wide">Terms: Due on Delivery</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[7pt] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-900">
              <th className="text-left py-2 w-10">#</th>
              <th className="text-left py-2">Item Description</th>
              <th className="text-center py-2 w-16">Qty</th>
              <th className="text-right py-2 w-28">Price</th>
              <th className="text-right py-2 w-32">Total</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${tableFontSize}`}>
            {activeItems.map((item, idx) => (
              <tr key={idx} className={`${rowHeight} group hover:bg-slate-50 transition-colors`}>
                <td className={`${paddingY} text-slate-300 font-mono text-[6.5pt]`}>{idx + 1}</td>
                <td className={`${paddingY} font-bold text-slate-800 uppercase tracking-tight`}>{item.name}</td>
                <td className={`${paddingY} text-center font-mono font-black text-slate-500`}>{item.quantity}</td>
                <td className={`${paddingY} text-right font-mono text-slate-400`}>{formatCurrency(item.price)}</td>
                <td className={`${paddingY} text-right font-mono font-black text-slate-900`}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t-4 border-slate-900 flex justify-between items-end">
        <div className="text-[7pt] text-slate-400 font-bold uppercase tracking-tight leading-tight max-w-[350px]">
           <p className="text-slate-800 font-black mb-1 italic">Conditions of Sale:</p>
           <p>Deliveries must be verified on-site. No adjustments after departure. EVER GREEN PRODUCE L.L.C is not liable for indirect damages post-acceptance.</p>
        </div>
        
        <div className="flex flex-col items-end">
           <p className="text-[8pt] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Grand Total Amount</p>
           <div className="bg-slate-900 text-white px-8 py-3 rounded-xl shadow-lg">
             <span className="text-[26pt] font-black font-mono tracking-tighter leading-none">{formatCurrency(invoice.total)}</span>
           </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center opacity-40">
        <p className="text-[6.5pt] font-black text-slate-400 uppercase tracking-[0.6em] select-none">PRODUCE DISTRIBUTION HUB</p>
        <p className="text-[6pt] font-bold text-slate-500 italic">For Re-orders: {ORDER_PHONE}</p>
      </div>
    </div>
  );
});

// --- Dashboard Component ---
const Dashboard = ({ customers, invoices, setView }: { customers: Customer[], invoices: Invoice[], setView: (v: string) => void }) => {
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Ever Green Hub</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Business Intelligence</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Sales</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Clients</p>
          <p className="text-2xl font-black text-green-600 mt-1 font-mono">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoices Issued</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{invoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button onClick={() => setView('new-invoice')} className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-[2rem] border border-green-200 text-green-700 hover:bg-green-100 transition-all active:scale-95 group shadow-sm">
          <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">New Order</span>
        </button>
        <button onClick={() => setView('reports')} className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-[2rem] border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all active:scale-95 group shadow-sm">
          <BarChart3 className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Reports</span>
        </button>
        <button onClick={() => setView('customers')} className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-[2rem] border border-purple-200 text-purple-700 hover:bg-purple-100 transition-all active:scale-95 group shadow-sm">
          <Users className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Clients</span>
        </button>
        <button onClick={() => setView('products')} className="flex flex-col items-center justify-center p-6 bg-orange-50 rounded-[2rem] border border-orange-200 text-orange-700 hover:bg-orange-100 transition-all active:scale-95 group shadow-sm">
          <Package className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Inventory</span>
        </button>
      </div>
    </div>
  );
};

// --- Invoice List Component ---
const InvoiceList = ({ invoices, setInvoices, onPrint, onEdit, onBack }: { invoices: Invoice[], setInvoices: (i: Invoice[]) => void, onPrint: (i: Invoice) => void, onEdit: (i: Invoice) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = invoices.filter(inv => inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || inv.number.includes(searchTerm));

  return (
    <div className="space-y-4">
      <ViewHeader title="Invoice History" onBack={onBack} />
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input placeholder="Search records..." className="flex-1 outline-none text-sm font-bold text-slate-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs">ID</th>
              <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs">Customer</th>
              <th className="px-6 py-4 font-black text-slate-400 uppercase text-xs text-right">Balance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice().reverse().map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-mono font-black text-xs text-slate-900">{inv.number}</td>
                <td className="px-6 py-4 font-black text-slate-800 uppercase text-xs">{inv.customerName}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-green-600">{formatCurrency(inv.total)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onPrint(inv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Generate PDF"><FileDown size={18}/></button>
                  <button onClick={() => onEdit(inv)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl" title="Edit"><Edit size={18}/></button>
                  <button onClick={() => { if(window.confirm('Delete invoice?')) setInvoices(invoices.filter(item => item.id !== inv.id)); }} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Delete"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Invoice Form Component ---
const InvoiceForm = ({ 
  customers, 
  products, 
  initialInvoice, 
  onSubmit, 
  onCancel, 
  onAddCustomer 
}: { 
  customers: Customer[], 
  products: Product[], 
  initialInvoice?: Invoice | null, 
  onSubmit: (inv: Invoice) => void, 
  onCancel: () => void, 
  onAddCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => void 
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialInvoice?.customerId || '');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(initialInvoice?.date || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>(initialInvoice?.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', address: '', phone: '' });

  // Improved filtering: only show customers that match search
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
      c.phone.includes(clientSearchTerm)
    );
  }, [clientSearchTerm, customers]);

  // If filtered list changes and current selection is not in it, maybe clear? 
  // No, keep selected ID unless user changes it.

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, products]);

  const addItem = (p: Product) => {
    const existing = items.find(i => i.productId === p.id);
    if (existing) {
      setItems(items.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i));
    } else {
      setItems([...items, { productId: p.id, name: p.name, quantity: 1, price: p.price, total: p.price }]);
    }
  };

  const updateItem = (id: string, qty: number, price: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, quantity: qty, price: price, total: qty * price } : i));
  };

  const handleQuickAddClient = () => {
    if (!newClientData.name || !newClientData.phone) return alert("Missing required fields");
    onAddCustomer(newClientData);
    setNewClientData({ name: '', address: '', phone: '' });
    setIsAddClientModalOpen(false);
  };

  const handleComplete = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return alert('Select a customer.');
    
    // Filter out items with 0 quantity before submitting
    const finalItems = items.filter(i => i.quantity > 0);
    if (finalItems.length === 0) return alert('Add items with quantities greater than zero.');

    onSubmit({
      id: initialInvoice?.id || generateId(),
      number: initialInvoice?.number || (initialInvoice ? initialInvoice.number : generateInvoiceNumber()),
      customerId: customer.id,
      customerName: customer.name,
      customerAddress: customer.address,
      date: invoiceDate,
      items: finalItems,
      subtotal: finalItems.reduce((acc, i) => acc + i.total, 0),
      tax: 0,
      total: finalItems.reduce((acc, i) => acc + i.total, 0)
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-300">
      <ViewHeader title={initialInvoice ? `Edit Order` : "New Order"} onBack={onCancel} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           {/* Client Selection with Search */}
           <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                   <div className="relative flex-[0.4]">
                      <Search className="absolute left-3 top-3.5 text-slate-300" size={14} />
                      <input 
                        placeholder="Search Client..." 
                        value={clientSearchTerm} 
                        onChange={e => setClientSearchTerm(e.target.value)} 
                        className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:border-green-500 outline-none transition-all" 
                      />
                   </div>
                   <select 
                      value={selectedCustomerId} 
                      onChange={e => setSelectedCustomerId(e.target.value)} 
                      className="flex-[0.6] border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 outline-none font-bold text-slate-800 focus:border-green-500 transition-all"
                   >
                      <option value="">-- Select Matching Client --</option>
                      {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      {filteredCustomers.length === 0 && <option disabled>No clients found</option>}
                   </select>
                </div>
                <button onClick={() => setIsAddClientModalOpen(true)} className="p-3.5 bg-green-600 text-white rounded-xl shadow-lg active:scale-95 transition-all" title="Add New Client"><UserPlus size={18}/></button>
              </div>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-slate-50 font-black focus:border-green-500" />
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-black text-slate-400 uppercase">Product Name</th>
                        <th className="px-2 py-3 text-center font-black text-slate-400 w-16">Qty</th>
                        <th className="px-2 py-3 text-right font-black text-slate-400 w-24">Price</th>
                        <th className="px-2 py-3 w-10"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {items.map(i => (
                         <tr key={i.productId} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-black text-slate-800 uppercase text-[10px] leading-tight">{i.name}</td>
                            <td className="px-2 py-2">
                              {/* If value is 0, show empty string so it "vanishes" and is easy to type over */}
                              <input 
                                type="number" 
                                value={i.quantity === 0 ? '' : i.quantity} 
                                onChange={e => updateItem(i.productId, parseFloat(e.target.value) || 0, i.price)} 
                                className="w-full text-center border border-slate-200 rounded-lg font-black py-1 px-0.5 bg-white outline-none focus:border-green-400 text-xs" 
                                placeholder="0"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <input 
                                type="number" 
                                step="0.01" 
                                value={i.price === 0 ? '' : i.price} 
                                onChange={e => updateItem(i.productId, i.quantity, parseFloat(e.target.value) || 0)} 
                                className="w-full text-right border border-slate-200 rounded-lg px-1 py-1 font-mono font-black text-slate-700 bg-white outline-none focus:border-green-400 text-xs" 
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <button onClick={() => setItems(items.filter(item => item.productId !== i.productId))} className="text-red-400 p-1.5"><Trash2 size={14}/></button>
                            </td>
                         </tr>
                      ))}
                      {items.length === 0 && (
                        <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-300 font-bold uppercase italic text-[10px]">Populate the order list below</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-900 text-right flex justify-between items-center">
                 <div className="text-left">
                   <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Selected Items</p>
                   <p className="text-lg font-black text-white">{items.length}</p>
                 </div>
                 <div>
                   <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Balance Total</p>
                   <p className="text-2xl font-black text-green-500 font-mono tracking-tighter leading-none">{formatCurrency(items.reduce((acc, i) => acc + i.total, 0))}</p>
                 </div>
              </div>
           </div>

           <button onClick={handleComplete} className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-lg uppercase tracking-tight">
             {initialInvoice ? "Update Order Record" : "Generate Invoice PDF"}
           </button>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm h-[600px] flex flex-col">
           <div className="relative mb-4">
              <Search className="absolute left-3 top-3.5 text-slate-300" size={16} />
              <input placeholder="Filter products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 outline-none focus:border-green-500 transition-all" />
           </div>
           <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
              {filteredProducts.map(p => (
                 <button key={p.id} onClick={() => addItem(p)} className="w-full text-left px-3 py-2 rounded-xl border border-slate-50 bg-white hover:bg-green-50 hover:border-green-100 transition-all flex justify-between items-center group active:scale-95 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-700 uppercase leading-none">{p.name}</span>
                      <span className="text-[7pt] font-bold text-slate-400 uppercase mt-1">{p.price > 0 ? `${formatCurrency(p.price)} / ${p.unitType}` : 'Set Price'}</span>
                    </div>
                    <div className="bg-slate-50 group-hover:bg-green-100 p-1.5 rounded-lg transition-colors">
                      <Plus size={14} className="text-slate-300 group-hover:text-green-600" />
                    </div>
                 </button>
              ))}
           </div>
        </div>
      </div>

      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
              <h3 className="font-black text-slate-900 uppercase text-xl mb-6 tracking-tighter">New Client Entry</h3>
              <div className="space-y-3">
                 <input autoFocus placeholder="Business Name" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold bg-slate-50 focus:border-green-500" />
                 <input placeholder="Store Address" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold bg-slate-50 focus:border-green-500" />
                 <input placeholder="Phone Number" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold bg-slate-50 focus:border-green-500" />
                 <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsAddClientModalOpen(false)} className="flex-1 py-3 bg-slate-100 font-black rounded-xl text-[10px] uppercase text-slate-500">Cancel</button>
                    <button onClick={handleQuickAddClient} className="flex-1 py-3 bg-green-600 text-white font-black rounded-xl text-[10px] uppercase shadow-lg">Save Client</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Reports & Exports ---
const ReportsView = ({ invoices, onBack }: { invoices: Invoice[], onBack: () => void }) => {
  const downloadWeeklyReport = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    const weeklyInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate >= lastWeek && invDate <= today;
    });

    if (weeklyInvoices.length === 0) {
      alert("No invoices found for the last 7 days.");
      return;
    }

    const headers = ["Invoice #", "Date", "Customer", "Total Amount"];
    const rows = weeklyInvoices.map(inv => [
      inv.number,
      inv.date,
      `"${inv.customerName}"`,
      inv.total.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Weekly_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSales = invoices.reduce((acc, i) => acc + i.total, 0);

  return (
    <div className="p-4 space-y-6">
      <ViewHeader title="Business Intelligence" onBack={onBack} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center text-white border-b-8 border-green-600 shadow-xl flex flex-col justify-center">
           <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Cumulative Revenue Volume</p>
           <p className="text-5xl font-black font-mono tracking-tighter text-green-400">{formatCurrency(totalSales)}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase">Weekly Data Export</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 mb-6">Summarize activity from the last 7 days</p>
          <button 
            onClick={downloadWeeklyReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <Download size={16} />
            Download CSV Report
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-black text-slate-900 uppercase text-xs mb-4 tracking-widest">Recent Activity Log</h4>
        <div className="space-y-3">
          {invoices.slice(-5).reverse().map(inv => (
            <div key={inv.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
               <div>
                 <p className="text-xs font-black text-slate-800 uppercase">{inv.customerName}</p>
                 <p className="text-[10px] text-slate-400 font-mono">{inv.date} • #{inv.number}</p>
               </div>
               <p className="text-sm font-black text-green-600">{formatCurrency(inv.total)}</p>
            </div>
          ))}
          {invoices.length === 0 && <p className="text-center py-8 text-slate-300 uppercase font-black text-xs italic">No activity recorded yet</p>}
        </div>
      </div>
    </div>
  );
};

// --- App Root Controller ---

const App = () => {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [customers, setCustomers] = useLocalStorage<Customer[]>('eg_customers', []);
  const [products, setProducts] = useLocalStorage<Product[]>('eg_products', INITIAL_PRODUCTS);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('eg_invoices', []);
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleCreateInvoice = (inv: Invoice) => {
    setInvoices([...invoices, inv]);
    setActivePrintInvoice(inv);
    setView('print-view');
  };

  const handleUpdateInvoice = (inv: Invoice) => {
    setInvoices(invoices.map(i => i.id === inv.id ? inv : i));
    setEditingInvoice(null);
    setActivePrintInvoice(inv);
    setView('print-view');
  };

  const handleQuickAddCustomer = (c: Omit<Customer, 'id' | 'createdAt'>) => {
    setCustomers([...customers, { id: generateId(), ...c, createdAt: new Date().toISOString() }]);
  };

  const handleDownloadPDF = async () => {
    if (!activePrintInvoice) return;
    setIsGenerating(true);
    
    const element = document.getElementById('invoice-content');
    const opt = {
      margin: 0,
      filename: `Invoice_${activePrintInvoice.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore - html2pdf is globally available from the script tag
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('PDF generation failed. Using standard print dialog instead.');
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {view !== 'print-view' && <Sidebar currentView={view} setView={setView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
      
      <div className="flex-1 flex flex-col min-h-screen">
        {view !== 'print-view' && <MobileTopBar setIsOpen={setSidebarOpen} />}
        
        <main className={`flex-1 transition-all ${view === 'print-view' ? 'p-0' : 'p-4 sm:p-8'}`}>
          {view === 'dashboard' && <Dashboard customers={customers} invoices={invoices} setView={setView} />}
          {view === 'customers' && (
             <div className="p-4 space-y-4">
                <ViewHeader title="Client Directory" onBack={() => setView('dashboard')} />
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b"><tr className="text-xs uppercase font-black text-slate-400">
                        <th className="px-6 py-4">Client Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Address</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">{customers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold uppercase">{c.name}</td><td className="px-6 py-4 font-mono">{c.phone}</td><td className="px-6 py-4 text-slate-500">{c.address}</td></tr>
                      ))}</tbody>
                   </table>
                </div>
             </div>
          )}
          {view === 'products' && (
             <div className="p-4 space-y-4">
                <ViewHeader title="Inventory Master" onBack={() => setView('dashboard')} />
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b"><tr className="text-xs uppercase font-black text-slate-400">
                        <th className="px-6 py-4">Item Name</th><th className="px-6 py-4 text-right">Base Price</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">{products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50"><td className="px-6 py-4 font-bold uppercase">{p.name}</td><td className="px-6 py-4 text-right font-mono">{formatCurrency(p.price)}</td></tr>
                      ))}</tbody>
                   </table>
                </div>
             </div>
          )}
          {view === 'invoices' && (
            <InvoiceList 
              invoices={invoices} 
              setInvoices={setInvoices} 
              onPrint={(i) => { setActivePrintInvoice(i); setView('print-view'); }} 
              onEdit={(i) => { setEditingInvoice(i); setView('edit-invoice'); }}
              onBack={() => setView('dashboard')} 
            />
          )}
          {view === 'reports' && (
            <ReportsView invoices={invoices} onBack={() => setView('dashboard')} />
          )}
          {view === 'new-invoice' && (
            <InvoiceForm 
              customers={customers} 
              products={products} 
              onSubmit={handleCreateInvoice} 
              onCancel={() => setView('dashboard')} 
              onAddCustomer={handleQuickAddCustomer} 
            />
          )}
          {view === 'edit-invoice' && editingInvoice && (
            <InvoiceForm 
              customers={customers} 
              products={products} 
              initialInvoice={editingInvoice}
              onSubmit={handleUpdateInvoice} 
              onCancel={() => { setEditingInvoice(null); setView('invoices'); }} 
              onAddCustomer={handleQuickAddCustomer} 
            />
          )}

          {view === 'print-view' && activePrintInvoice && (
            <div className="py-4 bg-slate-100 min-h-screen print:p-0 print:bg-white overflow-y-auto no-scrollbar">
              <div className="max-w-[210mm] mx-auto mb-4 px-4 flex justify-between items-center no-print">
                <button onClick={() => setView('invoices')} className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all active:scale-95"><ChevronLeft size={16}/> Return</button>
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGenerating}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16}/>}
                    {isGenerating ? "Creating PDF..." : "Download PDF"}
                  </button>
                  <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all hover:bg-slate-800 active:scale-95"><Printer size={16}/> Print</button>
                </div>
              </div>
              <InvoicePrint invoice={activePrintInvoice} ref={invoiceRef} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
