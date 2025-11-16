
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  navigate: (path: string) => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ products, navigate }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { minPrice, maxPrice } = useMemo(() => {
    if (!products || products.length === 0) {
      return { minPrice: 0, maxPrice: 10000 };
    }
    const prices = products.map(p => p.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [products]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const [filters, setFilters] = useState({
    category: 'All',
    priceMax: 10000, // Use a safe default instead of relying on the initial render of maxPrice
    color: 'All',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const hasSetInitialPrice = useRef(false);

  useEffect(() => {
    // This effect correctly initializes the price filter when product data becomes available.
    // It runs only once after the products are loaded to avoid overriding user's filter choices later.
    if (products.length > 0 && !hasSetInitialPrice.current) {
      setFilters(prev => ({ ...prev, priceMax: maxPrice }));
      hasSetInitialPrice.current = true;
    }
  }, [products, maxPrice]);
  
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to ensure scroll is restored when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFilterOpen]);

  const handleFilterChange = useCallback((key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = filters.category === 'All' || p.category === filters.category;
      const matchesPrice = p.price <= filters.priceMax;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesColor = filters.color === 'All' || p.colors.map(c => c.toLowerCase()).includes(filters.color.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch && matchesColor;
    });
  }, [products, filters, searchTerm]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-stone-300 rounded-full focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="space-y-3 p-4 bg-white rounded-lg border border-stone-200">
        <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Max Price (৳)</h3>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step="100"
          value={filters.priceMax}
          onChange={(e) => handleFilterChange('priceMax', Number(e.target.value))}
          className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
        />
        <p className="text-xs text-stone-500 text-right">Up to: ৳{filters.priceMax.toLocaleString()}</p>
      </div>

      <div className="space-y-3 p-4 bg-white rounded-lg border border-stone-200">
        <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Category</h3>
        <div className="relative">
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="w-full p-3 pr-10 border border-stone-300 rounded-lg text-sm focus:ring-pink-600 focus:border-pink-600 bg-white appearance-none text-black">
            <option value="All">All Categories</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3 p-4 bg-white rounded-lg border border-stone-200">
        <h3 className="font-semibold text-stone-900 text-sm sm:text-base">Color</h3>
        <div className="flex flex-wrap gap-2">
          {['All', 'Pink', 'Beige', 'Blue', 'Red', 'White'].map(color => (
            <button key={color} onClick={() => handleFilterChange('color', color)} className={`px-3 py-1 text-xs font-medium rounded-full transition duration-300 border ${filters.color === color ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-stone-700 border-stone-300 hover:bg-pink-50 hover:border-pink-400'}`}>
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-800">SAZO Styles</h2>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-10">
        <aside className="hidden lg:block lg:col-span-1">
          <FilterPanel />
        </aside>

        {/* Mobile Filter Button - now separate */}
        <div className="lg:hidden mb-6 flex justify-end">
            <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-700 transition duration-300 shadow active:scale-95"
            >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
            </button>
        </div>
        
        {/* Mobile Filter Panel */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsFilterOpen(false)}
        ></div>
        <div 
          className={`fixed top-0 left-0 h-full w-full max-w-sm bg-[#FEF5F5] shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex justify-between items-center p-4 border-b bg-white">
            <h3 className="font-bold text-pink-600">Filter Products</h3>
            <button onClick={() => setIsFilterOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-full pb-24">
            <FilterPanel />
            <div className="fixed bottom-0 left-0 w-full max-w-sm p-4 bg-white border-t">
              <button 
                onClick={() => setIsFilterOpen(false)} 
                className="w-full bg-pink-600 text-white text-base font-bold py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow active:scale-95"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>

        <section className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-xl border border-stone-200">
              <p className="text-base sm:text-lg text-stone-600">No products match your current filters. Try adjusting your selections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ShopPage;