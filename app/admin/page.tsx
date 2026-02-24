"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where, limit, addDoc, deleteDoc, setDoc, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Order } from "../../types/models";
import { formatPrice } from "../../lib/utils";
import { 
  Bell, 
  ChefHat, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  Search, 
  LayoutGrid, 
  List, 
  Settings, 
  MoreVertical,
  Table as TableIcon,
  Phone,
  User,
  Calendar,
  IndianRupee,
  Activity,
  ArrowUpRight,
  Loader2,
  Lock,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, X, Check, Save } from "lucide-react";

export default function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'live' | 'completed' | 'cancelled' | 'menu' | 'settings'>('live');

  // Menu Management State
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newItem, setNewItem] = useState({ name: "", description: "", price: 0, category: "Chai Specials" });
  
  // Settings State
  const [upiId, setUpiId] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    // Check session storage for existing auth
    const isAuth = sessionStorage.getItem("moc_admin_auth") === "true";
    if (isAuth) setIsAdminAuthenticated(true);

    // Automatic Cleanup of Old Orders (24 Hours)
    const cleanupOldOrders = async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      console.log("Running Cleanup: Finding orders older than", twentyFourHoursAgo);
      
      const q = query(
        collection(db, "orders"), 
        where("createdAt", "<", twentyFourHoursAgo)
      );
      
      try {
        const snapshot = await getDocs(q);
        if (snapshot.docs.length > 0) {
          console.log(`Found ${snapshot.docs.length} old orders. Deleting...`);
          const deletePromises = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => deleteDoc(d.ref));
          await Promise.all(deletePromises);
          console.log("Cleanup complete!");
        }
      } catch (e) {
        console.error("Cleanup Error:", e);
      }
    };

    if (isAuth) {
      cleanupOldOrders();
    }

    // Orders listener
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });

    // Menu listener
    const menuQ = query(collection(db, "menu"), orderBy("category"));
    const unsubscribeMenu = onSnapshot(menuQ, (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMenuItems(menuData);
    });

    // Settings listener
    const settingsUnsub = onSnapshot(doc(db, "settings", "config"), (doc) => {
      if (doc.exists()) {
        setUpiId(doc.data().upiId || "");
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMenu();
      settingsUnsub();
    };
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "Password@321") {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("moc_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Access denied.");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || newItem.price <= 0) return;
    try {
      await addDoc(collection(db, "menu"), newItem);
      setIsAddingItem(false);
      setNewItem({ name: "", description: "", price: 0, category: "Chai Specials" });
      alert("Item added successfully!");
    } catch (e) { console.error(e); }
  };

  const handleEditItem = async () => {
    if (!editingItem || !editingItem.name || editingItem.price <= 0) return;
    try {
      await updateDoc(doc(db, "menu", editingItem.id), {
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        category: editingItem.category
      });
      setEditingItem(null);
      alert("Item updated successfully!");
    } catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "menu", itemId));
    } catch (e) {
      console.error("Error deleting item:", e);
      alert("Failed to delete item.");
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "config"), { upiId }, { merge: true });
      alert("Settings saved successfully!");
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Failed to save settings.");
    }
    setIsSavingSettings(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { orderStatus: status });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { paymentStatus: status });
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'live') return matchesSearch && !['delivered', 'cancelled'].includes(o.orderStatus);
    if (activeTab === 'completed') return matchesSearch && o.orderStatus === 'delivered';
    return matchesSearch && o.orderStatus === 'cancelled';
  });

  const stats = {
    revenue: orders.reduce((sum, o) => {
      // Daily Reset: Only count revenue for orders created today
      // Check for both Firestore Timestamp and JS Date
      const orderDate = o.createdAt && typeof (o.createdAt as any).toDate === 'function' 
        ? (o.createdAt as any).toDate() 
        : (o.createdAt as any) instanceof Date ? o.createdAt : new Date();
        
      const isToday = orderDate.toDateString() === new Date().toDateString();
      
      return sum + (o.orderStatus === 'delivered' && isToday ? o.totalAmount : 0);
    }, 0),
    activeCount: orders.filter(o => !['delivered', 'cancelled'].includes(o.orderStatus)).length,
    completedToday: orders.filter(o => {
      const orderDate = o.createdAt && typeof (o.createdAt as any).toDate === 'function' 
        ? (o.createdAt as any).toDate() 
        : (o.createdAt as any) instanceof Date ? o.createdAt : new Date();
      return o.orderStatus === 'delivered' && orderDate.toDateString() === new Date().toDateString();
    }).length,
    averageWait: 12 // Mock stat
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-6" />
      <p className="font-black text-gray-900 tracking-widest uppercase text-xl">Loading Admin Command Center...</p>
    </div>
  );

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-6 shadow-xl shadow-orange-600/20">
            <Lock className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">Admin Access</h1>
          <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-[10px]">Restricted Terminal 01</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
              <input 
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-600 rounded-2xl py-4 px-6 text-gray-900 font-black tracking-widest transition-all outline-none"
              />
            </div>

            {authError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border border-red-100 animate-shake">
                <AlertCircle size={18} /> {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              INITIALIZE ACCESS <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-gray-900 flex-col h-screen sticky top-0 p-8">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-black text-white leading-tight tracking-tight">Ministry Of Chai</h1>
          </div>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Admin Command Center</p>
        </div>

        <nav className="space-y-4 flex-1">
          <button 
            onClick={() => setActiveTab('live')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'live' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <Activity size={20} /> LIVE ORDERS
            <span className={`ml-auto px-2 py-1 rounded-lg text-[10px] font-black ${
              activeTab === 'live' ? 'bg-white/20 text-white' : 'bg-orange-600/10 text-orange-600'
            }`}>{stats.activeCount}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('completed')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'completed' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <CheckCircle2 size={20} /> COMPLETED
          </button>

          <button 
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'menu' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <List size={20} /> MENU MGMT
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
              activeTab === 'settings' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-gray-400 hover:bg-white/5'
            }`}
          >
            <Settings size={20} /> SETTINGS
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">System Status</p>
            <div className="flex items-center gap-2 text-green-500 font-black text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              99.9% UPTIME • ONLINE
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-gray-800 rounded-xl border border-white/10" />
            <div className="flex-1">
              <p className="text-sm font-black text-white">Super Admin</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Main Terminal 01</p>
            </div>
            <button 
              onClick={() => {
                sessionStorage.removeItem("moc_admin_auth");
                setIsAdminAuthenticated(false);
              }}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Logout"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-400 mx-auto">
          {/* Header & Stats */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                {activeTab === 'live' ? 'Active Orders Queue' : 'Order History'}
              </h2>
              <p className="text-gray-400 font-bold text-sm flex items-center gap-2">
                <Calendar size={16} /> {format(new Date(), 'EEEE, MMMM do yyyy')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-45">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Revenue</p>
                <p className="text-2xl font-black text-gray-900 flex items-center gap-1">
                  <IndianRupee size={20} className="text-orange-600" /> {stats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-45">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Active Now</p>
                <p className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Activity size={20} className="text-orange-600" /> {stats.activeCount}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-w-45">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Avg. Wait Time</p>
                <p className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-orange-600" /> {stats.averageWait} <span className="text-sm text-gray-400">MIN</span>
                </p>
              </div>
              <div className="bg-orange-600 p-6 rounded-3xl shadow-xl shadow-orange-600/20 min-w-45 text-white">
                <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Peak Status</p>
                <p className="text-2xl font-black flex items-center gap-2 uppercase">
                  Normal <ArrowUpRight size={20} />
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search orders by customer name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-black text-gray-900 focus:ring-2 focus:ring-orange-600"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl">
              <button 
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                aria-label="List View"
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Order Grid / Menu Mgmt / Settings */}
          {activeTab === 'menu' ? (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Manage Menu</h3>
                <button 
                  onClick={() => setIsAddingItem(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2"
                >
                  <Plus size={18} /> ADD NEW ITEM
                </button>
              </div>

              {isAddingItem && (
                <div className="bg-gray-50 p-8 rounded-3xl mb-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                      <input 
                        placeholder="e.g. Ginger Chai" 
                        className="w-full p-4 rounded-xl border-none font-bold bg-white shadow-sm"
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input 
                          placeholder="0.00" 
                          type="number"
                          className="w-full p-4 pl-10 rounded-xl border-none font-bold bg-white shadow-sm"
                          value={newItem.price || ''}
                          onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        aria-label="Item Category"
                        className="w-full p-4 rounded-xl border-none font-bold bg-white shadow-sm"
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                      >
                        <option>Chai Specials</option>
                        <option>Snacks</option>
                        <option>Wraps & Rolls</option>
                        <option>Beverages</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                      <input 
                        placeholder="e.g. Traditional ginger infused tea" 
                        className="w-full p-4 rounded-xl border-none font-bold bg-white shadow-sm"
                        value={newItem.description}
                        onChange={e => setNewItem({...newItem, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleAddItem} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-green-600/20 active:scale-95 transition-all"><Check size={18}/> SAVE PRODUCT</button>
                    <button onClick={() => setIsAddingItem(false)} className="bg-white text-gray-400 px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 border border-gray-100 active:scale-95 transition-all"><X size={18}/> CANCEL</button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {menuItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    {editingItem?.id === item.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                        <input 
                          placeholder="Item Name"
                          aria-label="Item Name"
                          className="p-2 rounded-lg border font-bold"
                          value={editingItem.name}
                          onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                        />
                        <input 
                          placeholder="Price"
                          aria-label="Price"
                          type="number"
                          className="p-2 rounded-lg border font-bold"
                          value={editingItem.price}
                          onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})}
                        />
                        <select 
                          aria-label="Item Category"
                          className="p-2 rounded-lg border font-bold"
                          value={editingItem.category}
                          onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                        >
                          <option>Chai Specials</option>
                          <option>Snacks</option>
                          <option>Wraps & Rolls</option>
                          <option>Beverages</option>
                        </select>
                        <input 
                          placeholder="Description"
                          aria-label="Description"
                          className="p-2 rounded-lg border font-bold"
                          value={editingItem.description}
                          onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleEditItem} className="bg-green-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase">Save</button>
                          <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{item.category}</p>
                          <p className="font-black text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-black text-gray-900">{formatPrice(item.price)}</p>
                          <button 
                            onClick={() => setEditingItem(item)}
                            className="text-gray-300 hover:text-blue-500 transition-colors"
                            aria-label="Edit Item"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            aria-label="Delete Item"
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 max-w-2xl">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Restaurant Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPI ID for Payments</label>
                  <div className="flex gap-2 mt-2">
                    <input 
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="flex-1 bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-900"
                    />
                    <button 
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="bg-orange-600 text-white px-8 rounded-2xl font-black text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingSettings ? <Loader2 className="animate-spin" /> : <Save size={18} />} SAVE
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 ml-1">Customers will use this UPI ID to pay via "Pay Now" option.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-orange-600/5 transition-all duration-500 ${
                    viewMode === 'list' ? 'flex-row items-center p-6' : ''
                  }`}
                >
                  {/* Header */}
                  <div className={`p-8 border-b border-gray-50 ${viewMode === 'list' ? 'border-none w-1/4' : ''}`}>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          {order.type === 'dinein' ? (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2">
                              <TableIcon size={14} /> T-{order.tableNumber}
                            </span>
                          ) : (
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2">
                              <ShoppingBag size={14} /> TAKEAWAY
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-black">#{order.id?.slice(-6).toUpperCase()}</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                          <User size={20} className="text-gray-300" /> {order.customerName}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-2">
                          <Phone size={14} /> +{order.customerMobile}
                        </p>
                      </div>
                      <button 
                        aria-label="Order Options"
                        className="text-gray-300 hover:text-gray-600 p-2"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-400 font-black text-[10px] uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock size={14} /> {order.createdAt ? format(order.createdAt.toDate(), 'hh:mm a') : 'Now'}</span>
                      <span className="text-orange-600">{formatPrice(order.totalAmount + (order.taxAmount || 0))}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className={`p-8 bg-gray-50/50 flex-1 ${viewMode === 'list' ? 'bg-transparent w-2/4' : ''}`}>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">Ordered Items ({order.items.length})</p>
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group/item">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs font-black text-orange-600 shadow-sm group-hover/item:scale-110 transition-transform">
                              {item.quantity}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-black text-gray-800 text-sm tracking-tight">{item.name}</span>
                              {item.variantName && (
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{item.variantName}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-black text-gray-400">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`p-8 bg-white border-t border-gray-50 flex flex-col gap-4 ${viewMode === 'list' ? 'border-none w-1/4' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Payment</span>
                        <span className={`text-xs font-black uppercase tracking-tighter ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {order.paymentType} • {order.paymentStatus}
                        </span>
                      </div>
                      {order.paymentStatus !== 'paid' && (
                        <button 
                          onClick={() => updatePaymentStatus(order.id!, 'paid')}
                          className="text-[10px] font-black bg-blue-600 text-white px-3 py-2 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                          MARK PAID
                        </button>
                      )}
                    </div>

                    {order.orderStatus === 'received' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id!, 'preparing')}
                        className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xs tracking-widest shadow-2xl shadow-orange-600/20 hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <ChefHat size={18} /> START PREPARING
                      </button>
                    )}
                    {order.orderStatus === 'preparing' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id!, 'ready')}
                        className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xs tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <Bell size={18} /> MARK AS READY
                      </button>
                    )}
                    {order.orderStatus === 'ready' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id!, 'delivered')}
                        className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-xs tracking-widest shadow-2xl shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 size={18} /> MARK DELIVERED
                      </button>
                    )}
                    {['delivered', 'cancelled'].includes(order.orderStatus) && (
                      <div className="w-full bg-gray-100 text-gray-400 py-5 rounded-3xl font-black text-xs tracking-widest text-center uppercase">
                        Order {order.orderStatus}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-gray-300">
                  <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mb-8 opacity-50">
                    <Activity size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">No Active Transmissions</h3>
                  <p className="text-gray-400 font-bold">The frequency is clear. New orders will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
