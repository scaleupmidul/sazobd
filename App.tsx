
import React, { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import { StoreContext } from './StoreContext';
import WhatsAppButton from './components/WhatsAppButton';
import { LoaderCircle } from 'lucide-react';

// Initialize the dataLayer for analytics
declare global {
  interface Window { dataLayer: any[]; }
}
window.dataLayer = window.dataLayer || [];

// Eagerly-loaded page components to remove loading between pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPaymentInfoPage from './pages/admin/AdminPaymentInfoPage';

const App: React.FC = () => {
  const store = useStore();
  const {
    path, navigate,
    products, cart, cartTotal,
    selectedProduct,
    notification,
    isAdminAuthenticated,
    loading,
    settings,
  } = store;

  useEffect(() => {
    const productMatch = path.match(/^\/product\/(\d+)$/);
    if (productMatch) {
        const productId = parseInt(productMatch[1], 10);
        const product = products.find(p => p.id === productId);
        store.setSelectedProduct(product || null);
    } else {
        if (selectedProduct) {
          store.setSelectedProduct(null);
        }
    }
  }, [path, products, store.setSelectedProduct, selectedProduct]);
  
  useEffect(() => {
    const BASE_TITLE = 'SAZO';
    let pageTitle = `${BASE_TITLE} E-commerce`; // Default title

    const productMatch = path.match(/^\/product\/(\d+)$/);
    const thankYouMatch = path.match(/^\/thank-you\/(.+)$/);

    if (productMatch && selectedProduct) {
        pageTitle = `${selectedProduct.name} - ${BASE_TITLE}`;
    } else if (thankYouMatch) {
        pageTitle = `Order Confirmed! - ${BASE_TITLE}`;
    } else if (path.startsWith('/admin')) {
        pageTitle = `Admin Panel - ${BASE_TITLE}`;
    } else {
        switch (path) {
            case '/':
                pageTitle = `${BASE_TITLE} - Elegant Women's Wear`;
                break;
            case '/shop':
                pageTitle = `Shop All - ${BASE_TITLE}`;
                break;
            case '/cart':
                pageTitle = `Your Shopping Cart - ${BASE_TITLE}`;
                break;
            case '/checkout':
                pageTitle = `Checkout - ${BASE_TITLE}`;
                break;
            case '/contact':
                pageTitle = `Contact Us - ${BASE_TITLE}`;
                break;
            case '/policy':
                pageTitle = `Privacy Policy - ${BASE_TITLE}`;
                break;
        }
    }
    
    document.title = pageTitle;
  }, [path, selectedProduct]);


  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isCustomerPage = !path.startsWith('/admin');

  const renderAdminPageContent = () => {
     // This function returns the component for the current admin path, to be rendered inside AdminLayout.
     if (path === '/admin/dashboard') return <AdminDashboardPage />;
     if (path === '/admin/products') return <AdminProductsPage />;
     if (path === '/admin/orders') return <AdminOrdersPage />;
     if (path === '/admin/messages') return <AdminMessagesPage />;
     if (path === '/admin/settings') return <AdminSettingsPage />;
     if (path === '/admin/payment-info') return <AdminPaymentInfoPage />;
     
     // Default admin page if authenticated and no specific path matches
     return <AdminDashboardPage />;
  }

  const renderPage = () => {
    // Standalone admin login page (no layout)
    if (path === '/admin/login') {
      return <AdminLoginPage login={store.login} />;
    }

    // All other admin pages are wrapped in the layout
    if (path.startsWith('/admin')) {
      return (
        <AdminLayout>
            {renderAdminPageContent()}
        </AdminLayout>
      );
    }
    
    // Customer-facing pages
    const productMatch = path.match(/^\/product\/(\d+)$/);
    if (productMatch) {
      return <ProductDetailsPage product={selectedProduct} navigate={navigate} addToCart={store.addToCart} notify={store.notify} />;
    }

    const thankYouMatch = path.match(/^\/thank-you\/(.+)$/);
    if (thankYouMatch) {
        const orderId = thankYouMatch[1];
        return <ThankYouPage orderId={orderId} />;
    }

    switch (path) {
      case '/':
        return <HomePage products={products} navigate={navigate} />;
      case '/shop':
        return <ShopPage products={products} navigate={navigate} />;
      case '/cart':
        return <CartPage cart={cart} updateCartQuantity={store.updateCartQuantity} navigate={navigate} cartTotal={cartTotal} />;
      case '/checkout':
        return <CheckoutPage />;
      case '/contact':
        return <ContactPage notify={store.notify} />;
      case '/policy':
        return <PolicyPage />;
      default:
        // For any other path, show the home page. A 404 page could be added here.
        return <HomePage products={products} navigate={navigate} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FEF5F5]">
        <div className="text-center">
            <h1 className="sazo-logo text-3xl sm:text-4xl font-semibold text-stone-800 mb-4">SAZO</h1>
            <div className="flex items-center justify-center text-gray-600">
                <LoaderCircle className="w-5 h-5 animate-spin mr-2" />
                <span>Loading your elegant experience...</span>
            </div>
        </div>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={store}>
      <div className={`min-h-screen ${isCustomerPage ? 'bg-[#FEF5F5]' : 'bg-gray-100'} font-sans flex flex-col`}>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Poppins:wght@600;800&display=swap');
            
            .sazo-logo {
              font-family: 'Poppins', sans-serif;
            }

            /* Hide scrollbar for IE, Edge */
            body { 
              font-family: 'Inter', sans-serif; 
              color: #444;
              overflow-x: hidden; /* Prevent horizontal scroll */
              -ms-overflow-style: none;  /* IE and Edge */
            }

            /* Hide scrollbar for Firefox */
            html {
                scrollbar-width: none;
            }
            
            /* Hide scrollbar for Chrome, Safari and Opera */
            ::-webkit-scrollbar {
                display: none;
            }

            h1, .font-display-xl { font-weight: 700; }
            h2, .font-display-lg { font-weight: 600; }
            h3, .font-display-md { font-weight: 600; }

            /* Override browser autofill styles */
            input:-webkit-autofill,
            input:-webkit-autofill:hover, 
            input:-webkit-autofill:focus, 
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px white inset !important;
              -webkit-text-fill-color: #000 !important;
            }

            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }

            @keyframes scaleIn {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }

            @keyframes slideInLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }

            /* New Animations for Hero Slider */
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }

            .text-shadow { text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
            .text-shadow-md { text-shadow: 0 2px 8px rgba(0,0,0,0.4); }

            /* WhatsApp Pulse Animation */
            @keyframes pulse-whatsapp {
              0% { box-shadow: 0 0 0 0 rgba(219, 39, 119, 0.7); }
              70% { box-shadow: 0 0 0 15px rgba(219, 39, 119, 0); }
              100% { box-shadow: 0 0 0 0 rgba(219, 39, 119, 0); }
            }
            .animate-pulse-whatsapp {
              animation: pulse-whatsapp 2s infinite;
            }
          `}
        </style>

        <Notification notification={notification} />
        {isCustomerPage && <Header navigate={navigate} cartItemCount={cartItemCount} />}
        <div className="flex-grow">
          {renderPage()}
        </div>
        {isCustomerPage && settings.showWhatsAppButton && <WhatsAppButton />}
        {isCustomerPage && <Footer navigate={navigate} />}
      </div>
    </StoreContext.Provider>
  );
};

export default App;