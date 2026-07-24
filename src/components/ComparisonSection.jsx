import React from 'react';
import { Check, X, Award } from 'lucide-react';

export default function ComparisonSection() {
  return (
    <section id="comparison" className="py-20 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-4 h-4 text-blue-600" /> Build Your Own Brand
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 font-heading">
            Traditional Marketplaces vs <span className="text-blue-600">360 Dropship</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Stop surrendering high 30% commissions and customer data. Build a sustainable brand on your own storefront.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-bold w-1/3 uppercase tracking-wider text-slate-300">Key Feature</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-bold text-slate-400 w-1/3 uppercase tracking-wider">Amazon / Flipkart Marketplaces</th>
                  <th className="p-4 sm:p-6 text-xs sm:text-sm font-bold text-blue-400 bg-slate-950 w-1/3 border-l border-slate-800 uppercase tracking-wider">360 Dropship Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-semibold text-slate-700">
                
                <tr>
                  <td className="p-4 sm:p-6 font-bold text-slate-900">Brand Ownership & Domain</td>
                  <td className="p-4 sm:p-6 text-slate-500">❌ Renting space on third-party marketplace</td>
                  <td className="p-4 sm:p-6 bg-blue-50/80 text-blue-900 font-bold border-l border-slate-200">
                    <Check className="w-4 h-4 inline text-blue-600 mr-1.5" /> 100% Your Own Branded Domain & Storefront
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-6 font-bold text-slate-900">Marketplace Commission</td>
                  <td className="p-4 sm:p-6 text-rose-600 font-semibold">❌ Heavy 15% - 35% commission on sales</td>
                  <td className="p-4 sm:p-6 bg-blue-50/80 text-blue-900 font-bold border-l border-slate-200">
                    <Check className="w-4 h-4 inline text-blue-600 mr-1.5" /> 0% Marketplace Commission (5% Agency Fee on Delivered Orders Only)
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-6 font-bold text-slate-900">Inventory Investment</td>
                  <td className="p-4 sm:p-6 text-slate-500">❌ Mandatory upfront bulk inventory purchase</td>
                  <td className="p-4 sm:p-6 bg-blue-50/80 text-blue-900 font-bold border-l border-slate-200">
                    <Check className="w-4 h-4 inline text-blue-600 mr-1.5" /> ₹0 Inventory (10,000+ Ready-to-Ship Products)
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-6 font-bold text-slate-900">Shipping & RTO Transparency</td>
                  <td className="p-4 sm:p-6 text-slate-500">❌ Weight slab penalties & unexpected deductions</td>
                  <td className="p-4 sm:p-6 bg-blue-50/80 text-blue-900 font-bold border-l border-slate-200">
                    <Check className="w-4 h-4 inline text-blue-600 mr-1.5" /> Flat ₹75 Fixed Shipping & RTO Charge
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-6 font-bold text-slate-900">Customer Data Ownership</td>
                  <td className="p-4 sm:p-6 text-slate-500">❌ Customer contact details hidden from seller</td>
                  <td className="p-4 sm:p-6 bg-blue-50/80 text-blue-900 font-bold border-l border-slate-200">
                    <Check className="w-4 h-4 inline text-blue-600 mr-1.5" /> 100% Customer Data Ownership for Remarketing
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-6 font-bold text-slate-900">Meta (FB/IG) Ad Engine</td>
                  <td className="p-4 sm:p-6 text-slate-500">❌ Complex self-managed Facebook ad accounts</td>
                  <td className="p-4 sm:p-6 bg-blue-50/80 text-blue-900 font-bold border-l border-slate-200">
                    <Check className="w-4 h-4 inline text-blue-600 mr-1.5" /> Free Meta Agency Account + Auto-Pause Safeguard
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
