import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

const DROPSHIPPER_FAQS_ENGLISH = [
  {
    q: "Do I need to purchase upfront inventory to start dropshipping?",
    a: "Not at all! 360 Dropship operates on a 100% zero-inventory model. You never have to spend upfront capital on stock. You only pay the wholesale product cost when an actual customer places an order on your Shopify store."
  },
  {
    q: "How and when will I receive my net profit payouts?",
    a: "Customer payments (Prepaid or COD settlements) land directly into your connected payment gateway. Upon successful order delivery, your cleared net profit margin is automatically released to your linked Indian Bank Account or custom UPI ID (GPay / PhonePe / Paytm / BHIM)."
  },
  {
    q: "What is the exact shipping and RTO fee per product?",
    a: "We charge a transparent flat ₹75 fixed shipping and RTO protection fee per item. There are zero hidden courier weight slab penalties or unexpected logistics surcharges."
  },
  {
    q: "How does the Meta Ads Agency Management Service work for dropshippers?",
    a: "You don't need to struggle with complex ad setups. Our in-house agency team creates and runs winning video and banner campaigns for your products. You simply top up your Ads Wallet (Minimum ₹1,000 + 18% GST)."
  },
  {
    q: "When is the 5% Agency Service Fee charged?",
    a: "The 5% service fee is charged ONLY on DELIVERED orders based on your store's selling price. If an order gets returned or rejected (RTO), you pay 0% agency service fee."
  },
  {
    q: "How do I push products from your 10,000+ catalog to my Shopify store?",
    a: "Simply browse our high-demand catalog, click 'Push to Shopify', set your custom selling price markup, and the product instantly goes live on your store catalog with full images and descriptions."
  },
  {
    q: "How are orders dispatched and tracking details sent to my customers?",
    a: "When a customer orders on your storefront, our automated order system routes the details directly to our fulfillment warehouse. The AWB tracking number is automatically updated on your customer's Shopify order status page."
  },
  {
    q: "What is the minimum wallet recharge limit and how do I add funds?",
    a: "The minimum wallet top-up is ₹1,000 (+ 18% GST = ₹1,180 total). Select your desired amount, scan the generated Dynamic UPI QR Code using any app (GPay, PhonePe, Paytm, BHIM), enter the 12-digit UTR transaction reference, and your balance is credited instantly."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faqs" className="py-20 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Dropshipper Help Center
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600">
            Everything you need to know about zero inventory, Meta ads management, flat ₹75 shipping, and automated payouts.
          </p>
        </div>

        <div className="space-y-4">
          {DROPSHIPPER_FAQS_ENGLISH.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-left font-bold text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-heading">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
