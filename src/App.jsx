import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProfitCalculator from './components/ProfitCalculator';
import ShopifyIntegrationSection from './components/ShopifyIntegrationSection';
import ComparisonSection from './components/ComparisonSection';
import FaqSection from './components/FaqSection';
import AuthModal from './components/AuthModal';
import OnboardingWizard from './components/OnboardingWizard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './components/DashboardHome';
import MetaAdsManagerView from './components/MetaAdsManagerView';
import ManageProductsView from './components/ManageProductsView';
import ManageOrdersView from './components/ManageOrdersView';
import PayoutsView from './components/PayoutsView';
import SettingsView from './components/SettingsView';
import ShopifyStoreManagerView from './components/ShopifyStoreManagerView';
import RaiseTicketView from './components/RaiseTicketView';
import SourceProductModal from './components/SourceProductModal';
import AdminDashboard from './components/AdminDashboard';
import DynamicUpiQrModal from './components/DynamicUpiQrModal';
import ExcelBulkUploadModal from './components/ExcelBulkUploadModal';
import { dbService } from './services/dbService';

import { 
  INITIAL_PRODUCTS, INITIAL_META_CAMPAIGNS, INITIAL_ORDERS, ONBOARDING_STEPS 
} from './data/mockData';

export default function App() {
  const [viewMode, setViewMode] = useState('landing');
  const [userRole, setUserRole] = useState('dropshipper'); // 'dropshipper' or 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('admin')) {
        setViewMode('dashboard');
        setUserRole('admin');
        setActiveTab('admin-portal');
      } else if (hash.includes('dashboard')) {
        setViewMode('dashboard');
        setUserRole('dropshipper');
        setActiveTab('dashboard');
      } else if (hash.includes('onboarding')) {
        setViewMode('onboarding');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleToggleRole = () => {
    if (userRole === 'dropshipper') {
      setUserRole('admin');
      setActiveTab('admin-portal');
      window.location.hash = '#/admin';
    } else {
      setUserRole('dropshipper');
      setActiveTab('dashboard');
      window.location.hash = '#/dashboard';
    }
  };

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [initialMobile, setInitialMobile] = useState('');
  const [user, setUser] = useState(() => dbService.getCurrentUser());

  // Recharge Modal State
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  // Bulk Upload Modal State
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);

  // Application Data States
  const [walletBalance, setWalletBalance] = useState(3450);
  const [agencyUpiId, setAgencyUpiId] = useState('360dropship@upi');
  const [products, setProducts] = useState(() => dbService.getProducts(INITIAL_PRODUCTS));
  const [campaigns, setCampaigns] = useState(INITIAL_META_CAMPAIGNS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [onboardingSteps, setOnboardingSteps] = useState(ONBOARDING_STEPS);

  // Automatic Direct Cloud Sync for Google Sheet / WebApp URL on page load & mount!
  useEffect(() => {
    const autoSyncGoogleSheet = async () => {
      try {
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbwfljG3mY5G3vn9_nGWQCfqZUyz1V44n23uHWPsmdsWCClPLfZGJMJ_ZF5seW0zSgzxQA/exec';
        const res = await fetch(webAppUrl, { redirect: 'follow' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            const formatted = json.map((p, i) => ({
              id: p.id || `PROD-GS-${Date.now()}-${i}`,
              name: p.name || p.title || `Product #${i + 1}`,
              category: p.category || p.type || 'General Catalog',
              wholesalePrice: parseFloat(p.wholesalePrice || p.cost || 350),
              shippingFee: 75,
              suggestedMrp: parseFloat(p.suggestedMrp || p.price || 1299),
              stock: 500,
              rating: 4.8,
              image: p.image || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"),
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image].filter(Boolean),
              sku: p.sku || `SKU-GS-${Date.now()}-${i}`,
              description: p.description || "Imported product."
            }));
            
            setProducts(prev => {
              const existingSkus = new Set(prev.map(item => item.sku));
              const newItems = formatted.filter(item => !existingSkus.has(item.sku));
              if (newItems.length > 0) {
                const updated = [...newItems, ...prev];
                dbService.saveProducts(updated);
                return updated;
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('Auto Google Sheet sync quiet attempt:', err);
      }
    };

    autoSyncGoogleSheet();
  }, []);

  // Load Isolated Data when User changes
  useEffect(() => {
    if (user?.id) {
      setOrders(dbService.getUserOrders(user.id));
      setWalletBalance(dbService.getUserWallet(user.id));
      setCampaigns(dbService.getUserCampaigns(user.id));
    } else {
      setOrders([]);
      setWalletBalance(0);
      setCampaigns([]);
    }
  }, [user?.id]);

  // Auth Handler
  const handleOpenAuth = (mode = 'signup', mobile = '') => {
    setAuthMode(mode);
    setInitialMobile(mobile);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setOrders(dbService.getUserOrders(userData.id));
    setWalletBalance(dbService.getUserWallet(userData.id));
    setCampaigns(dbService.getUserCampaigns(userData.id));
    setAuthModalOpen(false);
    setViewMode('onboarding'); // ALWAYS START WITH ONBOARDING STEPPER FOR NEW SIGNUPS
    window.location.hash = '#/onboarding';
  };

  // Meta Graph API Auto-Pause / Auto-Resume logic
  const handlePaymentSuccess = (netBudget, totalPaid, utrNumber) => {
    const newBalance = walletBalance + netBudget;
    setWalletBalance(newBalance);
    if (user?.id) {
      dbService.saveUserWallet(user.id, newBalance);
    }

    // If balance restored > 0, set all campaigns to ACTIVE via Meta Graph API
    if (newBalance > 0) {
      setCampaigns(campaigns.map(c => ({ ...c, status: 'ACTIVE' })));
    }
  };

  const handleToggleCampaignStatus = (campaignId) => {
    setCampaigns(campaigns.map(c => {
      if (c.id === campaignId) {
        const nextStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleBulkUploadSuccess = (importedData) => {
    let newItems = [];
    if (Array.isArray(importedData)) {
      newItems = importedData;
    } else {
      newItems = Array.from({ length: 8 }, (_, i) => ({
        id: `PROD-BULK-${Date.now()}-${i}`,
        name: `Bulk Import Product #${i + 1} Premium Quality`,
        category: i % 2 === 0 ? "Home & Kitchenware" : "Electronics",
        wholesalePrice: 200 + (i * 20),
        shippingFee: 75,
        suggestedMrp: 799 + (i * 50),
        stock: 1000,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        sku: `BLK-SKU-${i + 100}`
      }));
    }
    const updatedCatalog = [...newItems, ...products];
    setProducts(updatedCatalog);
    dbService.saveProducts(updatedCatalog);
  };

  const handleAddCustomProduct = (newProd) => {
    const updated = [newProd, ...products];
    setProducts(updated);
    dbService.saveProducts(updated);
  };

  const handleEditProduct = (updatedProd) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updated);
    dbService.saveProducts(updated);
  };

  const handleDeleteProducts = (idsToDelete) => {
    const updated = products.filter(p => !idsToDelete.includes(p.id));
    setProducts(updated);
    dbService.saveProducts(updated);
  };

  // Render Dashboard Body Content according to activeTab & userRole
  const renderDashboardContent = () => {
    if (userRole === 'admin' || activeTab.startsWith('admin') || activeTab === 'payout-approvals' || activeTab === 'agency-settings' || activeTab === 'platform-analytics') {
      return (
        <AdminDashboard
          agencyUpiId={agencyUpiId}
          onSaveUpiId={(newUpi) => setAgencyUpiId(newUpi)}
          orders={orders}
          products={products}
          onOpenBulkUpload={() => setBulkUploadModalOpen(true)}
          activeTab={activeTab}
          onAddProduct={handleAddCustomProduct}
          onEditProduct={handleEditProduct}
          onDeleteProducts={handleDeleteProducts}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardHome
            onSelectTab={setActiveTab}
            onOpenRechargeModal={() => setRechargeModalOpen(true)}
            products={products}
            walletBalance={walletBalance}
          />
        );
      case 'meta-ads':
        return (
          <MetaAdsManagerView
            campaigns={campaigns}
            walletBalance={walletBalance}
            onOpenRechargeModal={() => setRechargeModalOpen(true)}
            onToggleCampaignStatus={handleToggleCampaignStatus}
          />
        );
      case 'all-products':
      case 'manage-products':
        return (
          <ManageProductsView
            products={products}
            onOpenBulkUpload={() => setBulkUploadModalOpen(true)}
            onSelectTab={setActiveTab}
            viewModeFilter="all"
          />
        );
      case 'my-products':
        return (
          <ManageProductsView
            products={products}
            onOpenBulkUpload={() => setBulkUploadModalOpen(true)}
            onSelectTab={setActiveTab}
            viewModeFilter="my"
          />
        );
      case 'manage-orders':
        return <ManageOrdersView orders={orders} />;
      case 'payouts':
        return <PayoutsView user={user} />;
      case 'shopify-manager':
        return <ShopifyStoreManagerView onSelectTab={setActiveTab} />;
      case 'onboarding':
        return <OnboardingWizard onComplete={() => setActiveTab('dashboard')} />;
      case 'tickets':
      case 'raise-ticket':
        return <RaiseTicketView />;
      case 'source-product':
        return <SourceProductModal onAddCustomProduct={handleAddCustomProduct} />;
      default:
        return (
          <DashboardHome
            user={user}
            orders={orders}
            onSelectTab={setActiveTab}
            onOpenRechargeModal={() => setRechargeModalOpen(true)}
            products={products}
            walletBalance={walletBalance}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      
      {/* MODE 1: LANDING PAGE */}
      {viewMode === 'landing' && (
        <div className="min-h-screen flex flex-col">
          <Navbar
            onOpenAuth={handleOpenAuth}
            onGoToDashboard={() => setViewMode('dashboard')}
            isLoggedIn={!!user}
          />

          <main className="flex-1">
            <Hero onOpenAuth={handleOpenAuth} />
            <ShopifyIntegrationSection onOpenAuth={handleOpenAuth} />
            <ProfitCalculator onOpenAuth={handleOpenAuth} />
            <ComparisonSection />
            <FaqSection />
          </main>

          {/* Footer */}
          <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
              <p className="font-extrabold text-white text-sm font-heading">
                360<span className="text-blue-400">Dropship</span> India Network
              </p>
              <p>© 2026 360 Dropship Network. Zero Inventory • 1-Click Shopify Sync • Agency Meta Ads Engine.</p>
            </div>
          </footer>
        </div>
      )}

      {/* MODE 2: ONBOARDING STEPPER ROADMAP */}
      {viewMode === 'onboarding' && (
        <OnboardingWizard
          initialSteps={onboardingSteps}
          onCompleteOnboarding={() => setViewMode('dashboard')}
          onSkipToDashboard={() => setViewMode('dashboard')}
        />
      )}

      {/* MODE 3: SHIPOWL STYLE DROPSHIPPER DASHBOARD */}
      {viewMode === 'dashboard' && (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
          <Sidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenSourcingModal={() => setSourcingModalOpen(true)}
            onLogout={() => { dbService.logout(); setUser(null); setViewMode('landing'); }}
            userRole={userRole}
            onToggleRole={handleToggleRole}
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header
              user={user}
              walletBalance={walletBalance}
              onOpenRechargeModal={() => setRechargeModalOpen(true)}
              onSwitchToLanding={() => setViewMode('landing')}
              onSelectTab={setActiveTab}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            />

            <main className="p-4 sm:p-6 lg:p-8 flex-1">
              {renderDashboardContent()}
            </main>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        initialMobile={initialMobile}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <DynamicUpiQrModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        agencyUpiId={agencyUpiId}
        onPaymentSuccess={handlePaymentSuccess}
        currentBalance={walletBalance}
      />

      <ExcelBulkUploadModal
        isOpen={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
        onBulkUploadSuccess={handleBulkUploadSuccess}
      />

    </div>
  );
}
