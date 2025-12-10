
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { ShoppingCart, ChevronLeft, ChevronRight, Share2, Plus, Minus, ChevronDown, Truck, ShieldCheck, Ruler } from 'lucide-react';
import { useAppStore } from '../store';

// --- Reusable Components ---

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ElementType }> = ({ title, children, defaultOpen = false, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-stone-200">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-4 flex justify-between items-center text-left hover:bg-stone-50 transition px-2 -mx-2 rounded-lg group"
      >
        <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-stone-400 group-hover:text-stone-800 transition-colors" />}
            <span className="font-medium text-stone-900 text-sm sm:text-base tracking-wide uppercase">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-stone-600 text-sm leading-relaxed px-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Loader ---
const ProductDetailsPageSkeleton: React.FC = () => (
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-12 animate-pulse">
    <div className="lg:grid lg:grid-cols-12 lg:gap-12">
      {/* Gallery Skeleton */}
      <div className="lg:col-span-7 space-y-4">
        <div className="aspect-[2/3] bg-stone-200 rounded-xl w-full"></div>
        <div className="hidden lg:grid grid-cols-2 gap-4">
             <div className="aspect-[2/3] bg-stone-200 rounded-xl"></div>
             <div className="aspect-[2/3] bg-stone-200 rounded-xl"></div>
        </div>
      </div>
      {/* Info Skeleton */}
      <div className="lg:col-span-5 mt-8 lg:mt-0 space-y-6">
        <div className="h-4 bg-stone-200 rounded w-24"></div>
        <div className="h-8 bg-stone-200 rounded w-3/4"></div>
        <div className="h-6 bg-stone-200 rounded w-32"></div>
        <div className="h-px bg-stone-200 my-6"></div>
        <div className="h-10 bg-stone-200 rounded w-full"></div>
        <div className="h-12 bg-stone-200 rounded w-full mt-4"></div>
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

  // Swipe state for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Initial Data Fetch
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const pathId = pathParts[pathParts.length - 1];
    if (pathId && pathId !== 'product') {
         refreshProduct(pathId);
    }
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

  const handleNextImage = useCallback(() => {
    if (images.length > 0) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    if (images.length > 0) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Swipe handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
        notify("Please select a size first.", "error"); 
        return;
    }
    if (!product) return;
    
    addToCart(product, quantity, selectedSize);
    // Optional: Auto open cart or navigate
    // navigate('/cart'); 
  };

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

  if (loading && !product) return <ProductDetailsPageSkeleton />;
  
  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-stone-500 text-lg">Product not found.</p>
        <button onClick={() => navigate('/shop')} className="text-pink-600 font-medium hover:underline">Continue Shopping</button>
      </div>
    );
  }

  const originalPrice = product.price + 200;

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0 relative"> 
      
      {/* --- Mobile Top Bar --- */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 px-4 h-14 lg:hidden flex items-center justify-between">
        <button onClick={() => navigate('/shop')} className="p-2 -ml-2 text-stone-700 hover:text-pink-600 transition">
             <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-stone-800 text-sm truncate max-w-[60%]">Detail View</span>
        <button onClick={handleShare} className="p-2 -mr-2 text-stone-700 hover:text-pink-600 transition">
            <Share2 className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-[1400px] mx-auto lg:px-8 lg:pt-8">
        
        {/* --- Breadcrumb (Desktop) --- */}
        <nav className="hidden lg:flex items-center space-x-2 text-xs text-stone-500 mb-6 uppercase tracking-wider">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-pink-600 transition">Home</span>
            <ChevronRight className="w-3 h-3" />
            <span onClick={() => navigate('/shop')} className="cursor-pointer hover:text-pink-600 transition">Shop</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-20 items-start">
            
            {/* --- LEFT COLUMN: IMAGES --- */}
            <div className="lg:col-span-7">
                
                {/* Mobile: Horizontal Slider (Swipeable) */}
                <div 
                    className="lg:hidden relative bg-stone-100 w-full aspect-[2/3] overflow-hidden group touch-pan-y"
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
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                         {product.onSale && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Sale</span>}
                         {product.isNewArrival && <span className="bg-stone-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">New</span>}
                    </div>

                    {/* Dots Indicator */}
                    {images.length > 1 && (
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {images.map((_, idx) => (
                                <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-stone-800 scale-125' : 'bg-stone-400/70'}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop: Vertical Gallery List */}
                <div className="hidden lg:flex flex-col gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="w-full bg-stone-100 cursor-zoom-in relative group overflow-hidden" style={{ aspectRatio: '2/3' }}>
                             <img src={img} alt={`${product.name} - ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                             {index === 0 && product.onSale && <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Sale</span>}
                             {index === 0 && product.isNewArrival && <span className="absolute top-4 left-4 bg-stone-900 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider ml-14">New</span>}
                        </div>
                    ))}
                    {images.length === 0 && (
                         <div className="w-full bg-stone-100 flex items-center justify-center text-stone-400" style={{ aspectRatio: '2/3' }}>No Image</div>
                    )}
                </div>
            </div>

            {/* --- RIGHT COLUMN: DETAILS (Sticky on Desktop) --- */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 h-fit mt-6 lg:mt-0 px-4 sm:px-6 lg:px-0">
                
                <div className="space-y-4 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-medium text-stone-900 leading-tight">{product.name}</h1>
                    <div className="flex items-baseline gap-3">
                         <span className="text-xl sm:text-2xl font-semibold text-pink-600">৳{product.price.toLocaleString('en-IN')}</span>
                         {product.onSale && <span className="text-lg text-stone-400 line-through">৳{originalPrice.toLocaleString('en-IN')}</span>}
                    </div>
                </div>

                {/* Size Selector */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                         <span className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Size: <span className="text-stone-500 ml-1">{selectedSize === 'Free' ? 'Free Size' : selectedSize}</span></span>
                         {settings.productPagePromoImage && (
                            <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center text-xs font-medium text-stone-500 hover:text-stone-900 underline transition">
                                <Ruler className="w-3 h-3 mr-1"/> Size Guide
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
                                        h-12 min-w-[3rem] px-4 flex items-center justify-center text-sm font-medium transition-all duration-200 border
                                        ${isSelected 
                                            ? 'bg-stone-900 text-white border-stone-900' 
                                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
                                        }
                                        ${isFreeSizeOnly && size !== 'Free' ? 'opacity-40 cursor-not-allowed decoration-slice line-through' : ''}
                                    `}
                                >
                                    {size === 'Free' ? 'One Size' : size}
                                </button>
                             );
                        })}
                    </div>
                    {isFreeSizeOnly && <p className="text-xs text-stone-500 mt-2 italic">This style comes in a single size designed to fit most.</p>}
                </div>

                {/* Desktop: Add to Cart Action */}
                <div className="hidden lg:flex gap-4 mb-10">
                    <div className="flex items-center border border-stone-300 w-32 justify-between px-3 h-12">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-stone-500 hover:text-stone-900 p-1"><Minus className="w-4 h-4"/></button>
                        <span className="font-semibold text-stone-900">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="text-stone-500 hover:text-stone-900 p-1"><Plus className="w-4 h-4"/></button>
                    </div>
                    <button 
                        onClick={handleAddToCart} 
                        className="flex-1 bg-pink-600 text-white font-bold text-sm uppercase tracking-widest h-12 hover:bg-pink-700 transition duration-300 flex items-center justify-center gap-2"
                    >
                        <span>Add to Cart</span>
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>

                {/* Accordions */}
                <div className="space-y-0">
                    <Accordion title="Description" defaultOpen>
                        <p className="mb-2">{product.description}</p>
                        <ul className="list-disc pl-4 space-y-1 mt-2 text-stone-500">
                             <li>Premium quality finish</li>
                             <li>Comfortable fit for all day wear</li>
                        </ul>
                    </Accordion>
                    <Accordion title="Material & Care" icon={ShieldCheck}>
                        <p><span className="font-semibold text-stone-700">Fabric:</span> {product.fabric}</p>
                        <p className="mt-2">Machine wash cold with like colors. Do not bleach. Tumble dry low. Cool iron if needed.</p>
                    </Accordion>
                    <Accordion title="Delivery & Returns" icon={Truck}>
                         <p className="mb-2"><strong>Estimated Delivery:</strong> 2-4 Business Days.</p>
                         <p>We offer a 7-day return policy for unused and unaltered items. Shipping fees are non-refundable.</p>
                    </Accordion>
                </div>

            </div>
        </div>
      </main>

      {/* --- Mobile Sticky Bottom Action Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 lg:hidden z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="flex gap-3 max-w-md mx-auto">
              <div className="flex items-center border border-stone-300 rounded-lg w-28 justify-between px-2 h-12 bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-stone-500 hover:text-pink-600 p-1"><Minus className="w-4 h-4"/></button>
                  <span className="font-bold text-stone-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-stone-500 hover:text-pink-600 p-1"><Plus className="w-4 h-4"/></button>
              </div>
              <button 
                  onClick={handleAddToCart} 
                  className="flex-1 bg-pink-600 text-white font-bold text-sm uppercase tracking-wide h-12 rounded-lg hover:bg-pink-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
              >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
              </button>
         </div>
      </div>

       {/* Size Guide Modal */}
       {isSizeGuideOpen && settings.productPagePromoImage && (
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn"
                onClick={() => setIsSizeGuideOpen(false)}
            >
                <div className="relative max-w-lg w-full bg-white rounded-lg overflow-hidden shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-2 right-2 p-2 bg-white/50 rounded-full hover:bg-white text-stone-900">
                        <ChevronDown className="w-6 h-6 rotate-180" /> {/* Close icon lookalike or X */}
                    </button>
                    <img src={settings.productPagePromoImage} alt="Size Guide" className="w-full h-auto" />
                </div>
            </div>
        )}

    </div>
  );
};

export default ProductDetailsPage;
