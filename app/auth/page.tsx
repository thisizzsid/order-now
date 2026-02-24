"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { motion } from "framer-motion";
import { User, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  const { customer, login, isLoading: isAuthLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && customer && !isSuccess) router.push("/menu");
  }, [customer, isAuthLoading, router, isSuccess]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }
    
    if (formData.phone.length < 10) {
      newErrors.phone = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const customerData = {
        name: formData.name,
        mobile: formData.phone,
        verified: true,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "customers"), customerData);
      
      login({
        id: docRef.id,
        ...customerData,
        createdAt: new Date(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/menu");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ global: "Failed to connect to the database. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-orange-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-500 font-bold mb-6">Let's get you some chai.</p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5 }}
              className="bg-green-500 h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col p-6 items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-10 border border-orange-100 relative">
        
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-xl shadow-orange-200 overflow-hidden p-2">
            <img src="/moclogo.png" alt="Ministry Of Chai Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Ministry Of Chai</h1>
          <p className="text-gray-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Quick Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.global && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600"
            >
              <AlertCircle className="shrink-0" size={20} />
              <p className="text-sm font-bold">{errors.global}</p>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-red-400' : 'text-gray-300'}`} />
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-gray-900 font-bold focus:ring-0 transition-all ${
                    errors.name ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-orange-600'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter ml-1">{errors.name}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
              <div className="relative auth-phone-input">
                <PhoneInput
                  country={'in'}
                  value={formData.phone}
                  onChange={(val) => handleInputChange("phone", val)}
                  containerClass={`!w-full !rounded-2xl !bg-gray-50 !border-2 transition-all ${errors.phone ? '!border-red-100 !bg-red-50/30' : '!border-transparent'}`}
                  inputClass="!w-full !h-[56px] !rounded-2xl !bg-transparent !border-none !pl-14 !text-gray-900 !font-bold !text-base"
                  buttonClass="!bg-transparent !border-none !rounded-l-2xl !pl-4"
                />
              </div>
              {errors.phone && <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter ml-1">{errors.phone}</p>}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 text-white py-6 rounded-4xl font-black text-lg shadow-2xl shadow-orange-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>START ORDERING <ArrowRight size={24} /></>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-gray-400 leading-relaxed uppercase tracking-[0.2em] font-black">
          Quick • Secure • Real-time
        </p>
      </div>
    </div>
  );
}
