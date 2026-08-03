import React, { useState } from 'react';
import { QrCode, CheckCircle2, Copy, ShieldCheck, RefreshCw, X, ArrowRight, ArrowLeft, CreditCard } from 'lucide-react';

export default function DynamicUpiQrModal({ isOpen, onClose, agencyUpiId, onPaymentSuccess }) {
  const [modalStep, setModalStep] = useState(1); // Step 1: Select Amount | Step 2: Pay & Submit UTR
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const rechargeAmount = customAmount ? Number(customAmount) : selectedAmount;
  const gstAmount = rechargeAmount * 0.18;
  const totalPayable = rechargeAmount + gstAmount;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(agencyUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    if (rechargeAmount >= 1000) {
      setModalStep(2);
    }
  };

  const handleVerifyPayment = (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 8) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      onPaymentSuccess(rechargeAmount, totalPayable, utrNumber);

      setTimeout(() => {
        setIsSuccess(false);
        setUtrNumber('');
        setModalStep(1);
        onClose();
      }, 2000);
    }, 1500);
  };

  const handleCloseModal = () => {
    setModalStep(1);
    setUtrNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-slate-900 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> INSTANT UPI TOP-UP • STEP {modalStep} OF 2
            </div>
            <h3 className="text-lg font-extrabold font-heading text-slate-900 mt-1">
              Add Meta Ad Budget
            </h3>
            <p className="text-xs text-slate-500">
              {modalStep === 1 ? 'Step 1: Select top-up amount' : 'Step 2: Scan UPI QR & submit UTR number'}
            </p>
          </div>

          <button onClick={handleCloseModal} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-extrabold">
          <div className={`py-1.5 rounded-xl border ${modalStep === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            1. Select Amount
          </div>
          <div className={`py-1.5 rounded-xl border ${modalStep === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            2. Pay & Submit UTR
          </div>
        </div>

        {!isSuccess ? (
          <>
            {/* STEP 1: SELECT TOP-UP AMOUNT */}
            {modalStep === 1 && (
              <form onSubmit={handleProceedToStep2} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Top-Up Amount (Min ₹1,000) *</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[1000, 2500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                          selectedAmount === amt && !customAmount
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min={1000}
                    placeholder="Or enter custom amount..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700 font-medium">
                  <div className="flex justify-between">
                    <span>Net Ad Budget Credit:</span>
                    <span className="font-bold text-slate-900">₹{rechargeAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>+ 18% Govt GST:</span>
                    <span>₹{gstAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-blue-600 font-black text-sm">
                    <span>Total Payable Amount:</span>
                    <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={rechargeAmount < 1000}
                  className="btn-primary w-full justify-center py-3.5 text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  Proceed to Instant UPI Payment →
                </button>
              </form>
            )}

            {/* STEP 2: SCAN UPI QR & SUBMIT UTR */}
            {modalStep === 2 && (
              <form onSubmit={handleVerifyPayment} className="space-y-5">
                
                {/* UPI QR Display Card */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-500/30">
                    SCAN WITH GPAY / PHONEPE / PAYTM / BHIM
                  </span>

                  {/* QR Code Image Graphic */}
                  <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${agencyUpiId}%26pn=360Dropship%26am=${totalPayable}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-mono">
                    <span className="text-slate-300 font-bold">{agencyUpiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" /> {copiedUpi ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">Total Payable: <strong className="text-white">₹{totalPayable.toLocaleString('en-IN')}</strong></p>
                </div>

                {/* UTR Input Form */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Enter 12-Digit UTR / Transaction Ref No. *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 420194821094"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-blue-600 font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Found in your payment app receipt details after paying.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="btn-secondary text-xs py-3 px-4 rounded-xl flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    type="submit"
                    disabled={isVerifying || utrNumber.length < 8}
                    className="btn-primary flex-1 justify-center py-3.5 text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/30 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying UTR...
                      </>
                    ) : (
                      'Submit UTR & Credit Wallet ✓'
                    )}
                  </button>
                </div>

              </form>
            )}
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-xl text-slate-900 font-heading">UTR Submitted for Admin Verification!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your recharge request of <strong>₹{rechargeAmount.toLocaleString('en-IN')}</strong> (UTR: <span className="font-mono font-bold text-blue-600">{utrNumber}</span>) has been submitted to Admin. Your wallet balance will be credited as soon as Admin approves!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
