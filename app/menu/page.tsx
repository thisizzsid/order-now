"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { MENU_ITEMS } from "../../lib/data";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { formatPrice } from "../../lib/utils";
import { ShoppingBag, Plus, Minus, Check, Clock, Table, Trash2, Utensils, Navigation, MessageCircle, Phone, HelpCircle } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { OrderType, PaymentType } from "../../types";
import { motion, AnimatePresence } from "framer-motion";

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table");
  const { customer, isLoading } = useAuth();
  const { items, addToCart, removeFromCart, clearCart, totalAmount } = useCart();
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [upiId, setUpiId] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(tableNumber ? "dinein" : "takeaway");
  const [paymentType, setPaymentType] = useState<PaymentType>("upi");
  const [isOrdering, setIsOrdering] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showSupport, setShowSupport] = useState(false);
  const [showFullCheckout, setShowFullCheckout] = useState(false);

  useEffect(() => {
    if (!isLoading && !customer) router.push("/auth");
  }, [customer, isLoading, router]);

  useEffect(() => {
    // Sync Menu from DB
    const q = query(collection(db, "menu"), orderBy("category"));
    const unsubMenu = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMenuItems(data.length > 0 ? data : MENU_ITEMS);
    });

    // Sync UPI Settings
    const unsubSettings = onSnapshot(doc(db, "settings", "config"), (d) => {
      if (d.exists()) setUpiId(d.data().upiId || "");
    });

    return () => { unsubMenu(); unsubSettings(); };
  }, []);

  const categories = ["All", ...Array.from(new Set(menuItems.map(i => i.category)))];

  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(i => i.category === activeCategory);

  const handlePlaceOrder = async () => {
    if (items.length === 0 || !customer) return;
    
    setIsOrdering(true);
    try {
      const orderData = {
        customerId: customer.id,
        customerName: customer.name,
        customerMobile: customer.mobile,
        type: orderType,
        tableNumber: orderType === "dinein" ? (tableNumber || "General") : "N/A",
        items: items,
        totalAmount: totalAmount,
        taxAmount: totalAmount * 0.05, // 5% GST
        paymentType: paymentType,
        paymentStatus: "pending",
        orderStatus: "received",
        createdAt: serverTimestamp(),
        queuePosition: Math.floor(Math.random() * 5) + 1,
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      clearCart();
      router.push(`/track?id=${docRef.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center font-black text-orange-600 animate-pulse text-2xl">
        INITIALIZING SESSION...
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm sticky top-0 z-30 border-b border-orange-50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-black text-orange-900 leading-tight">Ministry Of Chai</h1>
            <p className="text-sm font-bold text-orange-600/60 uppercase tracking-widest">Premium Tea & Snacks</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Welcome</p>
            <p className="text-sm font-black text-gray-900">{customer.name.split(' ')[0]}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {tableNumber ? (
            <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider">
              <Table size={14} /> Table {tableNumber}
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider">
              <Clock size={14} /> Takeaway
            </span>
          )}
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Verified Device • Secure Ordering</span>
        </div>
      </header>

      {/* Category Scroll */}
      <div className="flex gap-3 overflow-x-auto px-6 py-8 no-scrollbar sticky top-35 bg-orange-50/80 backdrop-blur-md z-20">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-8 py-4 rounded-4xl font-black text-sm transition-all shadow-sm active:scale-95 ${
              activeCategory === cat 
                ? "bg-orange-600 text-white shadow-orange-200" 
                : "bg-white text-orange-900/40 hover:bg-orange-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-6 space-y-6">
        {filteredItems.map(item => {
          const cartItem = items.find(i => i.id === item.id);
          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id} 
              className="bg-white p-5 rounded-[2.5rem] shadow-sm flex items-center gap-5 border border-white hover:border-orange-100 active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="flex-1 relative z-10">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{item.category}</p>
                <h3 className="font-black text-gray-900 text-xl leading-tight mb-1">{item.name}</h3>
                <p className="text-gray-400 text-xs font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-3 mt-4">
                  <p className="text-orange-600 font-black text-2xl">{formatPrice(item.price)}</p>
                  <span className="text-[10px] font-bold text-gray-300 border border-gray-100 px-2 py-1 rounded-lg">Excl. GST</span>
                </div>
              </div>
              
              <div className="relative z-10">
                {cartItem ? (
                  <div className="flex flex-col items-center gap-2 bg-orange-50 p-2 rounded-4xl border border-orange-100 shadow-inner">
                    <button 
                      onClick={() => addToCart({ ...item, quantity: 1 })}
                      aria-label="Increase quantity"
                      className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      <Plus size={20} />
                    </button>
                    <span className="font-black text-orange-900 text-lg w-6 text-center">{cartItem.quantity}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Decrease quantity"
                      className="w-12 h-12 bg-white text-orange-600 rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-transform border border-orange-100"
                    >
                      <Minus size={20} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart({ ...item, quantity: 1 })}
                    aria-label="Add to cart"
                    className="w-16 h-16 bg-orange-600 text-white rounded-4xl flex items-center justify-center shadow-xl shadow-orange-200 active:scale-90 transition-all group"
                  >
                    <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                )}
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 blur-2xl z-0" />
            </motion.div>
          );
        })}
      </div>

      {/* Support FAB */}
      <div className="fixed bottom-32 right-6 z-40">
        <AnimatePresence>
          {showSupport && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-4 mb-4 border border-orange-100 w-64"
            >
              <div className="space-y-2">
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-2xl transition-colors">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">WhatsApp</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Quick Response</p>
                  </div>
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Voice Call</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Direct Support</p>
                  </div>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowSupport(!showSupport)}
          aria-label={showSupport ? "Close Support" : "Open Support"}
          className="w-16 h-16 bg-gray-900 text-white rounded-4xl flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        >
          {showSupport ? <Check size={28} /> : <HelpCircle size={28} />}
        </button>
      </div>

      {/* Slim Checkout Bar */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center"
          >
            <div className={`bg-gray-900 text-white rounded-[2rem] shadow-2xl border-t border-white/10 w-full max-w-lg overflow-hidden transition-all duration-300 ${showFullCheckout ? 'p-8' : 'p-3 flex items-center justify-between'}`}>
              {!showFullCheckout ? (
                /* Slim Mode */
                <>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="relative">
                      <ShoppingBag size={24} className="text-orange-500" />
                      <span className="absolute -top-2 -right-2 bg-white text-gray-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {items.reduce((sum, i) => sum + i.quantity, 0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total</p>
                      <p className="text-lg font-black">{formatPrice(totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={clearCart}
                      aria-label="Clear cart"
                      className="p-3 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => setShowFullCheckout(true)}
                      className="bg-orange-600 text-white px-8 py-4 rounded-3xl font-black text-sm shadow-xl active:scale-95 transition-all"
                    >
                      CHECKOUT
                    </button>
                  </div>
                </>
              ) : (
                /* Full Mode */
                <div className="w-full">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Confirm Order</p>
                      <p className="text-3xl font-black">{formatPrice(totalAmount)}</p>
                      <p className="text-[10px] text-orange-500 font-bold mt-1 tracking-wider uppercase">+ {formatPrice(totalAmount * 0.05)} GST Applied</p>
                    </div>
                    <button 
                      onClick={() => setShowFullCheckout(false)}
                      className="bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      CLOSE
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button 
                      onClick={() => setOrderType("dinein")}
                      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-3xl font-black text-xs transition-all border-2 ${
                        orderType === "dinein" ? "border-orange-600 bg-orange-600/10 text-orange-500" : "border-white/10 text-gray-500"
                      }`}
                    >
                      <Utensils size={24} /> DINE-IN
                    </button>
                    <button 
                      onClick={() => setOrderType("takeaway")}
                      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-3xl font-black text-xs transition-all border-2 ${
                        orderType === "takeaway" ? "border-orange-600 bg-orange-600/10 text-orange-500" : "border-white/10 text-gray-500"
                      }`}
                    >
                      <Navigation size={24} /> TAKEAWAY
                    </button>
                  </div>

                  {/* Payment Type */}
                  <div className="flex gap-3 mb-8">
                    <button 
                      onClick={() => setPaymentType("upi")}
                      className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                        paymentType === "upi" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {upiId ? `PAY VIA UPI` : "PAY NOW (UPI)"}
                    </button>
                    <button 
                      onClick={() => setPaymentType("counter")}
                      className={`flex-1 py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
                        paymentType === "counter" ? "bg-white text-gray-900" : "bg-white/5 text-gray-500"
                      }`}
                    >
                      PAY AT COUNTER
                    </button>
                  </div>

                  {paymentType === "upi" && upiId && (
                    <div className="mb-8 p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20 text-center">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-center">Scan or Pay to UPI</p>
                      <p className="font-black text-blue-500 text-lg">{upiId}</p>
                      <a 
                        href={`upi://pay?pa=${upiId}&pn=MinistryOfChai&am=${(totalAmount * 1.05).toFixed(2)}&cu=INR`}
                        className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black"
                      >
                        OPEN UPI APP
                      </a>
                    </div>
                  )}

                  <button 
                    disabled={isOrdering}
                    onClick={handlePlaceOrder}
                    className="w-full bg-orange-600 text-white py-6 rounded-4xl font-black text-xl shadow-2xl shadow-orange-600/20 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isOrdering ? (
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>CONFIRM ORDER <ShoppingBag size={24} /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-orange-50 flex items-center justify-center font-black text-orange-600 animate-pulse text-2xl">LOADING MENU...</div>}>
      <MenuContent />
    </Suspense>
  );
}
