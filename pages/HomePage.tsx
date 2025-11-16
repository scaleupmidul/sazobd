
import React from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import { useAppStore } from '../StoreContext';

interface HomePageProps {
  products: Product[];
  navigate: (path: string) => void;
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-3xl sm:text-4xl text-center text-stone-900 mb-8 sm:mb-12">
    {title}
  </h2>
);

const HomePage: React.FC<HomePageProps> = ({ products, navigate }) => {
  const { settings } = useAppStore();
  const { sliderImages, categoryImages, categories } = settings;

  const getCategoryImage = (categoryName: string) => {
    const category = categoryImages.find(c => c.categoryName === categoryName);
    return category ? category.image : 'https://picsum.photos/seed/sazo-default-category/600/800';
  };

  const allNewArrivals = products.filter(p => p.isNew);
  const allTrendingProducts = products.filter(p => p.isTrending);
  const newArrivalsDisplay = allNewArrivals.slice(0, 4);
  const trendingProductsDisplay = allTrendingProducts.slice(0, 4);

  return (
    <>
      {/* Hero Slider is moved outside of main to be full-width and flush with the header */}
      <HeroSlider navigate={navigate} sliderImages={sliderImages} />

      <main className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <section className="mb-16 sm:mb-24">
          <SectionTitle title="New Arrivals" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivalsDisplay.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)}
          </div>
          {allNewArrivals.length > 4 && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={() => navigate('/shop')}
                className="border border-pink-600 text-pink-600 font-medium px-8 py-3 rounded-full hover:bg-pink-600 hover:text-white transition duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                View All New Arrivals
              </button>
            </div>
          )}
        </section>

        <section className="mb-16 sm:mb-24">
          <SectionTitle title="Trending Products" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingProductsDisplay.map(p => <ProductCard key={p.id} product={p} navigate={navigate} />)}
          </div>
          {allTrendingProducts.length > 4 && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={() => navigate('/shop')}
                 className="border border-pink-600 text-pink-600 font-medium px-8 py-3 rounded-full hover:bg-pink-600 hover:text-white transition duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                View All Trending Products
              </button>
            </div>
          )}
        </section>

        <section className="mb-16 sm:mb-24">
          <SectionTitle title="Explore By Category" />
          <div className="flex flex-wrap justify-center -mx-2 sm:-mx-3">
            {categories.map(cat => (
              <div key={cat} className="w-1/2 md:w-1/3 lg:w-1/4 p-2 sm:p-3">
                <div className="relative overflow-hidden rounded-lg group cursor-pointer aspect-[3.5/4]" onClick={() => navigate('/shop')}>
                  <img
                    src={getCategoryImage(cat)}
                    alt={cat}
                    className="object-cover w-full h-full transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:bg-black/50 transition duration-300 flex items-center justify-center p-8">
                    <h3 className="text-2xl font-semibold text-white tracking-wider">
                      {cat}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;