
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
  CalendarDays,
  PackagePlus,
  Target,
  StickyNote,
  Eye,
  Trash,
  FileSpreadsheet
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Types & Interfaces ---

type Category = 'Vegetable' | 'Fruit' | 'Grocery' | 'Other';
type UnitType = 'Kg' | 'Lb' | 'Box' | 'Bunch' | 'Piece';
type LayoutOption = 'single-column-large' | 'single-column-condensed' | 'two-column' | 'universal-fit';

const CATEGORIES: Category[] = ['Vegetable', 'Fruit', 'Grocery', 'Other'];
const UNIT_TYPES: UnitType[] = ['Kg', 'Lb', 'Box', 'Bunch', 'Piece'];

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
const BUSINESS_TITLE = "Evergreen by Tahir";
const BUSINESS_PHONE = "646-667-9749";
const BUSINESS_LOCATION = "New York, NY";
const ORDER_PHONE = "646-667-9749";

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

const AddProductModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (p: Omit<Product, 'id'>) => void 
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Vegetable',
    unitType: 'Kg',
    price: 0
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name) return alert("Product name is required");
    onSave(formData);
    setFormData({ name: '', category: 'Vegetable', unitType: 'Kg', price: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[101] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
            <PackagePlus size={24} />
          </div>
          <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter">New Product</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
            <input 
              autoFocus 
              placeholder="e.g. Red Grapes" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value as Category})} 
                className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
              <select 
                value={formData.unitType} 
                onChange={e => setFormData({...formData, unitType: e.target.value as UnitType})} 
                className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all"
              >
                {UNIT_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price ($)</label>
            <input 
              type="number"
              step="0.01"
              placeholder="0.00" 
              value={formData.price || ''} 
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
              className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-mono font-bold bg-slate-50 focus:border-orange-500 outline-none transition-all text-right" 
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-100 font-black rounded-2xl text-[10px] uppercase text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-4 bg-orange-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-orange-900/20 hover:bg-orange-700 transition-colors">Add Item</button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    { id: 'notes', icon: StickyNote, label: 'Notes' },
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

const LivePreviewModal = ({ isOpen, onClose, onPrint, onDownload, invoice }: { isOpen: boolean, onClose: () => void, onPrint: (layout: LayoutOption) => void, onDownload: (layout: LayoutOption) => void, invoice: Invoice | null }) => {
  const [layout, setLayout] = useState<LayoutOption>('single-column-large');
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invoice) {
      const count = invoice.items.filter(i => i.quantity > 0).length;
      if (count <= 15) setLayout('single-column-large');
      else if (count <= 30) setLayout('single-column-condensed');
      else if (count <= 50) setLayout('two-column');
      else setLayout('universal-fit');
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  const layoutOptions: { id: LayoutOption, label: string }[] = [
    { id: 'single-column-large', label: 'Layout A' },
    { id: 'single-column-condensed', label: 'Layout B' },
    { id: 'two-column', label: 'Layout C' },
    { id: 'universal-fit', label: 'Layout D' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[101] flex flex-col items-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl flex justify-between items-center py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-2">
          {layoutOptions.map(opt => (
            <button key={opt.id} onClick={() => setLayout(opt.id)} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${layout === opt.id ? 'bg-white text-slate-900' : 'text-white/70 hover:bg-white/20'}`}>{opt.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="py-2 px-4 bg-slate-600 text-white font-bold rounded-lg text-xs">Cancel</button>
          <button type="button" onClick={(e) => { e.preventDefault(); onPrint(layout); }} className="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 no-print"><Printer size={14}/> Print Document</button>
          <button onClick={() => onDownload(layout)} className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg text-xs flex items-center gap-2"><FileDown size={14}/> Download PDF</button>
        </div>
      </div>
      <div id="invoice-print-area" className="w-full max-w-[700px] mx-auto shadow-2xl rounded-lg overflow-hidden my-auto">
        <InvoicePrint ref={invoiceRef} invoice={invoice} layout={layout} />
      </div>
    </div>
  );
};

const NotesPreviewModal = ({ 
  isOpen, 
  onClose, 
  onDownload, 
  clientName, 
  author, 
  noteItems 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onDownload: () => void, 
  clientName: string, 
  author: string, 
  noteItems: any[] 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[101] flex flex-col items-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-5xl flex justify-end items-center py-4 sticky top-0 z-10">
        <div className="flex gap-2">
          <button onClick={onClose} className="py-2 px-4 bg-slate-600 text-white font-bold rounded-lg text-xs">Cancel</button>
          <button onClick={onDownload} className="py-2 px-4 bg-green-600 text-white font-bold rounded-lg text-xs flex items-center gap-2">
            <FileDown size={14}/> Download PDF
          </button>
        </div>
      </div>
      <div className="w-full max-w-[700px] mx-auto shadow-2xl rounded-lg overflow-hidden my-auto bg-white p-12">
        <NotesPrint clientName={clientName} author={author} noteItems={noteItems} />
      </div>
    </div>
  );
};

const NotesPrint = ({ clientName, author, noteItems }: { clientName: string, author: string, noteItems: any[] }) => {
  return (
    <div className="font-sans text-slate-900">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-green-700 p-3 rounded-full text-white mb-2">
          <Leaf size={32} />
        </div>
        <h1 className="text-2xl font-black text-green-800 uppercase tracking-tight">{BUSINESS_TITLE}</h1>
        <p className="text-sm font-bold text-slate-500">Phone: {BUSINESS_PHONE}</p>
        <p className="text-sm font-bold text-slate-500">{BUSINESS_LOCATION}</p>
      </div>
      
      <div className="border-t-2 border-green-700 my-4"></div>
      
      <div className="mb-6">
        <h2 className="text-lg font-black text-green-800 uppercase mb-4">Available Products</h2>
        <div className="space-y-2">
          {noteItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100">
              <div className="flex-1">
                <p className="text-sm font-bold uppercase text-slate-800">{item.name}</p>
                {item.pref && <p className="text-[10px] text-slate-400 italic">{item.pref}</p>}
              </div>
              <div className="flex gap-8 text-right">
                {item.qty && <p className="text-xs font-bold text-slate-500">QTY: {item.qty}</p>}
                {item.price && <p className="text-xs font-black text-green-700">${item.price}</p>}
              </div>
            </div>
          ))}
          {noteItems.length === 0 && <p className="text-center py-8 text-slate-300 italic">No products selected</p>}
        </div>
      </div>
      
      <div className="mt-12 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-widest">
        &copy; {new Date().getFullYear()} {BUSINESS_NAME}
      </div>
    </div>
  );
};


// --- Adaptive Professional Produce Invoice Print ---
const InvoicePrint = React.forwardRef<HTMLDivElement, { invoice: Invoice, layout: LayoutOption }>(({ invoice, layout }, ref) => {
  const activeItems = invoice.items.filter(item => item.quantity > 0);
  const itemCount = activeItems.length;

  const isUniversal = layout === 'universal-fit';
  const useTwoColumn = isUniversal ? itemCount > 20 : layout === 'two-column';

  // Dynamic sizing for Universal Fit
  const dynamicFontSize = isUniversal 
    ? (itemCount <= 20 ? '12pt' : '9.5pt')
    : (layout === 'single-column-large' ? '10pt' : layout === 'single-column-condensed' ? '8pt' : '7.5pt');

  const dynamicVerticalPadding = isUniversal
    ? (itemCount <= 20 ? 'py-3' : 'py-1')
    : (layout === 'single-column-large' ? 'py-2' : layout === 'single-column-condensed' ? 'py-1' : 'py-0.5');

  const billToPadding = isUniversal && itemCount < 15 ? 'pb-16' : 'pb-0';

  const fontSizeClass = !isUniversal ? {
    'single-column-large': 'text-[10pt]',
    'single-column-condensed': 'text-[8pt]',
    'two-column': 'text-[7.5pt]',
    'universal-fit': ''
  }[layout] : '';

  const verticalPadding = !isUniversal ? {
    'single-column-large': 'py-2',
    'single-column-condensed': 'py-1',
    'two-column': 'py-0.5',
    'universal-fit': ''
  }[layout] : '';

  const renderItems = (items: InvoiceItem[], offset = 0) => (
    <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
      <thead>
        <tr className="font-black uppercase text-slate-500 border-b-2 border-slate-900 text-[7pt]">
          <th style={{ width: '35px' }} className="py-1 pl-1">#</th>
          <th style={{ width: 'auto' }} className="py-1">Item</th>
          <th style={{ width: '45px' }} className="py-1 text-center">Qty</th>
          <th style={{ width: '75px' }} className="py-1 text-right">Price</th>
          <th style={{ width: '85px' }} className="py-1 text-right pr-1">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx} className={`border-b border-slate-100 ${verticalPadding}`} style={{ pageBreakInside: 'avoid' }}>
            <td style={{ width: '35px' }} className="pl-1 font-mono text-slate-400 align-top pt-1">{offset + idx + 1}</td>
            <td style={{ width: 'auto' }} className="font-bold uppercase tracking-tight text-slate-800 leading-tight align-top pt-1 break-words overflow-hidden">
              {item.name}
            </td>
            <td style={{ width: '45px' }} className="text-center font-mono font-bold align-top pt-1">{item.quantity}</td>
            <td style={{ width: '75px' }} className="text-right font-mono text-slate-500 align-top pt-1">{formatCurrency(item.price)}</td>
            <td style={{ width: '85px' }} className="text-right pr-1 font-mono font-black align-top pt-1">{formatCurrency(item.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div ref={ref} id="invoice-content" className={`bg-white w-full mx-auto p-8 text-slate-900 font-sans flex flex-col leading-snug`} style={{ fontSize: dynamicFontSize }}>
      <header className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
        <div className="flex items-center gap-4">
          <div className="bg-green-600 p-2.5 rounded-lg text-white"><Leaf size={28} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{BUSINESS_NAME}</h1>
            <p className="text-sm font-semibold text-slate-500">Phone: {BUSINESS_PHONE}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black uppercase tracking-widest">Invoice</p>
          <p className="font-mono text-slate-500 text-sm mt-1"># {invoice.number}</p>
          <p className="font-bold text-slate-500 text-sm mt-2">Date: {new Date(invoice.date).toLocaleDateString()}</p>
        </div>
      </header>

      <div>
        <section className={`my-6 grid grid-cols-2 gap-12 ${billToPadding}`}>
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Bill To</h2>
            <p className="text-lg font-bold text-slate-800 uppercase leading-tight">{invoice.customerName}</p>
            <p className="text-sm text-slate-500 font-medium leading-snug mt-1">{invoice.customerAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Terms</h2>
            <p className="text-md font-semibold text-slate-700">Due on Delivery</p>
          </div>
        </section>

        <main className={`flex flex-col overflow-hidden pt-2 ${fontSizeClass}`}>
          {useTwoColumn ? (
            <table className="column-container">
              <tbody>
                <tr>
                  <td className="column-cell">
                    {renderItems(activeItems.slice(0, Math.ceil(itemCount / 2)))}
                  </td>
                  <td className="column-cell">
                    {renderItems(activeItems.slice(Math.ceil(itemCount / 2)), Math.ceil(itemCount / 2))}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            renderItems(activeItems)
          )}
          {itemCount === 0 && <div className="text-center text-slate-400 py-10">No items in this invoice.</div>}
        </main>
      </div>

      <footer className="pt-4">
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <div className="flex justify-between text-lg font-black text-slate-900 bg-slate-100 p-4 rounded-lg">
              <span>Grand Total</span>
              <span className="font-mono tracking-tight">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
        <div className="text-[7pt] text-slate-400 border-t border-slate-200 pt-2 mt-4">
           <span className="font-black italic">Conditions:</span>
           <span> No adjustments after departure. EVER GREEN PRODUCE not liable for indirect damages.</span>
        </div>
      </footer>
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
        <button onClick={() => setView('notes')} className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all active:scale-95 group shadow-sm">
          <StickyNote className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Notes</span>
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
                                    <button onClick={() => onPrint(inv)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Print / Download"><Printer size={18}/></button>
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
  onAddCustomer,
  onAddProduct
}: { 
  customers: Customer[], 
  products: Product[], 
  initialInvoice?: Invoice | null, 
  onSubmit: (inv: Invoice) => void, 
  onCancel: () => void, 
  onAddCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => void,
  onAddProduct: (p: Omit<Product, 'id'>) => Product
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialInvoice?.customerId || '');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(initialInvoice?.date || new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>(initialInvoice?.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', address: '', phone: '' });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
      c.phone.includes(clientSearchTerm)
    );
  }, [clientSearchTerm, customers]);

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

  const handleQuickAddClient = () => {
    if (!newClientData.name || !newClientData.phone) return alert("Missing required fields");
    onAddCustomer(newClientData);
    setNewClientData({ name: '', address: '', phone: '' });
    setIsAddClientModalOpen(false);
  };

  const handleQuickAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created = onAddProduct(newProd);
    addItem(created); // Automatically add it to the order
  };

  const updateItem = (id: string, qty: number, price: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, quantity: qty, price: price, total: qty * price } : i));
  };

  const handleComplete = () => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return alert('Select a customer.');
    
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
                <button onClick={() => setIsAddClientModalOpen(true)} className="p-3.5 bg-green-600 text-white rounded-xl shadow-lg active:scale-95 transition-all hover:bg-green-700" title="Add New Client"><UserPlus size={18}/></button>
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
           <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 text-slate-300" size={16} />
                <input placeholder="Filter products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 outline-none focus:border-orange-500 transition-all" />
              </div>
              <button 
                onClick={() => setIsAddProductModalOpen(true)}
                className="p-3 bg-orange-600 text-white rounded-xl shadow-lg active:scale-95 transition-all hover:bg-orange-700" 
                title="New Inventory Item"
              >
                <PackagePlus size={20}/>
              </button>
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
              {filteredProducts.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic">No items match search</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)} 
        onSave={handleQuickAddProduct} 
      />

      {isAddClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                  <UserPlus size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter">New Client Entry</h3>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                   <input autoFocus placeholder="e.g. Gotham Market" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Address</label>
                   <input placeholder="123 Street Ave, NY" value={newClientData.address} onChange={e => setNewClientData({...newClientData, address: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                   <input placeholder="(555) 000-0000" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold bg-slate-50 focus:border-green-500 outline-none" />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button onClick={() => setIsAddClientModalOpen(false)} className="flex-1 py-4 bg-slate-100 font-black rounded-2xl text-[10px] uppercase text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={handleQuickAddClient} className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg hover:bg-green-700 transition-colors">Save Client</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};



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

const NotesView = ({ customers, products, onBack, onSavePDF }: { 
  customers: Customer[], 
  products: Product[],
  onBack: () => void,
  onSavePDF: (clientName: string, author: string, noteItems: any[]) => void
}) => {
  const [clientName, setClientName] = useState('');
  const [author, setAuthor] = useState('');
  const [noteItems, setNoteItems] = useState<{ name: string, qty: string, price: string, pref: string }[]>([]);
  const [newItem, setNewItem] = useState({ name: '', qty: '', price: '', pref: '' });
  const [style, setStyle] = useState({ color: '#16a34a', font: 'sans-serif' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      setNoteItems([...noteItems, { ...newItem }]);
      setNewItem({ name: '', qty: '', price: '', pref: '' });
    }
  };

  const handleRemoveItem = (idx: number) => {
    setNoteItems(noteItems.filter((_, i) => i !== idx));
  };

  const handleProductSelect = (name: string) => {
    const product = products.find(p => p.name === name);
    if (product) {
      setNewItem({ ...newItem, name: product.name, price: product.price.toString() });
    } else {
      setNewItem({ ...newItem, name });
    }
  };

  const handleSave = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ViewHeader title="Business Notes & Proposals" onBack={onBack} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-600 rounded-2xl text-white shadow-lg shadow-green-200">
                  <Leaf size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xl tracking-tighter leading-none">{BUSINESS_NAME}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{BUSINESS_PHONE}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Document Type</p>
                <p className="text-xs font-black text-slate-900 uppercase">Proposal / Note</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name (Optional)</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-4 text-slate-300" size={16} />
                    <input 
                      list="customer-list"
                      placeholder="Type or select client..." 
                      value={clientName} 
                      onChange={e => setClientName(e.target.value)} 
                      className="w-full border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold bg-slate-50 focus:border-green-500 focus:bg-white outline-none transition-all shadow-inner" 
                    />
                  </div>
                  <datalist id="customer-list">
                    {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author / Owner</label>
                  <div className="relative">
                    <Edit className="absolute left-4 top-4 text-slate-300" size={16} />
                    <input 
                      placeholder="Your name..." 
                      value={author} 
                      onChange={e => setAuthor(e.target.value)} 
                      className="w-full border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold bg-slate-50 focus:border-green-500 focus:bg-white outline-none transition-all shadow-inner" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product List Builder</label>
                  <span className="text-[10px] font-black text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full">{noteItems.length} items</span>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                      <input 
                        list="product-list"
                        placeholder="Select or type product..." 
                        value={newItem.name} 
                        onChange={e => handleProductSelect(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-white focus:border-green-500 outline-none transition-all" 
                      />
                      <datalist id="product-list">
                        {products.map(p => <option key={p.id} value={p.name} />)}
                      </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                        <input 
                          placeholder="e.g. 5" 
                          value={newItem.qty} 
                          onChange={e => setNewItem({...newItem, qty: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-white focus:border-green-500 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                        <input 
                          placeholder="0.00" 
                          value={newItem.price} 
                          onChange={e => setNewItem({...newItem, price: e.target.value})}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-white focus:border-green-500 outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Optional Preferences</label>
                    <div className="flex gap-3">
                      <input 
                        placeholder="e.g. Extra fresh, organic only..." 
                        value={newItem.pref} 
                        onChange={e => setNewItem({...newItem, pref: e.target.value})}
                        onKeyPress={e => e.key === 'Enter' && handleAddItem()}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold bg-white focus:border-green-500 outline-none transition-all" 
                      />
                      <button 
                        onClick={handleAddItem} 
                        className="px-6 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pt-2">
                  {noteItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 group hover:border-green-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-mono font-black text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                          {(idx + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-800 uppercase leading-none">{item.name}</span>
                            {item.qty && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">QTY: {item.qty}</span>}
                            {item.price && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">${item.price}</span>}
                          </div>
                          {item.pref && <p className="text-[10px] font-bold text-slate-400 mt-1.5 italic uppercase tracking-wider">{item.pref}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveItem(idx)} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {noteItems.length === 0 && (
                    <div className="py-20 text-center border-4 border-dashed border-slate-50 rounded-[3rem] bg-slate-50/30">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="text-slate-300" size={32} />
                      </div>
                      <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">List is currently empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              Styling Options
            </h4>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Theme Accent</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Forest', color: '#16a34a' },
                    { name: 'Slate', color: '#1e293b' },
                    { name: 'Ocean', color: '#2563eb' },
                    { name: 'Rose', color: '#dc2626' },
                    { name: 'Royal', color: '#9333ea' }
                  ].map(c => (
                    <button 
                      key={c.color} 
                      onClick={() => setStyle({...style, color: c.color})}
                      className={`w-10 h-10 rounded-2xl border-4 transition-all flex items-center justify-center ${style.color === c.color ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    >
                      {style.color === c.color && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Typography</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'sans-serif', name: 'Modern Sans' },
                    { id: 'serif', name: 'Classic Serif' },
                    { id: 'monospace', name: 'Technical Mono' }
                  ].map(f => (
                    <button 
                      key={f.id}
                      onClick={() => setStyle({...style, font: f.id})}
                      className={`px-4 py-3 rounded-xl text-left text-xs font-black uppercase tracking-widest transition-all ${style.font === f.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={noteItems.length === 0}
            className="w-full py-6 bg-green-600 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.15em] shadow-2xl shadow-green-900/30 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <Eye size={24} className="group-hover:bounce" />
            Preview Proposal
          </button>
          
          <div className="p-6 bg-slate-900 rounded-[2.5rem] text-center">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Security Notice</p>
            <p className="text-[10px] font-bold text-slate-300 leading-relaxed">This document will be generated as a secure PDF. Ensure all details are correct before exporting.</p>
          </div>
        </div>
      </div>

      <NotesPreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        onDownload={() => {
          onSavePDF(clientName, author, noteItems);
          setIsPreviewOpen(false);
        }}
        clientName={clientName}
        author={author}
        noteItems={noteItems}
      />
    </div>
  );
};

// --- App Root Controller ---

const App = () => {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  const [customers, setCustomers] = useLocalStorage<Customer[]>('eg_customers', []);
  const [products, setProducts] = useLocalStorage<Product[]>('eg_products', INITIAL_PRODUCTS);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('eg_invoices', []);
  const [notes, setNotes] = useLocalStorage<any[]>('eg_notes', []);
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

                const handleCreateInvoice = (inv: Invoice) => {
    setInvoices([...invoices, inv]);
    setPreviewingInvoice(inv);
    setIsPreviewModalOpen(true);
  };

                const handleUpdateInvoice = (inv: Invoice) => {
    setInvoices(invoices.map(i => i.id === inv.id ? inv : i));
    setEditingInvoice(null);
    setPreviewingInvoice(inv);
    setIsPreviewModalOpen(true);
  };

  const handleQuickAddCustomer = (c: Omit<Customer, 'id' | 'createdAt'>) => {
    setCustomers([...customers, { id: generateId(), ...c, createdAt: new Date().toISOString() }]);
  };

  const handleAddProduct = (p: Omit<Product, 'id'>) => {
    const newProduct: Product = { id: generateId(), ...p };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Delete this product from inventory?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

    const startPreviewProcess = (invoice: Invoice) => {
    setPreviewingInvoice(invoice);
    setIsPreviewModalOpen(true);
  };

  const PRINT_CSS = `
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    #invoice-wrapper { width: 210mm; margin: 0 auto; }
    table { width: 100%; table-layout: fixed; border-collapse: collapse; }
    .no-print { display: none !important; }
    tr { page-break-inside: avoid; }
    /* Prevent unexpected page breaks in two-column mode */
    .column-container { width: 100%; border-spacing: 20px 0; border-collapse: separate; }
    .column-cell { width: 50%; vertical-align: top; padding: 0; }
  `;

  const PDF_CSS = `
    html, body { 
      margin: 0; 
      padding: 0; 
      background: white; 
      width: 210mm;
      -webkit-print-color-adjust: exact; 
    }
    #invoice-wrapper { 
      width: 210mm; 
      height: 297mm; 
      padding: 15mm; 
      margin: 0;
      background: white;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
    }
    table { width: 100%; table-layout: fixed; border-collapse: collapse; }
    tr { page-break-inside: avoid; }
    h1, h2, p, span { margin: 0; padding: 0; }
    .no-print { display: none !important; }
    .column-container { width: 100%; border-spacing: 20px 0; border-collapse: separate; }
    .column-cell { width: 50%; vertical-align: top; padding: 0; }
  `;

  const getInvoiceTemplate = (content: string, mode: 'print' | 'pdf') => {
    const css = mode === 'print' ? PRINT_CSS : PDF_CSS;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice Document</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>${css}</style>
        </head>
        <body>
          <div id="invoice-wrapper">${content}</div>
        </body>
      </html>
    `;
  };

  const executePrint = (layout: LayoutOption) => {
    const printArea = document.getElementById('invoice-print-area');
    if (!printArea) return;

    const content = printArea.innerHTML;
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(getInvoiceTemplate(content, 'print'));
      printWindow.document.write(`
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.focus();
              window.print();
              window.close();
            }, 500);
          };
        </script>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadPDF = (layout: LayoutOption) => {
    const printArea = document.getElementById('invoice-print-area');
    if (!printArea || !previewingInvoice) return;

    const content = printArea.innerHTML;
    
    // Create an isolated worker element
    const worker = document.createElement('div');
    worker.id = 'pdf-worker';
    worker.style.position = 'absolute';
    worker.style.left = '-9999px';
    worker.style.top = '0';
    worker.innerHTML = getInvoiceTemplate(content, 'pdf');
    document.body.appendChild(worker);

    const element = worker.querySelector('#invoice-wrapper');

    if (element) {
      const opt = {
        margin: 0,
        filename: `INV_${previewingInvoice.customerName.replace(/\s+/g, '_')}_${previewingInvoice.number}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: 794, // Exact A4 width in pixels at 96 DPI
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
      };

      (window as any).html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(worker);
        setIsPreviewModalOpen(false);
        setPreviewingInvoice(null);
      }).catch((err: any) => {
        console.error('PDF Generation Error:', err);
        document.body.removeChild(worker);
      });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <>
      <div className="flex min-h-screen bg-slate-50">
      {view !== 'print-view' && <Sidebar currentView={view} setView={setView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
      
      <div className="flex-1 flex flex-col min-h-screen">
        {view !== 'print-view' && <MobileTopBar setIsOpen={setSidebarOpen} />}
        
        <main className={`flex-1 transition-all ${view === 'print-view' ? 'p-0' : 'p-4 sm:p-8'}`}>
          {view === 'dashboard' && <Dashboard customers={customers} invoices={invoices} setView={setView} />}
          {view === 'customers' && (
             <div className="p-4 space-y-4">
                <ViewHeader 
                  title={selectedCustomerId ? "Client History" : "Client Directory"} 
                  onBack={() => {
                    if (selectedCustomerId) setSelectedCustomerId(null);
                    else setView('dashboard');
                  }} 
                />
                
                {!selectedCustomerId ? (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b"><tr className="text-xs uppercase font-black text-slate-400">
                          <th className="px-6 py-4">Client Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Address</th><th className="px-6 py-4"></th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">{customers.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 group">
                            <td className="px-6 py-4 font-bold uppercase">{c.name}</td>
                            <td className="px-6 py-4 font-mono">{c.phone}</td>
                            <td className="px-6 py-4 text-slate-500">{c.address}</td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => setSelectedCustomerId(c.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <ChevronRight size={18}/>
                              </button>
                            </td>
                          </tr>
                        ))}</tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-black uppercase text-slate-900 mb-1">
                        {customers.find(c => c.id === selectedCustomerId)?.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {customers.find(c => c.id === selectedCustomerId)?.address}
                      </p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b bg-slate-50/50">
                        <h4 className="font-black uppercase text-xs text-slate-400 tracking-widest">Transaction History</h4>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                          <tr className="text-[10px] uppercase font-black text-slate-400">
                            <th className="px-6 py-4">Inv #</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.filter(inv => inv.customerId === selectedCustomerId).map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50 group">
                              <td className="px-6 py-4 font-mono font-bold">#{inv.number}</td>
                              <td className="px-6 py-4 text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right font-mono font-black">{formatCurrency(inv.total)}</td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button onClick={() => startPreviewProcess(inv)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all" title="View"><Eye size={16}/></button>
                                <button onClick={() => { setPreviewingInvoice(inv); handleDownloadPDF('universal-fit'); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all" title="Download"><Download size={16}/></button>
                                <button 
                                  onClick={() => {
                                    const headers = ["Invoice #", "Date", "Product", "Qty", "Price", "Total"];
                                    const rows = inv.items.map(item => [
                                      inv.number,
                                      new Date(inv.date).toLocaleDateString(),
                                      `"${item.name}"`,
                                      item.quantity,
                                      item.price.toFixed(2),
                                      item.total.toFixed(2)
                                    ]);
                                    rows.push(["", "", "Subtotal", "", "", inv.subtotal.toFixed(2)]);
                                    rows.push(["", "", "Tax", "", "", inv.tax.toFixed(2)]);
                                    rows.push(["", "", "Grand Total", "", "", inv.total.toFixed(2)]);
                                    
                                    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.setAttribute("href", url);
                                    link.setAttribute("download", `Invoice_${inv.number}_${inv.customerName.replace(/\s+/g, '_')}.csv`);
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }} 
                                  className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-all" 
                                  title="Export CSV"
                                >
                                  <FileSpreadsheet size={16}/>
                                </button>
                                <button onClick={() => {
                                  if (confirm("Clear this invoice from history?")) {
                                    setInvoices(invoices.filter(i => i.id !== inv.id));
                                  }
                                }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="Clear"><Trash size={16}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {invoices.filter(inv => inv.customerId === selectedCustomerId).length === 0 && (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs italic">No invoices found for this client</div>
                      )}
                    </div>
                  </div>
                )}
             </div>
          )}
          {view === 'notes' && (
            <NotesView 
              customers={customers} 
              products={products}
              onBack={() => setView('dashboard')} 
              onSavePDF={(clientName, author, noteItems) => {
                const doc = new jsPDF({
                  unit: 'mm',
                  format: 'a4',
                  orientation: 'portrait'
                });

                let yPos = 20;
                const margin = 20;
                const pageWidth = doc.internal.pageSize.getWidth();

                // 1. Top Center: Evergreen Logo (Using a green circle as logo placeholder since we don't have the asset)
                doc.setFillColor(22, 101, 52); // Dark green
                doc.circle(pageWidth / 2, yPos, 8, 'F');
                // Draw a simple leaf shape with lines
                doc.setDrawColor(255, 255, 255);
                doc.setLineWidth(0.5);
                doc.line(pageWidth / 2, yPos - 4, pageWidth / 2, yPos + 4);
                doc.line(pageWidth / 2, yPos - 4, pageWidth / 2 + 3, yPos);
                doc.line(pageWidth / 2, yPos - 4, pageWidth / 2 - 3, yPos);
                
                yPos += 15;

                // 2. Below Logo: Title, Phone, Location
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(22);
                doc.setTextColor(22, 101, 52); // Dark green
                doc.text(BUSINESS_TITLE, pageWidth / 2, yPos, { align: 'center' });
                
                yPos += 8;
                doc.setFontSize(10);
                doc.setTextColor(100, 116, 139); // Slate 500
                doc.text(`Phone: ${BUSINESS_PHONE}`, pageWidth / 2, yPos, { align: 'center' });
                
                yPos += 5;
                doc.text(BUSINESS_LOCATION, pageWidth / 2, yPos, { align: 'center' });
                
                yPos += 10;

                // 3. Divider Line
                doc.setDrawColor(22, 101, 52); // Dark green
                doc.setLineWidth(0.5);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                
                yPos += 15;

                // 4. Section Title: "Available Products"
                doc.setFontSize(16);
                doc.setTextColor(22, 101, 52); // Dark green
                doc.text("Available Products", margin, yPos);
                
                yPos += 10;

                // 5. Dynamic Product List
                doc.setFontSize(10);
                doc.setTextColor(30, 41, 59); // Slate 800
                
                noteItems.forEach((item, index) => {
                  // Check if we need a new page (though user said no second page, we should still be careful)
                  if (yPos > 270) return; 

                  doc.setFont('helvetica', 'bold');
                  doc.text(item.name.toUpperCase(), margin, yPos);
                  
                  const qtyText = item.qty ? `QTY: ${item.qty}` : "";
                  const priceText = item.price ? `$${item.price}` : "";
                  
                  doc.setFont('helvetica', 'normal');
                  doc.text(qtyText, pageWidth - margin - 40, yPos, { align: 'right' });
                  
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(22, 101, 52); // Dark green
                  doc.text(priceText, pageWidth - margin, yPos, { align: 'right' });
                  
                  yPos += 5;
                  
                  if (item.pref) {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184); // Slate 400
                    doc.text(item.pref.toUpperCase(), margin, yPos);
                    yPos += 4;
                  }
                  
                  // Separator line
                  doc.setDrawColor(241, 245, 249); // Light grey
                  doc.setLineWidth(0.1);
                  doc.line(margin, yPos, pageWidth - margin, yPos);
                  
                  yPos += 8;
                  doc.setFontSize(10);
                  doc.setTextColor(30, 41, 59);
                });

                // Footer
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(`© ${new Date().getFullYear()} ${BUSINESS_NAME}`, pageWidth / 2, 285, { align: 'center' });

                doc.save(`Proposal_${clientName.replace(/\s+/g, '_') || 'Unnamed'}.pdf`);
              }}
            />
          )}
          {view === 'products' && (
             <div className="p-4 space-y-4">
                <ViewHeader 
                  title="Inventory Master" 
                  onBack={() => setView('dashboard')} 
                  action={
                    <button 
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="bg-orange-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-900/20 active:scale-95 transition-all"
                    >
                      <PackagePlus size={16}/> New Product
                    </button>
                  }
                />
                
                <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center gap-2 shadow-sm mb-4">
                  <Search size={18} className="text-slate-400" />
                  <input placeholder="Search products or categories..." className="flex-1 outline-none text-sm font-bold text-slate-700" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr className="text-xs uppercase font-black text-slate-400">
                          <th className="px-6 py-4">Item Name</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4 text-right">Base Price</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 group">
                            <td className="px-6 py-4 font-bold uppercase">{p.name}</td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 rounded-full text-slate-500">{p.category}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">{formatCurrency(p.price)} <span className="text-[10px] text-slate-400">/ {p.unitType}</span></td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {filteredProducts.length === 0 && <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs italic">No items found</div>}
                </div>

                <AddProductModal 
                  isOpen={isAddProductModalOpen} 
                  onClose={() => setIsAddProductModalOpen(false)} 
                  onSave={handleAddProduct} 
                />
             </div>
          )}
          {view === 'invoices' && (
            <InvoiceList 
              invoices={invoices} 
              setInvoices={setInvoices} 
              onPrint={startPreviewProcess} 
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
              onAddProduct={handleAddProduct}
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
              onAddProduct={handleAddProduct}
            />
          )}

          <LivePreviewModal 
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewingInvoice(null);
        }}
        onPrint={executePrint}
        onDownload={handleDownloadPDF}
        invoice={previewingInvoice}
      />
        </main>
      </div>
    </div>
    </>
  );
};

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasAttribute('data-react-root')) {
  rootElement.setAttribute('data-react-root', 'true');
  const root = createRoot(rootElement);
  root.render(<App />);
}
