import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, LogIn, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenAuth, onGoToDashboard, onGoToAdmin, isLoggedIn }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shadow-blue-500/25 border border-white/20">
              360
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-heading">
                  360<span className="text-blue-600">Dropship</span>
                </span>
                <span className="bg-blue-50 text-blue-700 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">
                  INDIA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">Automated E-Commerce & Sourcing Network</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#features" className="hover:text-blue-600 transition-colors">Why 360</a>
            <a href="#shopify-sync" className="hover:text-blue-600 transition-colors">Shopify Sync</a>
            <a href="#calculator" className="hover:text-blue-600 transition-colors">Margin Calculator</a>
            <a href="#comparison" className="hover:text-blue-600 transition-colors">Comparison</a>
            <a href="#faqs" className="hover:text-blue-600 transition-colors">FAQs</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="btn-primary shadow-lg shadow-blue-600/30"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="btn-primary text-sm shadow-md shadow-blue-600/30"
                >
                  Start Free <Zap className="w-4 h-4 text-white fill-white" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Mobile Navigation"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-xl">
          <div className="flex flex-col space-y-1.5 text-sm font-bold text-slate-800">
            <a 
              href="#features" 
              onClick={() => setMobileNavOpen(false)} 
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors block"
            >
              Why 360
            </a>
            <a 
              href="#shopify-sync" 
              onClick={() => setMobileNavOpen(false)} 
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors block"
            >
              Shopify Sync
            </a>
            <a 
              href="#calculator" 
              onClick={() => setMobileNavOpen(false)} 
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors block"
            >
              Margin Calculator
            </a>
            <a 
              href="#comparison" 
              onClick={() => setMobileNavOpen(false)} 
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors block"
            >
              Comparison
            </a>
            <a 
              href="#faqs" 
              onClick={() => setMobileNavOpen(false)} 
              className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors block"
            >
              FAQs
            </a>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => { setMobileNavOpen(false); onGoToDashboard(); }}
                className="btn-primary w-full py-3 text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMobileNavOpen(false); onOpenAuth('login'); }}
                  className="w-full py-3 px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileNavOpen(false); onOpenAuth('signup'); }}
                  className="btn-primary w-full py-3 text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  Start Free <Zap className="w-4 h-4 text-white fill-white" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
