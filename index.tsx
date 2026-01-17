import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft
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
const BUSINESS_PHONE = "6466679749";
const ORDER_PHONE = "(302) 898-1880";

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
];

const INITIAL_PRODUCTS: Product[] = PRODUCT_NAMES.map((name, idx) => ({
  id: `p-${idx}`,
  name,
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

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-6)}`;

// --- Local Storage Hooks ---

const useLocalStorage = <T,>(key: string, initialValue: T) => {
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

  return [storedValue, setStoredValue] as const;
};

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
    if (window.innerWidth < 1024) setIsOpen(false); // Auto-hide on mobile
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isOpen ? 'translate-x-0' : '-translate-x-full'} no-print`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-400 flex items-center gap-2">
              <Leaf className="w-6 h-6" />
              <span>Ever Green</span>
            </h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 p-1 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
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
          
          <div className="p-6 border-t border-slate-800 text-[10px] text-slate-500 font-mono tracking-widest text-center uppercase">
            &copy; 2024 Produce System
          </div>
        </div>
      </aside>
    </>
  );
};

const MobileTopBar = ({ setIsOpen }: { setIsOpen: (o: boolean) => void }) => (
  <header className="lg:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-30 flex items-center justify-between no-print">
    <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-slate-600">
      <MenuIcon size={24} />
    </button>
    <div className="flex items-center gap-2 font-black text-slate-800">
      <Leaf className="text-green-600" size={20} />
      <span className="text-sm uppercase tracking-tight">Ever Green</span>
    </div>
    <div className="w-10" /> {/* Spacer */}
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
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div className="flex items-center gap-3">
      {onBack && (
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
      )}
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

const ReportsView = ({ invoices, setView }: { invoices: Invoice[], setView: (v: string) => void }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthInvoices = useMemo(() => {
    return invoices.filter(inv => inv.date.startsWith(selectedMonth));
  }, [invoices, selectedMonth]);

  const stats = useMemo(() => {
    const total = monthInvoices.reduce((sum, i) => sum + i.total, 0);
    const count = monthInvoices.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [monthInvoices]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ViewHeader 
        title="Monthly Reports" 
        onBack={() => setView('dashboard')}
        action={
          <div className="flex items-center gap-4 no-print">
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-lg">
              <Printer size={18} /> Print
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-green-600">{formatCurrency(stats.total)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Invoices Issued</p>
          <p className="text-3xl font-black text-slate-900">{stats.count}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average / Invoice</p>
          <p className="text-3xl font-black text-blue-600">{formatCurrency(stats.avg)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Monthly Detail ({selectedMonth})</h3>
          <p className="text-xs font-mono text-slate-400">Total: {monthInvoices.length} Rows</p>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Date</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Invoice #</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Customer</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {monthInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-mono font-bold">{inv.number}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{inv.customerName}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-green-600">{formatCurrency(inv.total)}</td>
              </tr>
            ))}
            {monthInvoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No sales data for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="print-only text-center mt-8 text-xs text-slate-400">
        Generated from {BUSINESS_NAME} Management System on {new Date().toLocaleString()}
      </div>
    </div>
  );
};

// --- Updated Dashboard ---
const Dashboard = ({ 
  customers, 
  products, 
  invoices, 
  setView 
}: { 
  customers: Customer[], 
  products: Product[], 
  invoices: Invoice[],
  setView: (v: string) => void
}) => {
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const stats = [
    { label: 'Total Sales', value: formatCurrency(totalSales), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Invoices', value: invoices.length, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Customers', value: customers.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Products', value: products.length, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Main Dashboard</h2>
        <p className="text-slate-500 font-medium">Global summary and quick business tools.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" /> Fast Access
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setView('new-invoice')} className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all group active:scale-95">
              <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-700">New Invoice</span>
            </button>
            <button onClick={() => setView('reports')} className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-200 transition-all group active:scale-95">
              <BarChart3 className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-700">Monthly Reports</span>
            </button>
            <button onClick={() => setView('customers')} className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-2xl hover:bg-purple-50 hover:border-purple-200 transition-all group active:scale-95">
              <Users className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-700">Clients</span>
            </button>
            <button onClick={() => setView('products')} className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all group active:scale-95">
              <Package className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-slate-700">Inventory</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Recent Sales
          </h3>
          <div className="space-y-3">
            {invoices.slice(-5).reverse().map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setView('invoices')}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{inv.customerName}</p>
                    <p className="text-[10px] text-slate-500 font-mono font-bold">{inv.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{formatCurrency(inv.total)}</p>
                  <p className="text-[10px] text-slate-500">{new Date(inv.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-400 italic">No invoice records.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Updated CustomerList ---
const CustomerList = ({ customers, setCustomers, onBack }: { customers: Customer[], setCustomers: (c: Customer[]) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt'>>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c));
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setCustomers([...customers, newCustomer]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', address: '', phone: '', email: '' });
  };

  const handleEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      address: c.address,
      phone: c.phone,
      email: c.email || '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ViewHeader 
        title="Customer Directory" 
        onBack={onBack}
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-900/10"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </button>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name or contact..." 
          className="flex-1 outline-none text-slate-700 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Customer</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Contact</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-black text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{c.address}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold flex items-center gap-1.5 text-slate-700">
                    <Phone size={12} className="text-slate-400" /> {c.phone}
                  </p>
                  {c.email && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Mail size={12} className="text-slate-400" /> {c.email}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => confirm('Delete?') && setCustomers(customers.filter(item => item.id !== c.id))} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No customers matched your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">{editingCustomer ? 'Edit' : 'Add'} Customer</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Address</label>
                <textarea required rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Phone</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [customers, setCustomers] = useLocalStorage<Customer[]>('eg_customers', []);
  const [products, setProducts] = useLocalStorage<Product[]>('eg_products', INITIAL_PRODUCTS);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('eg_invoices', []);
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);

  const handleCreateInvoice = (inv: Invoice) => {
    setInvoices([...invoices, inv]);
    setActivePrintInvoice(inv);
    setView('print-view');
  };

  const handlePrintRequest = (inv: Invoice) => {
    setActivePrintInvoice(inv);
    setView('print-view');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {view !== 'print-view' && (
        <Sidebar 
          currentView={view} 
          setView={setView} 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
      )}
      
      <div className="flex-1 flex flex-col min-h-screen">
        {view !== 'print-view' && <MobileTopBar setIsOpen={setSidebarOpen} />}
        
        <main className={`flex-1 transition-all ${view === 'print-view' ? 'p-0' : 'p-4 sm:p-8 lg:p-12'}`}>
          {view === 'dashboard' && (
            <Dashboard 
              customers={customers} 
              products={products} 
              invoices={invoices} 
              setView={setView} 
            />
          )}
          
          {view === 'customers' && (
            <CustomerList 
              customers={customers} 
              setCustomers={setCustomers} 
              onBack={() => setView('dashboard')} 
            />
          )}
          
          {view === 'products' && (
            <ProductList 
              products={products} 
              setProducts={setProducts} 
              onBack={() => setView('dashboard')} 
            />
          )}
          
          {view === 'invoices' && (
            <InvoiceList 
              invoices={invoices} 
              setInvoices={setInvoices} 
              onPrint={handlePrintRequest} 
              onBack={() => setView('dashboard')} 
            />
          )}

          {view === 'reports' && (
            <ReportsView 
              invoices={invoices} 
              setView={setView} 
            />
          )}
          
          {view === 'new-invoice' && (
            <NewInvoice 
              customers={customers} 
              products={products} 
              onSubmit={handleCreateInvoice}
              onCancel={() => setView('dashboard')}
            />
          )}

          {view === 'print-view' && activePrintInvoice && (
            <div className="py-12 print:py-0 print:bg-white bg-slate-100">
              <div className="max-w-[210mm] mx-auto mb-10 px-4 flex justify-between items-center no-print">
                <button 
                  onClick={() => setView('invoices')}
                  className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-2xl font-bold border shadow-sm hover:bg-slate-50"
                >
                  <ChevronLeft size={20} /> Exit
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl hover:bg-slate-800"
                >
                  <Printer size={18} /> Print PDF
                </button>
              </div>
              <InvoicePrint invoice={activePrintInvoice} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Helper View: ProductList (Refactored) ---
const ProductList = ({ products, setProducts, onBack }: { products: Product[], setProducts: (p: Product[]) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Vegetable',
    unitType: 'Piece',
    price: 0,
  });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
    } else {
      setProducts([...products, { id: generateId(), ...formData }]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <ViewHeader 
        title="Inventory" 
        onBack={onBack}
        action={
          <button onClick={() => { setEditingProduct(null); setFormData({name: '', category: 'Vegetable', unitType: 'Piece', price: 0}); setIsModalOpen(true); }} className="w-full sm:w-auto bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-900/10 flex items-center justify-center gap-2">
            <Plus size={18} /> New Product
          </button>
        }
      />
      
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search products..." className="flex-1 outline-none font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Product</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Unit</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Price</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">{p.unitType}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-slate-900">{formatCurrency(p.price)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"><Edit size={18}/></button>
                    <button onClick={() => confirm('Delete product?') && setProducts(products.filter(i => i.id !== p.id))} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-200">
             <div className="flex justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">Product Details</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1 ml-1">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-1 ml-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full border rounded-2xl px-4 py-3 bg-white outline-none">
                      <option>Vegetable</option><option>Fruit</option><option>Grocery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-1 ml-1">Unit</label>
                    <select value={formData.unitType} onChange={e => setFormData({...formData, unitType: e.target.value as UnitType})} className="w-full border rounded-2xl px-4 py-3 bg-white outline-none">
                      <option>Piece</option><option>Lb</option><option>Box</option><option>Kg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1 ml-1">Default Price</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full border rounded-2xl px-4 py-3 outline-none" />
                </div>
                <button className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-900/20 mt-4">Save Product</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Existing Helper Views Re-added with 'Back' navigation ---
const InvoiceList = ({ invoices, setInvoices, onPrint, onBack }: { invoices: Invoice[], setInvoices: (i: Invoice[]) => void, onPrint: (i: Invoice) => void, onBack: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredInvoices = invoices.filter(inv => inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <ViewHeader title="Invoice History" onBack={onBack} />
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search invoices..." className="flex-1 outline-none font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Invoice #</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Customer</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Total</th>
              <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.slice().reverse().map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-sm text-slate-800">{inv.number}</td>
                <td className="px-6 py-4 font-black text-slate-800">{inv.customerName}</td>
                <td className="px-6 py-4 text-right font-mono font-black text-green-600">{formatCurrency(inv.total)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onPrint(inv)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"><Printer size={18} /></button>
                    <button onClick={() => confirm('Delete?') && setInvoices(invoices.filter(i => i.id !== inv.id))} className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Logic from turns 1-3 re-integrated below for NewInvoice and InvoicePrint ---
const NewInvoice = ({ customers, products, onSubmit, onCancel }: { 
  customers: Customer[], 
  products: Product[], 
  onSubmit: (inv: Invoice) => void,
  onCancel: () => void 
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber] = useState(generateInvoiceNumber());
  const [searchTerm, setSearchTerm] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal;

  const filteredSearchProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
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
    setItems(items.map(i => i.productId === id ? { ...i, quantity: qty, price, total: qty * price } : i));
  };

  const handleSave = () => {
    if (!selectedCustomerId) return alert('Select customer');
    if (items.length === 0) return alert('Add items');
    const customer = customers.find(c => c.id === selectedCustomerId)!;
    onSubmit({ id: generateId(), number: invoiceNumber, customerId: customer.id, customerName: customer.name, customerAddress: customer.address, date: invoiceDate, items, subtotal, tax: 0, total });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-300">
      <ViewHeader title="Create Invoice" onBack={onCancel} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 ml-1">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 ml-1 text-slate-600">Customer</label>
                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white outline-none">
                  <option value="">-- Choose --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 ml-1 text-slate-600">Date</label>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none" />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-xs font-black uppercase text-slate-400">
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3 text-center">Qty</th>
                    <th className="px-6 py-3 text-right">Price</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map(item => (
                    <tr key={item.productId}>
                      <td className="px-6 py-4 font-black text-slate-800">{item.name}</td>
                      <td className="px-6 py-4">
                        <input type="number" value={item.quantity} onChange={e => updateItem(item.productId, parseFloat(e.target.value) || 0, item.price)} className="w-16 text-center border rounded-lg mx-auto block font-mono font-bold py-1" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input type="number" step="0.01" value={item.price} onChange={e => updateItem(item.productId, item.quantity, parseFloat(e.target.value) || 0)} className="w-20 text-right border rounded-lg px-2 py-1 font-mono font-bold" />
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(item.total)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setItems(items.filter(i => i.productId !== item.productId))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-slate-50 flex flex-col items-end gap-1">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Grand Total</span>
              <span className="text-4xl font-black text-green-600 font-mono">{formatCurrency(total)}</span>
            </div>
          </section>

          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 border-2 border-slate-100 bg-white rounded-2xl font-black text-slate-600 active:scale-95 transition-transform">Discard</button>
            <button onClick={handleSave} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black shadow-xl shadow-green-900/10 active:scale-95 transition-transform">Complete Invoice</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col h-[600px] shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 ml-1">Add Products</h3>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16}/>
            <input type="text" placeholder="Start typing..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {filteredSearchProducts.map(p => (
              <button key={p.id} onClick={() => addItem(p)} className="w-full p-4 border border-slate-100 rounded-2xl flex justify-between hover:bg-green-50 hover:border-green-200 transition-all text-sm group active:bg-green-100">
                <span className="font-bold text-slate-700 group-hover:text-green-700">{p.name}</span>
                <Plus size={16} className="text-slate-300 group-hover:text-green-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InvoicePrint = ({ invoice }: { invoice: Invoice }) => (
  <div className="bg-white min-h-[297mm] w-full max-w-[210mm] mx-auto p-12 text-slate-800 font-sans shadow-none print:p-8 flex flex-col">
    <div className="flex justify-between items-start mb-12">
      <div className="flex items-center gap-4">
        <div className="bg-green-700 p-4 rounded-2xl text-white">
          <Leaf size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{BUSINESS_NAME}</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Produce Distribution Hub</p>
          <p className="text-lg font-black text-green-700 mt-2">Ph: {BUSINESS_PHONE}</p>
        </div>
      </div>
      <div className="text-right">
         <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl">
            <p className="text-[10px] uppercase font-bold opacity-60 mb-1 tracking-widest">Invoice Number</p>
            <p className="text-xl font-mono font-bold tracking-tighter">{invoice.number}</p>
         </div>
         <p className="text-xs font-bold text-slate-400 mt-4 uppercase">Date Issued</p>
         <p className="text-lg font-bold">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-12 mb-12">
      <div>
        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">Recipient</h4>
        <p className="text-xl font-black text-slate-900 mb-1">{invoice.customerName}</p>
        <p className="text-sm text-slate-600 leading-relaxed max-w-xs">{invoice.customerAddress}</p>
      </div>
      <div className="text-right">
         <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-4">Payment</h4>
         <p className="text-sm font-bold text-slate-900">Due on Delivery</p>
         <p className="text-xs text-slate-400 mt-2">Please pay to:</p>
         <p className="text-sm font-bold text-slate-900">{BUSINESS_NAME}</p>
      </div>
    </div>

    <div className="flex-1">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-900 text-[10px] uppercase font-black tracking-widest text-slate-400">
            <th className="py-4 text-left">Product</th>
            <th className="py-4 text-center w-24">Qty</th>
            <th className="py-4 text-right w-32">Unit Price</th>
            <th className="py-4 text-right w-32">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-5 font-black text-slate-800 text-sm">{item.name}</td>
              <td className="py-5 text-center font-mono font-bold text-slate-600">{item.quantity}</td>
              <td className="py-5 text-right font-mono text-slate-600">{formatCurrency(item.price)}</td>
              <td className="py-5 text-right font-mono font-black text-slate-900">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end pt-8 border-t-2 border-slate-900 mt-12">
      <div className="w-72 space-y-2">
        <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Balance Due</span>
          <span className="text-3xl font-black text-green-600 font-mono">{formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    <footer className="mt-20 pt-10 border-t border-slate-100 text-center">
      <div className="max-w-xl mx-auto space-y-2">
        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Official Invoice</p>
        <p className="text-[10px] text-slate-500">Deliveries must be verified at arrival. Refunds cannot be issued after delivery completion.</p>
        <p className="text-[11px] text-slate-900 font-black">Email/Text orders by 6pm: <span className="text-green-700 font-mono tracking-tighter">{ORDER_PHONE}</span></p>
      </div>
    </footer>
  </div>
);

// --- Mount App ---

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
