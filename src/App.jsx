import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProfitCalculator from './components/ProfitCalculator';
import ShopifyIntegrationSection from './components/ShopifyIntegrationSection';
import ComparisonSection from './components/ComparisonSection';
import ServicesFeaturesSection from './components/ServicesFeaturesSection';
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
import ProductDetailView from './components/ProductDetailView';
import DynamicUpiQrModal from './components/DynamicUpiQrModal';
import ExcelBulkUploadModal from './components/ExcelBulkUploadModal';
import { dbService } from './services/dbService';

import { 
  INITIAL_PRODUCTS, INITIAL_META_CAMPAIGNS, INITIAL_ORDERS, ONBOARDING_STEPS 
} from './data/mockData';

export default function App() {
  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [initialMobile, setInitialMobile] = useState('');
  const [user, setUser] = useState(() => dbService.getCurrentUser());

  const [viewMode, setViewMode] = useState(() => {
    const hash = window.location.hash;
    const session = dbService.getCurrentUser();
    if (session && hash.includes('admin') && session.email?.toLowerCase() === 'rustic241@gmail.com') return 'admin';
    if (session && hash.includes('dashboard')) return 'dashboard';
    return 'landing';
  });

  const [userRole, setUserRole] = useState(() => {
    const session = dbService.getCurrentUser();
    return session?.email?.toLowerCase() === 'rustic241@gmail.com' ? 'admin' : 'dropshipper';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const session = dbService.getCurrentUser();
    if (session?.email?.toLowerCase() === 'rustic241@gmail.com' && window.location.hash.includes('admin')) return 'payout-approvals';
    return 'dashboard';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // STRICT ROUTE SECURITY GUARD & SESSION PERSISTENCE
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const currentUser = dbService.getCurrentUser();

      if (hash.includes('admin')) {
        if (!currentUser) {
          setViewMode('landing');
          setAuthMode('login');
          setAuthModalOpen(true);
          if (window.location.hash !== '') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          return;
        }
        const isMasterAdmin = (currentUser.email?.toLowerCase() === 'rustic241@gmail.com');
        if (isMasterAdmin) {
          setViewMode('admin');
          setUserRole('admin');
          setActiveTab('payout-approvals');
        } else {
          setViewMode('dashboard');
          setUserRole('dropshipper');
          setActiveTab('dashboard');
          window.location.hash = '#/dashboard';
        }
      } else if (hash.includes('dashboard')) {
        if (!currentUser) {
          setViewMode('landing');
          setAuthMode('login');
          setAuthModalOpen(true);
          if (window.location.hash !== '') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          return;
        }
        setViewMode('dashboard');
        setUserRole('dropshipper');
        setActiveTab('dashboard');
      } else if (hash.includes('onboarding')) {
        if (!currentUser) {
          setViewMode('landing');
          setAuthMode('login');
          setAuthModalOpen(true);
          if (window.location.hash !== '') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          return;
        }
        setViewMode('onboarding');
      } else {
        // Root URL or section anchors (#features, #calculator, etc.) -> LANDING PAGE
        setViewMode('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const handleToggleRole = () => {
    setViewMode('dashboard');
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

  const handleGoToAdmin = () => {
    setViewMode('dashboard');
    setUserRole('admin');
    setActiveTab('admin-portal');
    window.location.hash = '#/admin';
  };

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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userPushedIds, setUserPushedIds] = useState(() => {
    return user?.id ? dbService.getUserPushedProducts(user.id) : [];
  });

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveTab('product-details');
  };

  const handlePushProductToStore = (productId) => {
    if (user?.id && productId) {
      const updated = dbService.pushProductToUserStore(user.id, productId);
      setUserPushedIds([...updated]);
    }
  };

  // Load Isolated Data when User changes
  useEffect(() => {
    if (user?.id) {
      setOrders(dbService.getUserOrders(user.id));
      setWalletBalance(dbService.getUserWallet(user.id));
      setCampaigns(dbService.getUserCampaigns(user.id));
      setUserPushedIds(dbService.getUserPushedProducts(user.id));
    } else {
      setOrders([]);
      setWalletBalance(0);
      setCampaigns([]);
      setUserPushedIds([]);
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

    if (userData.email?.toLowerCase() === 'rustic241@gmail.com') {
      setUserRole('admin');
      setViewMode('admin');
      setActiveTab('payout-approvals');
      window.location.hash = '#/admin';
    } else {
      setUserRole('dropshipper');
      setViewMode('dashboard');
      setActiveTab('dashboard');
      window.location.hash = '#/dashboard';
    }
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

  // Render Dashboard Body Content according to activeTab
  const renderDashboardContent = () => {
    if (activeTab === 'admin-portal' || activeTab.startsWith('admin') || activeTab === 'payout-approvals' || activeTab === 'agency-settings' || activeTab === 'platform-analytics') {
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
      case 'product-details':
        return (
          <ProductDetailView
            product={selectedProduct}
            onBack={() => setActiveTab('all-products')}
            onSelectTab={setActiveTab}
          />
        );
      case 'all-products':
      case 'manage-products':
        return (
          <ManageProductsView
            user={user}
            products={products}
            userPushedIds={userPushedIds}
            onPushProduct={handlePushProductToStore}
            onOpenBulkUpload={() => setBulkUploadModalOpen(true)}
            onSelectTab={setActiveTab}
            onSelectProduct={handleSelectProduct}
            viewModeFilter="all"
          />
        );
      case 'my-products':
        return (
          <ManageProductsView
            user={user}
            products={products}
            userPushedIds={userPushedIds}
            onPushProduct={handlePushProductToStore}
            onOpenBulkUpload={() => setBulkUploadModalOpen(true)}
            onSelectTab={setActiveTab}
            onSelectProduct={handleSelectProduct}
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
            onSelectProduct={handleSelectProduct}
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
            onGoToAdmin={handleGoToAdmin}
            isLoggedIn={!!user}
          />

          <main className="flex-1">
            <Hero onOpenAuth={handleOpenAuth} />
            <ServicesFeaturesSection onOpenAuth={handleOpenAuth} />
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
            onLogout={() => { dbService.logout(); setUser(null); setViewMode('landing'); window.location.hash = ''; }}
            userRole="dropshipper"
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

      {/* MODE 4: DEDICATED ISOLATED AGENCY ADMIN DASHBOARD */}
      {viewMode === 'admin' && (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
          <Sidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenSourcingModal={() => setSourcingModalOpen(true)}
            onLogout={() => { dbService.logout(); setUser(null); setViewMode('landing'); window.location.hash = ''; }}
            userRole="admin"
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0 bg-slate-900 text-slate-100">
            <div className="bg-slate-950 border-b border-rose-900/40 px-6 py-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  👑 AGENCY ADMIN COMMAND CENTER
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setBulkUploadModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-2"
                >
                  <span>📥 Bulk Upload (.xlsx)</span>
                </button>
                <button
                  onClick={() => { dbService.logout(); setUser(null); setViewMode('landing'); window.location.hash = ''; }}
                  className="bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                >
                  Exit Admin
                </button>
              </div>
            </div>

            <main className="p-6 flex-1 overflow-y-auto">
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
