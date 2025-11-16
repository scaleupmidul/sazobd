
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';

interface HeaderProps {
  navigate: (path: string) => void;
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ navigate, cartItemCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    // Cleanup function
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
        <h1 onClick={() => handleNavClick('/')} className="sazo-logo text-xl sm:text-2xl lg:text-3xl font-semibold text-stone-800 cursor-pointer transition hover:text-pink-600 tracking-wider lg:tracking-[2px]">
          SAZO
        </h1>
        <nav className="hidden md:flex space-x-10">
          <button onClick={() => handleNavClick('/')} className="text-stone-700 hover:text-pink-600 transition font-medium text-sm">Home</button>
          <button onClick={() => handleNavClick('/shop')} className="text-stone-700 hover:text-pink-600 transition font-medium text-sm">Shop All</button>
          <button onClick={() => handleNavClick('/contact')} className="text-stone-700 hover:text-pink-600 transition font-medium text-sm">Contact</button>
        </nav>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={() => handleNavClick('/cart')} className="relative p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* New Mobile Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-full bg-white shadow-lg md:hidden transition-all duration-300 ease-in-out transform origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'}`}
      >
        <nav className="flex flex-col p-4 space-y-2 border-t border-pink-100">
          <button onClick={() => handleNavClick('/')} className="text-left text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition font-medium p-3 rounded-lg">Home</button>
          <button onClick={() => handleNavClick('/shop')} className="text-left text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition font-medium p-3 rounded-lg">Shop All</button>
          <button onClick={() => handleNavClick('/contact')} className="text-left text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition font-medium p-3 rounded-lg">Contact</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;