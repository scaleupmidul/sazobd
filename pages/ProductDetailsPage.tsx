
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { ShoppingCart, ChevronLeft, ChevronRight, Share2, Plus, Minus, ChevronDown, Truck, ShieldCheck, Ruler, Heart, ArrowRight, X } from 'lucide-react';
import { useAppStore } from '../store';

// --- Reusable Components ---

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ElementType }> = ({ title, children, defaultOpen = false, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-stone-200">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-5 flex justify-between items-center text-left hover:bg-stone-50 transition px-2 -mx-2 group"
      >
        <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-stone-400 group-hover:text-stone-800 transition-colors" />}
            <span className="font-semibold text-stone-900 text-sm tracking-wide uppercase">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
        <div className="text-stone-600 text-sm leading-7 px-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Loader ---
const ProductDetailsPageSkeleton: React.FC = () => (
  <main className="max-w-[1600px] mx-auto px-0 lg:px-8 pt-0 lg:pt-8 animate-pulse">
    <div className="lg:grid lg:grid-cols-2 lg:gap-12">
      <div className="w-full max-w-[550px] mx-auto">
        <div className="aspect-[3/4] bg-stone-200 w-full rounded-lg"></div>
        <div className="flex gap-4 mt-4">
             <div className="w-20 h-24 bg-stone-200 rounded"></div>
             <div className="w-20 h-24 bg-stone-200 rounded"></div>
             <div className="w-20 h-24 bg-stone-200 rounded"></div>
        </div>
      </div>
      <div className="px-4 lg:px-0 mt-8 lg:mt-0 space-y-8 max-w-xl">
        <div className="h-8 bg-stone-200 rounded w-3/4"></div>
        <div className="h-6 bg-stone-200 rounded w-1/4"></div>
        <div className="space-y-2 pt-8">
            <div className="h-12 bg-stone-200 rounded w-full"></div>
            <div className="h-12 bg-stone-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  </main>
);

const ProductDetailsPage: React.FC = () => {
  const { product, settings, navigate, addToCart, notify, loading, refreshProduct } = useAppStore(state => ({
    product: state.selectedProduct,
    settings: state.settings,
    navigate: state.navigate,
    addToCart: state.addToCart,
    notify: state.notify,
    loading: state.loading,
    refreshProduct: state.refreshProduct
  }));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // State to pause auto-slide on interaction
  
  // New state to track explicit data fetching for this page
  const [isFetching, setIsFetching] = useState(true);

  // Swipe state for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Initial Data Fetch
  useEffect(() => {
    const fetchProductData = async () => {
        const pathParts = window.location.pathname.split('/');
        const pathId = pathParts[pathParts.length - 1];
        
        if (pathId && pathId !== 'product') {
             // If we already have the product in state (e.g. from nav), we might still want to refresh,
             // but we can stop the loading spinner immediately if needed. 
             // Ideally, we await the refresh to ensure we have the latest data before deciding "Not Found".
             await refreshProduct(pathId);
        }
        setIsFetching(false);
    };

    fetchProductData();
  }, [refreshProduct]);

  // Derived Data
  const images = useMemo(() => {
    if (!product || !product.images) return [];
    return product.images.filter(img => img && img !== "");
  }, [product]);

  const sizes = product?.sizes || [];
  const isFreeSizeOnly = sizes.length === 1 && sizes[0] === 'Free';

  // Initialize Defaults
  useEffect(() => {
    if (product) {
        setCurrentImageIndex(0);
        setSelectedSize(isFreeSizeOnly ? 'Free' : null);
        window.scrollTo(0, 0); 
        
        // Analytics
        const itemIdForAnalytics = product.productId || product.id;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'view_item',
            ecommerce: {
                currency: 'BDT',
                items: [{
                    item_id: itemIdForAnalytics,
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price
                }]
            }
        });
    }
  }, [product, isFreeSizeOnly]);

  // Auto Slide Effect
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length, currentImageIndex, isPaused]);

  const handleNextImage = useCallback(() => {
    if (images.length > 0) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    if (images.length > 0) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Swipe handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true); // Pause on touch
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    setIsPaused(false); // Resume on touch end
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
  }

  const validateSelection = () => {
      if (!selectedSize) {
        notify("Please select a size first.", "error"); 
        return false;
    }
    if (!product) return false;
    return true;
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    if (!product) return;
    
    addToCart(product, quantity, selectedSize!);
  };

  const handleBuyNow = () => {
      if (!validateSelection()) return;
      if (!product) return;

      addToCart(product, quantity, selectedSize!);
      navigate('/checkout');
  }

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: product?.name || 'SAZO Product',
                  text: `Check out this amazing ${product?.name} on SAZO!`,
                  url: window.location.href,
              });
          } catch (error) {
              console.log('Error sharing', error);
          }
      } else {
          navigator.clipboard.writeText(window.location.href);
          notify("Link copied to clipboard!", "success");
      }
  };

  // Improved Loading Condition:
  // Shows skeleton if global loading is true OR if we are explicitly fetching data for this page.
  // This prevents the "Not Found" flash.
  if ((loading || isFetching) && !product) return <ProductDetailsPageSkeleton />;
  
  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-stone-500 text-lg">Product not found.</p>
        <button onClick={() => navigate('/shop')} className="text-pink-600 font-medium hover:underline">Continue Shopping</button>
      </div>
    );
  }

  // Calculate prices based on optional regularPrice
  const regularPrice = product.regularPrice || 0;
  const hasDiscount = regularPrice > product.price;
  const discountAmount = hasDiscount ? regularPrice - product.price : 0;

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0 relative"> 
      
      {/* --- Mobile Top Bar (Transparent/Blur) --- */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden flex items-center justify-between p-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none">
        <button onClick={() => navigate('/shop')} className="p-2 -ml-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-stone-900 pointer-events-auto">
             <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleShare} className="p-2 -mr-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-stone-900 pointer-events-auto">
            <Share2 className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-[1600px] mx-auto lg:px-8 lg:pt-8">
        
        {/* --- Breadcrumb (Desktop) --- */}
        <nav className="hidden lg:flex items-center space-x-2 text-xs font-medium text-stone-500 mb-6 uppercase tracking-wider">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-pink-600 transition">Home</span>
            <span className="text-stone-300">/</span>
            <span onClick={() => navigate('/shop')} className="cursor-pointer hover:text-pink-600 transition">Shop</span>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900">{product.name}</span>
        </nav>

        {/* CHANGED: Grid layout adjusted to 2 columns with reduced gap for a more compact look */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 items-start justify-center">
            
            {/* --- LEFT COLUMN: IMAGES (Slider with Thumbnails) --- */}
            <div className="w-full">
                
                {/* Mobile: Full Screen Swipeable Slider (Keep existing) */}
                <div 
                    className="lg:hidden relative bg-stone-100 w-full aspect-[3/4] overflow-hidden group touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {images.length > 0 ? (
                        <img 
                            src={images[currentImageIndex]} 
                            alt={product.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400">No Image</div>
                    )}
                    
                    {/* Status Tags (Mobile) - UPDATED COLORS & REMOVED ROUNDED */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                         {product.isNewArrival && <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">NEW</span>}
                         {product.isTrending && <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">BEST</span>}
                    </div>

                    {/* Dots Indicator */}
                    {images.length > 1 && (
                         <div className="absolute bottom-4 right-4 flex space-x-1.5">
                            {images.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop: Enhanced Slider with Thumbnails */}
                {/* CHANGED: Added max-w-[550px] and mx-auto to constrain size */}
                <div className="hidden lg:flex flex-col gap-5 max-w-[550px] lg:ml-auto lg:mr-4">
                    {/* Main Image Stage */}
                    <div 
                        className="relative w-full aspect-[3/4] bg-stone-100 rounded-lg overflow-hidden group shadow-sm border border-stone-100"
                        onMouseEnter={() => setIsPaused(true)} // Pause on hover for desktop
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-zoom-in"
                                />
                                
                                {/* Navigation Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button 
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-stone-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button 
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-stone-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {/* Badges (Desktop) - UPDATED COLORS & REMOVED ROUNDED */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                                    {product.isNewArrival && <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm">NEW</span>}
                                    {product.isTrending && <span className="bg-amber-400 text-stone-900 text-xs font-bold px-3 py-1 uppercase tracking-wider shadow-sm">BEST</span>}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-stone-400">No Image Available</div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-24 aspect-[3/4] flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                                        currentImageIndex === idx 
                                            ? 'border-stone-900 opacity-100 shadow-md ring-1 ring-stone-200' 
                                            : 'border-transparent opacity-50 hover:opacity-100 hover:border-stone-300'
                                    }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- RIGHT COLUMN: DETAILS (Sticky on Desktop) --- */}
            {/* CHANGED: Restricted max-width to 500px to match image better */}
            <div className="lg:sticky lg:top-24 h-fit mt-6 lg:mt-0 px-4 sm:px-6 lg:px-0 max-w-[500px]">
                
                <div className="mb-8 border-b border-stone-100 pb-6">
                    <h1 className="text-2xl lg:text-4xl font-light text-stone-900 leading-tight tracking-tight mb-3">{product.name}</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                         {/* UPDATED: Price color pink, removed Save amount */}
                         <span className="text-xl lg:text-2xl font-bold text-pink-600">৳{product.price.toLocaleString('en-IN')}</span>
                         
                         {/* Dynamic Old Price & Savings Badge */}
                         {hasDiscount && (
                            <>
                                <span className="text-lg text-stone-400 line-through">৳{regularPrice.toLocaleString('en-IN')}</span>
                                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-sm">
                                    Save ৳{discountAmount.toLocaleString('en-IN')}
                                </span>
                            </>
                         )}
                    </div>
                </div>

                {/* Size Selector */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                         <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Select Size</span>
                         {settings.productPagePromoImage && (
                            <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center text-xs font-medium text-stone-500 hover:text-stone-900 underline transition group">
                                <Ruler className="w-3 h-3 mr-1 group-hover:text-pink-600 transition-colors"/> Size Guide
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map(size => {
                             const isSelected = selectedSize === size;
                             return (
                                <button
                                    key={size}
                                    onClick={() => !isFreeSizeOnly && setSelectedSize(size)}
                                    disabled={isFreeSizeOnly && size !== 'Free'}
                                    className={`
                                        h-12 min-w-[3.5rem] px-4 flex items-center justify-center text-sm font-medium transition-all duration-200 border
                                        ${isSelected 
                                            ? 'bg-stone-900 text-white border-stone-900 shadow-md transform scale-105' 
                                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-900'
                                        }
                                        ${isFreeSizeOnly && size !== 'Free' ? 'opacity-40 cursor-not-allowed decoration-slice line-through bg-stone-50' : ''}
                                    `}
                                >
                                    {size === 'Free' ? 'One Size' : size}
                                </button>
                             );
                        })}
                    </div>
                    {isFreeSizeOnly && <p className="text-xs text-stone-500 mt-2">This style comes in a single size designed to fit most body types.</p>}
                </div>

                {/* Desktop: Actions */}
                <div className="hidden lg:flex flex-col gap-3 mb-10">
                    <div className="flex gap-4">
                        {/* Quantity */}
                         <div className="flex items-center border border-stone-200 w-28 justify-between px-2 h-14 hover:border-stone-400 transition">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-stone-500 hover:text-stone-900 p-2"><Minus className="w-4 h-4"/></button>
                            <span className="font-semibold text-stone-900">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="text-stone-500 hover:text-stone-900 p-2"><Plus className="w-4 h-4"/></button>
                        </div>
                        
                        {/* Add to Cart */}
                        <button 
                            onClick={handleAddToCart} 
                            className="flex-1 border border-stone-900 text-stone-900 font-bold text-sm uppercase tracking-widest h-14 hover:bg-stone-50 transition duration-300 flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                        </button>
                    </div>

                    {/* Buy Now (Primary) */}
                    <button 
                        onClick={handleBuyNow} 
                        className="w-full bg-pink-600 text-white font-bold text-sm uppercase tracking-widest h-14 hover:bg-pink-700 transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-[0.99]"
                    >
                        <span>Buy It Now</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* UPDATED: Removed Free shipping text */}
                </div>

                {/* Accordions (Clean & Minimal) */}
                <div className="space-y-0 border-b border-stone-200">
                    <Accordion title="Description" defaultOpen>
                        <p className="mb-4 text-stone-600">{product.description}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                             <div className="flex justify-between border-b border-stone-100 py-1">
                                 <span className="text-stone-500">Fabric</span>
                                 <span className="font-medium text-stone-900">{product.fabric}</span>
                             </div>
                             <div className="flex justify-between border-b border-stone-100 py-1">
                                 <span className="text-stone-500">Fit</span>
                                 <span className="font-medium text-stone-900">Regular</span>
                             </div>
                        </div>
                    </Accordion>
                    <Accordion title="Material & Care" icon={ShieldCheck}>
                        <p className="mb-2">Quality is our priority. This garment is made from premium {product.fabric}.</p>
                        <ul className="list-disc pl-4 space-y-1 text-stone-500">
                             <li>Machine wash cold with like colors</li>
                             <li>Do not bleach</li>
                             <li>Tumble dry low</li>
                             <li>Cool iron if needed</li>
                        </ul>
                    </Accordion>
                    <Accordion title="Shipping & Returns" icon={Truck}>
                         <p className="mb-2"><strong>Standard Delivery:</strong> 2-4 Business Days.</p>
                         <p>Please Check the product in front of the delivery person. Once they leave, we cannot take responsibility for any issues. (ডেলিভারি গ্রহণের আগে ডেলিভারি ম্যানের সামনে প্রোডাক্টটি চেক করে নিন। ডেলিভারি ম্যান চলে গেলে কোনো সমস্যা গ্রহণযোগ্য হবে না)</p>
                    </Accordion>
                </div>

            </div>
        </div>
      </main>

      {/* --- Mobile Sticky Bottom Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 lg:hidden z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
         <div className="flex gap-3 max-w-md mx-auto">
              {/* Quantity Small */}
              <div className="flex items-center border border-stone-200 rounded-md w-24 justify-between px-1 h-12 bg-white hidden xs:flex">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-stone-400 hover:text-pink-600 p-2"><Minus className="w-3 h-3"/></button>
                  <span className="font-bold text-stone-900 text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-stone-400 hover:text-pink-600 p-2"><Plus className="w-3 h-3"/></button>
              </div>

              {/* Add to Cart */}
              <button 
                  onClick={handleAddToCart} 
                  className="flex-1 bg-white border border-stone-300 text-stone-900 font-bold text-xs uppercase tracking-wide h-12 rounded-md hover:bg-stone-50 active:scale-95 transition flex items-center justify-center gap-2"
              >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden xs:inline">Add</span>
              </button>

              {/* Buy Now - Changed BG to Pink */}
              <button 
                  onClick={handleBuyNow} 
                  className="flex-[1.5] bg-pink-600 text-white font-bold text-xs uppercase tracking-wide h-12 rounded-md hover:bg-pink-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
              >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4" />
              </button>
         </div>
      </div>

       {/* Size Guide Modal */}
       {isSizeGuideOpen && settings.productPagePromoImage && (
            <div
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
                onClick={() => setIsSizeGuideOpen(false)}
            >
                {/* Increased max-width from max-w-lg to max-w-4xl for larger image */}
                <div className="relative max-w-4xl w-full bg-white shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    
                    {/* Header with Title and Close 'X' */}
                    <div className="flex justify-between items-center p-4 border-b border-stone-100">
                        <h3 className="text-lg font-bold text-stone-900">Size Guide</h3>
                        <button 
                            onClick={() => setIsSizeGuideOpen(false)} 
                            className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-600 transition"
                        >
                            <X className="w-5 h-5" /> 
                        </button>
                    </div>

                    {/* Scrollable Image Area */}
                    <div className="overflow-y-auto p-1 bg-stone-50 flex-1">
                        <img src={settings.productPagePromoImage} alt="Size Guide" className="w-full h-auto" />
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default ProductDetailsPage;
