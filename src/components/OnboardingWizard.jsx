import React, { useState } from 'react';
import { 
  UserCheck, Building2, Landmark, CheckCircle2, ShieldCheck, ArrowRight, 
  HelpCircle, CreditCard, ChevronRight, FileText, ArrowLeft, X 
} from 'lucide-react';

export default function OnboardingWizard({ initialSteps, onCompleteOnboarding, onSkipToDashboard, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [payoutOption, setPayoutOption] = useState('bank'); // 'bank' or 'upi'
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: 'Rajesh Verma',
    businessName: 'TrendVibe E-Commerce',
    state: 'Maharashtra',
    city: 'Mumbai',
    panNumber: 'ABCDE1234F',
    bankAccount: '994820194821',
    ifsc: 'HDFC0001234',
    upiId: 'rajesh.verma@okaxis'
  });

  const handleDashboardRedirect = () => {
    if (onCompleteOnboarding) onCompleteOnboarding();
    if (onSkipToDashboard) onSkipToDashboard();
    if (onComplete) onComplete();
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      handleDashboardRedirect();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> Dropshipper Verification & Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Dropshipper Profile & Payout Setup
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Complete profile verification to activate automated bank payouts and order dispatch.
            </p>
          </div>

          <button
            onClick={handleDashboardRedirect}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            Skip to Dashboard →
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-2 gap-4">
          
          <div className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            currentStep === 1
              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              1
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">STEP 1</span>
              <span className="text-xs font-extrabold">Profile & Business Data</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            currentStep === 2
              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">STEP 2</span>
              <span className="text-xs font-extrabold">KYC & Bank/UPI Payout</span>
            </div>
          </div>

        </div>

        {/* Form Body */}
        <form onSubmit={handleNext} className="space-y-5">
          
          {currentStep === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-500"
                    placeholder="As per PAN / Bank"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Store / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-500"
                    placeholder="e.g. TrendVibe Dropship"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PAN Card Number (KYC Verification) *</label>
                <input
                  type="text"
                  required
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500 uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Preferred Payout Destination *</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setPayoutOption('bank')}
                    className={`p-3 rounded-xl text-xs font-extrabold border transition-all text-center ${
                      payoutOption === 'bank'
                        ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🏦 Bank Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutOption('upi')}
                    className={`p-3 rounded-xl text-xs font-extrabold border transition-all text-center ${
                      payoutOption === 'upi'
                        ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ⚡ UPI ID VPA
                  </button>
                </div>
              </div>

              {payoutOption === 'bank' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Account Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.ifsc}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">UPI VPA ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                    placeholder="user@upi"
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {currentStep === 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary text-xs py-3 px-5 rounded-xl flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Step 1
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDashboardRedirect}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 py-3"
              >
                Skip Onboarding
              </button>
            )}

            <button
              type="submit"
              className="btn-primary text-xs font-extrabold py-3.5 px-6 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              {currentStep === 1 ? 'Continue to KYC & Payouts →' : 'Complete Verification & Open Dashboard ✓'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
