
import React, { useState, useEffect, memo } from 'react';
import { ShoppingCart, Menu, X, ChevronRight, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../store';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { navigate, path, cart } = useAppStore(state => ({
    navigate: state.navigate,
    path: state.path,
    cart: state.cart
  }));
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleNavClick = (navPath: string) => {
    setIsMenuOpen(false);
    navigate(navPath);
  };
  
  const menuItems = [
      { label: 'Home', path: '/' },
      { label: 'Shop All', path: '/shop' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Privacy Policy', path: '/policy' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
          <h1 onClick={() => handleNavClick('/')} className="sazo-logo text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-800 cursor-pointer transition hover:text-pink-600 tracking-wider lg:tracking-[2px]">
            SAZO
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <button onClick={() => handleNavClick('/')} className={`transition font-medium text-base ${path === '/' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Home</button>
            <button onClick={() => handleNavClick('/shop')} className={`transition font-medium text-base ${path === '/shop' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Shop All</button>
            <button onClick={() => handleNavClick('/contact')} className={`transition font-medium text-base ${path === '/contact' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Contact</button>
          </nav>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={() => handleNavClick('/cart')} className="relative p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer Menu Content */}
      <div 
          className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
          {/* Drawer Header */}
          <div className="flex justify-between items-center p-6 pb-2">
              <h2 className="text-xl font-bold text-stone-900 tracking-widest uppercase" onClick={() => handleNavClick('/')}>Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-stone-500 hover:text-pink-600 transition">
                  <X className="w-6 h-6" />
              </button>
          </div>

          {/* Minimalist Drawer Links */}
          <nav className="flex-1 flex flex-col px-6 py-8 space-y-6 overflow-y-auto">
              {menuItems.map((item) => {
                  const isActive = path === item.path;
                  return (
                      <button 
                          key={item.path}
                          onClick={() => handleNavClick(item.path)} 
                          className={`group flex items-center justify-between text-left text-lg font-medium transition-colors duration-200 ${isActive ? 'text-pink-600' : 'text-stone-800 hover:text-pink-600'}`}
                      >
                          <span>{item.label}</span>
                          {/* Subtle arrow only on hover or active */}
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                      </button>
                  )
              })}
          </nav>

          {/* Elegant Footer */}
          <div className="p-6 border-t border-stone-100 bg-stone-50/50">
               <button 
                  onClick={() => handleNavClick('/shop')}
                  className="w-full bg-stone-900 text-white font-medium py-3.5 rounded-lg hover:bg-stone-800 transition active:scale-95 shadow-md flex items-center justify-center space-x-2 text-sm tracking-wide"
               >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
               </button>
               <div className="mt-8 text-center space-y-1">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">Designed for Elegance</p>
               </div>
          </div>
      </div>
    </>
  );
};

export default memo(Header);

import React, { useState, useEffect, memo } from 'react';
import { ShoppingCart, Menu, X, Home, ShoppingBag, Phone, FileText, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { navigate, path, cart } = useAppStore(state => ({
    navigate: state.navigate,
    path: state.path,
    cart: state.cart
  }));
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleNavClick = (navPath: string) => {
    setIsMenuOpen(false);
    navigate(navPath);
  };
  
  const menuItems = [
      { label: 'Home', path: '/', icon: Home },
      { label: 'Shop All', path: '/shop', icon: ShoppingBag },
      { label: 'Contact Us', path: '/contact', icon: Phone },
      { label: 'Privacy Policy', path: '/policy', icon: FileText },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
          <h1 onClick={() => handleNavClick('/')} className="sazo-logo text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-800 cursor-pointer transition hover:text-pink-600 tracking-wider lg:tracking-[2px]">
            SAZO
          </h1>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <button onClick={() => handleNavClick('/')} className={`transition font-medium text-base ${path === '/' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Home</button>
            <button onClick={() => handleNavClick('/shop')} className={`transition font-medium text-base ${path === '/shop' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Shop All</button>
            <button onClick={() => handleNavClick('/contact')} className={`transition font-medium text-base ${path === '/contact' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Contact</button>
          </nav>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={() => handleNavClick('/cart')} className="relative p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      <div 
          className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer Menu Content */}
      <div 
          className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
          {/* Drawer Header */}
          <div className="flex justify-between items-center p-5 border-b border-stone-100 bg-stone-50/50">
              <h2 className="sazo-logo text-2xl font-bold text-stone-900 tracking-wider" onClick={() => handleNavClick('/')}>SAZO</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white border border-stone-200 rounded-full text-stone-500 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition shadow-sm">
                  <X className="w-5 h-5" />
              </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-3">
              {menuItems.map((item) => {
                  const isActive = path === item.path;
                  const Icon = item.icon;
                  return (
                      <button 
                          key={item.path}
                          onClick={() => handleNavClick(item.path)} 
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group border ${isActive ? 'bg-pink-50 text-pink-700 border-pink-100 shadow-sm' : 'bg-white text-stone-700 border-transparent hover:bg-stone-50 hover:border-stone-100'}`}
                      >
                          <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg ${isActive ? 'bg-white text-pink-600' : 'bg-stone-100 text-stone-500 group-hover:bg-white group-hover:text-stone-700'} transition-colors shadow-sm`}>
                                  <Icon className="w-5 h-5" />
                              </div>
                              <span className="font-semibold text-base">{item.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-pink-400' : 'text-stone-300 group-hover:text-stone-400 group-hover:translate-x-1'}`} />
                      </button>
                  )
              })}
          </nav>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-stone-100 bg-stone-50">
               <button 
                  onClick={() => handleNavClick('/shop')}
                  className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-xl hover:bg-stone-800 transition active:scale-95 shadow-lg flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
               >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
               </button>
               <div className="mt-6 text-center">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Designed for Elegance</p>
                  <p className="text-[10px] text-stone-300 mt-1">&copy; {new Date().getFullYear()} SAZO</p>
               </div>
          </div>
      </div>
    </>
  );
};

export default memo(Header);
