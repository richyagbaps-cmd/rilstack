"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  ChevronRight, 
  Phone, 
  MessageSquare, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Paperclip
} from "lucide-react";

/**
 * Brand constants for rilstack
 */
const BRAND_COLORS = {
  primary: "#1A5F7A", // Deep Teal
  secondary: "#F4A261", // Muted Orange
  accent: "#2E7D32", // Success Green
  background: "#F8F9FA",
  textMain: "#1A1A1A",
  textMuted: "#4A5B6E",
};

const SUPPORT_PHONE = "08116883025";
const FAQ_TOPICS = [
  { q: "How do I set up a budget?", a: "Go to Budgets, tap +, and follow the guided steps." },
  { q: "What is a Safe Lock?", a: "A Safe Lock is a savings feature that locks funds for a set period to earn higher interest." },
  { q: "How do I invest?", a: "Navigate to Investments, select a product, and follow the purchase flow." },
  { q: "Are there any fees?", a: "See the Fees section in Settings for a full breakdown for all accounts." },
  { q: "How to reset my PIN?", a: "You can reset your security PIN in the Security section of your Profile settings." },
  { q: "Is my data secure?", a: "Yes, we use industry-standard bank-level encryption (AES-256) to protect all your data." },
];
const SUBJECTS = ["Technical issue", "Billing", "Investment", "Account", "Other"];

// --- Components ---

function HelpCenter() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => 
    FAQ_TOPICS.filter(t => 
      t.q.toLowerCase().includes(search.toLowerCase()) || 
      t.a.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse" aria-hidden="true">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A5F7A] transition-colors" size={18} />
        <input
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] transition-all"
          placeholder="Search help topics..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search frequently asked questions"
        />
      </div>
      
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((t, i) => (
            <details 
              key={i} 
              className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none focus:outline-none focus:bg-gray-50 focus:ring-inset focus:ring-2 focus:ring-[#1A5F7A]/10">
                <span className="font-medium text-[#1A5F7A]">{t.q}</span>
                <ChevronRight className="text-gray-400 group-open:rotate-90 transition-transform" size={18} />
              </summary>
              <div className="px-4 pb-4 text-[#4A5B6E] text-sm leading-relaxed border-t border-gray-50 pt-3">
                {t.a}
              </div>
            </details>
          ))
        ) : (
          <div className="text-center py-12 flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <HelpCircle className="text-gray-300" size={32} />
            </div>
            <p className="text-[#4A5B6E]">No results matching "{search}"</p>
            <button 
              onClick={() => setSearch("")} 
              className="text-[#1A5F7A] text-sm font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    subject: SUBJECTS[0],
    message: "",
    priority: "Normal",
    highReason: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (formData.priority === "High" && !formData.highReason.trim()) {
      setError("Please provide a reason for high priority.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    
    await new Promise(r => setTimeout(r, 1500));
    onSubmit({ ...formData, file });
    setIsSubmitting(false);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="subject" className="text-sm font-semibold text-[#1A5F7A]">Subject</label>
        <select 
          id="subject"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] transition-all outline-none appearance-none"
          value={formData.subject} 
          onChange={e => setFormData({...formData, subject: e.target.value})}
        >
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-[#1A5F7A]">Message</label>
        <textarea 
          id="message"
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] transition-all outline-none min-h-[120px]" 
          placeholder="How can we help you today?"
          value={formData.message} 
          onChange={e => setFormData({...formData, message: e.target.value})} 
          required 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="priority" className="text-sm font-semibold text-[#1A5F7A]">Priority</label>
          <select 
            id="priority"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] transition-all outline-none"
            value={formData.priority} 
            onChange={e => setFormData({...formData, priority: e.target.value})}
          >
            <option>Normal</option>
            <option>High</option>
          </select>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#1A5F7A]">Attachment</label>
          <div className="relative">
             <input 
              type="file" 
              className="hidden" 
              id="file-upload" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
            />
            <label 
              htmlFor="file-upload" 
              className="flex items-center justify-center gap-2 w-full bg-white border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Paperclip size={16} className="text-gray-400" />
              <span className="text-xs text-gray-500 truncate">{file ? "File chosen" : "Choose file"}</span>
            </label>
          </div>
        </div>
      </div>

      {formData.priority === "High" && (
        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <label htmlFor="highReason" className="text-sm font-semibold text-[#1A5F7A]">Reason for High Priority</label>
          <input 
            id="highReason"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] transition-all outline-none" 
            placeholder="e.g. Card lost, Unauthorized transaction"
            value={formData.highReason} 
            onChange={e => setFormData({...formData, highReason: e.target.value})} 
            required 
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">
          <AlertCircle size={16} />
          {error}
        </div>
      )}      
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-[#1A5F7A] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1A5F7A]/20 hover:bg-[#154a60] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Creating Ticket...
          </>
        ) : (
          <>
            <Send size={20} />
            Submit Request
          </>
        )}
      </button>
    </form>
  );
}

