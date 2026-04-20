"use client";
import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Plus
} from "lucide-react";
import Link from "next/link";

const INITIAL_TICKETS = [
  { 
    id: "TKT-123456", 
    subject: "Technical issue", 
    status: "Open", 
    created: "2026-04-10", 
    priority: "Normal", 
    messages: [
      { from: "user", text: "App crashes on login after the last update.", date: "2026-04-10 10:30 AM" },        
      { from: "support", text: "We are investigating your issue. Could you tell us your device model?", date: "2026-04-11 09:15 AM" },
    ]
  },
  { 
    id: "TKT-654321", 
    subject: "Billing", 
    status: "Resolved", 
    created: "2026-03-28", 
    priority: "High", 
    messages: [
      { from: "user", text: "Charged twice for the premium savings plan.", date: "2026-03-28 02:45 PM" },   
      { from: "support", text: "Refund processed. You should see it in 3-5 business days.", date: "2026-03-29 11:00 AM" },
    ]
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Open: "bg-blue-50 text-blue-600 border-blue-100",
    Resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {status}
    </span>
  );
}

function TicketDetail({ ticket, onBack, onComment }: { ticket: any, onBack: () => void, onComment: (id: string, text: string) => void }) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(ticket.id, comment);
      setComment("");
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#1A5F7A] hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={16} />
          Back to list
        </button>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-black text-[#1A5F7A]">{ticket.subject}</h2>
        <p className="text-xs text-[#4A5B6E] font-medium uppercase tracking-widest">Ticket #{ticket.id}  Created {ticket.created}</p>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        {ticket.messages.map((m: any, i: number) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              m.from === "user" 
                ? "bg-[#1A5F7A] text-white shadow-lg shadow-[#1A5F7A]/10 rounded-tr-none" 
                : "bg-white border border-gray-100 text-[#1A1A1A] shadow-sm rounded-tl-none"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {m.from === "user" ? <User size={12} /> : <ShieldCheck size={12} className="text-[#F4A261]" />}
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                  {m.from === "user" ? "You" : "Support Agent"}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{m.text}</p>
              <div className={`text-[9px] mt-2 font-medium ${m.from === "user" ? "text-white/60" : "text-gray-400"}`}>
                {m.date}
              </div>
            </div>
          </div>
        ))}
      </div>

      {ticket.status === "Open" && (
        <form onSubmit={handleSubmit} className="relative pt-4">
          <textarea
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 pb-12 focus:outline-none focus:ring-2 focus:ring-[#1A5F7A]/20 focus:border-[#1A5F7A] transition-all resize-none min-h-[100px] text-sm"
            placeholder="Type your message here..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!comment.trim()}
            className="absolute bottom-4 right-4 bg-[#1A5F7A] text-white p-2.5 rounded-xl shadow-lg hover:bg-[#154a60] transition-colors disabled:opacity-50 disabled:grayscale"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

export default function MySupportTickets() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || t.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  const handleComment = (id: string, text: string) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, messages: [...t.messages, { from: "user", text, date: formattedDate }] } 
        : t
    ));
  };

  const selectedTicket = tickets.find(t => t.id === selectedId);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="relative pt-4">
          <div className="absolute top-0 left-4 right-4 h-full bg-[#1A5F7A]/5 rounded-3xl -z-10 transform rotate-1" />
          
          <div className="bg-white rounded-3xl shadow-xl shadow-black/[0.03] p-6 sm:p-8">
            {selectedId && selectedTicket ? (
              <TicketDetail 
                ticket={selectedTicket} 
                onBack={() => setSelectedId(null)} 
                onComment={handleComment} 
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-black text-[#1A5F7A] tracking-tight">Support Tickets</h1>
                  <Link 
                    href="/contact-support"
                    className="p-2 bg-[#F4A261]/10 text-[#F4A261] rounded-full hover:bg-[#F4A261]/20 transition-colors"
                    title="New Ticket"
                  >
                    <Plus size={20} />
                  </Link>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1A5F7A] transition-colors" size={16} />
                    <input
                      className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A5F7A]/10 transition-all"
                      placeholder="Search tickets..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <select 
                    className="bg-gray-50 border-none rounded-xl px-3 py-2.5 text-xs font-bold text-[#1A5F7A] focus:ring-2 focus:ring-[#1A5F7A]/10 outline-none"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  >
                    <option>All</option>
                    <option>Open</option>
                    <option>Resolved</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#F4A261]/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-[#1A5F7A] group-hover:text-[#F4A261] transition-colors">{t.subject}</span>
                          <StatusBadge status={t.status} />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><Clock size={10} /> {t.created}</span>
                          <span>ID: {t.id}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-12 flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <MessageSquare className="text-gray-200" size={32} />
                      </div>
                      <p className="text-[#4A5B6E] text-sm">No tickets found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!selectedId && (
          <div className="bg-[#1A5F7A] rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-[#1A5F7A]/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg text-white">
                <AlertCircle size={20} />
              </div>
              <div className="text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Need urgent help?</p>
                <p className="text-sm font-bold">Call our priority line</p>
              </div>
            </div>
            <Link href="/contact-support" className="bg-[#F4A261] text-white text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-lg hover:bg-white hover:text-[#F4A261] transition-all">
              Call Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
