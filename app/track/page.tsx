"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Order } from "../../types/models";
import { formatPrice } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BellRing, CheckCircle, Receipt, ArrowLeft, Loader2, MapPin, Smartphone, Clock, ChefHat, CheckCircle2, ShoppingBag } from "lucide-react";

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10); 
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      router.push("/menu");
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Order;
        setOrder({ id: doc.id, ...data } as Order);
        
        // Ping System: Notify when order is ready or delivered
        if ((data.orderStatus === 'ready' || data.orderStatus === 'delivered') && !hasNotified) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Ministry Of Chai", {
              body: `Your order #${orderId.slice(-6).toUpperCase()} is ${data.orderStatus}!`,
              icon: "/next.svg"
            });
          }
          // Also play a subtle sound or trigger vibration if supported
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
          setHasNotified(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId, router, hasNotified]);

  useEffect(() => {
    if (!order) return;
    
    // Simple mock countdown logic based on order status
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (order.orderStatus === 'delivered') return 0;
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [order]);

  const generateReceipt = () => {
    if (!order) return;

    const doc = new jsPDF({
      unit: "mm",
      format: [80, 200], // Thermal printer width
    });

    // Styles
    doc.setFontSize(12);
    doc.text("MINISTRY OF CHAI", 40, 10, { align: "center" });
    doc.setFontSize(8);
    doc.text("Old Rajendra Nagar, 110060 (New Delhi)", 40, 15, { align: "center" });
    doc.text("Premium Tea & Snacks", 40, 18, { align: "center" });
    
    doc.line(5, 22, 75, 22);
    
    doc.text(`Order: #${order.id?.slice(-6).toUpperCase()}`, 5, 28);
    doc.text(`Date: ${new Date().toLocaleString()}`, 5, 32);
    doc.text(`Customer: ${order.customerName}`, 5, 36);
    doc.text(`Mobile: ${order.customerMobile}`, 5, 40);
    
    autoTable(doc, {
      startY: 45,
      margin: { left: 5, right: 5 },
      styles: { fontSize: 7, cellPadding: 1 },
      head: [['Item', 'Qty', 'Price']],
      body: order.items.map(i => [i.name, i.quantity, (i.price * i.quantity).toFixed(2)]),
      theme: 'plain',
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;
    doc.text(`Subtotal: ${formatPrice(order.totalAmount)}`, 75, finalY, { align: "right" });
    doc.text(`Tax (5%): ${formatPrice(order.taxAmount)}`, 75, finalY + 4, { align: "right" });
    doc.setFontSize(10);
    doc.text(`TOTAL: ${formatPrice(order.totalAmount + order.taxAmount)}`, 75, finalY + 10, { align: "right" });
    
    doc.setFontSize(8);
    doc.text("Thank you for your order!", 40, finalY + 20, { align: "center" });
    
    doc.save(`receipt-${order.id}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
      <p className="font-black text-orange-900 tracking-widest uppercase">Fetching Order Details...</p>
    </div>
  );

  if (!order) return null;

  const steps = [
    { label: "Order Received", icon: ShoppingBag, status: "received", time: "0-2m" },
    { label: "Food Making", icon: ChefHat, status: "preparing", time: "2-8m" },
    { label: "Getting Ready", icon: Clock, status: "ready", time: "8-10m" },
    { label: "Ready for Pickup", icon: CheckCircle2, status: "delivered", time: "Completed" },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      {/* Alert Banner for Ready Status */}
      <AnimatePresence>
        {(order.orderStatus === 'ready' || order.orderStatus === 'delivered') && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 text-center font-black flex items-center justify-center gap-3 shadow-2xl"
          >
            <BellRing className="animate-bounce" />
            YOUR ORDER IS READY FOR PICKUP!
            <button 
              onClick={() => setHasNotified(true)}
              className="bg-white text-green-600 px-4 py-1 rounded-full text-xs"
            >
              DISMISS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm mb-8">
        <button 
          onClick={() => router.push("/menu")}
          className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-6"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Track Order</h1>
            <p className="text-sm font-bold text-orange-600">ID: #{order.id?.slice(-6).toUpperCase()}</p>
          </div>
          <button 
            onClick={generateReceipt}
            aria-label="Download Receipt"
            className="bg-orange-600 text-white p-4 rounded-3xl shadow-xl shadow-orange-200 active:scale-95 transition-all"
          >
            <Receipt size={24} />
          </button>
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Status Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-100 text-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Estimated Waiting Time</p>
            <h2 className="text-6xl font-black text-gray-900 mb-2">{timeLeft} <span className="text-2xl text-orange-600">MIN</span></h2>
            <p className="text-sm font-bold text-gray-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              Queue Position: #{order.queuePosition}
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clock size={120} strokeWidth={3} />
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-100">
          <h3 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-xs">Live Progress</h3>
          <div className="space-y-10 relative">
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-50 z-0" />
            
            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={idx} className={`flex items-start gap-6 relative z-10 transition-all ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    isActive ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'scale-125 ring-8 ring-orange-50' : ''}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-black text-lg leading-tight ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{step.time}</p>
                  </div>
                  {isCurrent && (
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Active</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 flex items-center gap-6">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500">
            <MapPin size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pickup Location</p>
            <p className="font-black text-lg leading-tight">Ministry Of Chai - ORN</p>
            <p className="text-xs font-medium text-gray-400">Old Rajendra Nagar, 110060 (New Delhi)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div>Loading Tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