function CallSupport() {
  return (
    <div className="py-8 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-[#F4A261]/10 rounded-full flex items-center justify-center text-[#F4A261]">
        <Phone size={40} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#1A5F7A]">Call our helpline</h3>
        <p className="text-[#4A5B6E] mt-2 max-w-[250px]">Available 24/7 for emergency account issues and general support.</p>
      </div>
      <a 
        href={`tel:${SUPPORT_PHONE}`} 
        className="group relative inline-flex flex-col items-center bg-white border-2 border-[#F4A261] rounded-2xl px-8 py-5 transition-all hover:bg-[#F4A261] hover:shadow-xl hover:shadow-[#F4A261]/20"
      >
        <span className="text-[#F4A261] group-hover:text-white font-mono text-2xl font-bold">{SUPPORT_PHONE}</span>
        <span className="text-xs text-[#F4A261] group-hover:text-white uppercase tracking-widest mt-1">Tap to call</span>
      </a>
      <div className="text-sm text-gray-400">Average wait time: &lt; 2 mins</div>
    </div>
  );
}

export default function ContactSupportPage() {
  const [tab, setTab] = useState("faq");
  const [submitted, setSubmitted] = useState(false);
  const [ticketDetails, setTicketDetails] = useState({ id: "", sla: "" });

    const handleFormSubmit = (data: any) => {
    const id = "TKT-" + Math.floor(100000 + Math.random() * 900000);
    setTicketDetails({
      id,
      sla: data.priority === "High" ? "4 hours" : "24 hours"
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="relative pt-4">
          <div className="absolute top-0 left-4 right-4 h-full bg-[#1A5F7A]/5 rounded-3xl -z-10 transform -rotate-1" />
          
          <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.03] p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-[#1A5F7A]" />
              </button>
              <h1 className="text-2xl font-black text-[#1A5F7A] tracking-tight">Contact Support</h1>
            </div>

            {!submitted ? (
              <>
                <div 
                  className="flex bg-gray-50 p-1.5 rounded-2xl mb-8" 
                  role="tablist"
                  aria-label="Support options"
                >
                  {[
                    { id: "faq", label: "FAQ", icon: HelpCircle },
                    { id: "form", label: "Form", icon: MessageSquare },
                    { id: "call", label: "Call", icon: Phone }
                  ].map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        tab === t.id 
                          ? "bg-white text-[#1A5F7A] shadow-md ring-1 ring-black/5" 
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                      }`}
                      onClick={() => setTab(t.id)}
                    >
                      <t.icon size={16} />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  ))}
                </div>

                <div className="min-h-[300px] transition-all duration-500 ease-out">
                  {tab === "faq" && <HelpCenter />}
                  {tab === "form" && <ContactForm onSubmit={handleFormSubmit} />}
                  {tab === "call" && <CallSupport />}
                </div>
              </>
            ) : (
              <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={44} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#1A5F7A]">Request Received!</h2>
                  <p className="text-[#4A5B6E] mt-2">We've logged your support ticket and our team is already on it.</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Ticket ID</span>
                    <span className="font-mono font-bold text-[#1A5F7A]">{ticketDetails.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 uppercase tracking-wider font-bold">Priority Status</span>
                    <span className="text-sm px-3 py-1 bg-[#F4A261]/10 text-[#F4A261] rounded-full font-bold uppercase">Processing</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3 mt-3">
                    <span className="text-sm font-medium text-gray-500">Expected Response</span>
                    <span className="font-bold text-[#2E7D32]">within {ticketDetails.sla}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSubmitted(false)} 
                  className="w-full py-4 text-[#1A5F7A] font-bold text-sm hover:underline"
                >
                  Need to send another request?
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 px-4 leading-relaxed">
          Your security is our priority. Support staff will never ask for your PIN, password, or security codes over the phone or email.
        </p>
      </div>
    </div>
  );
}
