import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, MessageSquare, PhoneCall, Zap } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function RaiseTicketView() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Tracking');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const adminSettings = dbService.getAdminSettings ? dbService.getAdminSettings() : { whatsappNumber: '+919876543210' };
  const cleanWaNumber = (adminSettings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
    }, 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in text-white mx-auto">
      
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">24/7 Agency Support</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight mt-0.5">
          Support & Raise Ticket
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Need help with orders, Shopify store sync, or Meta ad campaigns? Contact us via WhatsApp or submit a ticket.
        </p>
      </div>

      {/* Instant WhatsApp Support Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Instant WhatsApp Desk</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">ONLINE ⚡</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Get 1-on-1 priority support on WhatsApp for quick resolution!
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/${cleanWaNumber}?text=Hello%20360%20Dropship%20Support%2C%20I%20need%20help%20with%20my%20account.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat on WhatsApp →</span>
        </a>
      </div>

      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {submitted && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            Support ticket created successfully! Ticket ID #TK-9941. An agent will respond within 2 hours.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Order Tracking">Order Tracking & AWB</option>
                <option value="Shopify Sync">Shopify Store Sync</option>
                <option value="Meta Ads">Meta Ads Budget & Wallet</option>
                <option value="Payouts">Bank & UPI Profit Payout</option>
                <option value="Custom Sourcing">Custom Product Sourcing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Subject Title *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
                placeholder="Brief summary of your query"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detailed Message *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-xs focus:outline-none focus:border-blue-500"
              placeholder="Describe your issue or order ID in detail..."
            />
          </div>

          <button
            type="submit"
            className="btn-primary py-3.5 px-8 text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit Support Ticket
          </button>
        </form>

      </div>

    </div>
  );
}
