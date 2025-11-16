
import React, { useState, useEffect, useCallback } from 'react';
import { SliderImageSetting } from '../types';

interface HeroSliderProps {
    navigate: (path: string) => void;
    sliderImages: SliderImageSetting[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ navigate, sliderImages }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = sliderImages.length;

    const nextSlide = useCallback(() => {
        if (totalSlides > 0) {
            setCurrentSlide(prev => (prev + 1) % totalSlides);
        }
    }, [totalSlides]);

    useEffect(() => {
        const slideTimer = setInterval(nextSlide, 5000); 
        return () => clearInterval(slideTimer);
    }, [nextSlide]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    if (totalSlides === 0) {
        return (
            <section className="relative w-full aspect-[16/7] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No slides available. Add some in the admin settings.</p>
            </section>
        );
    }

    const activeSlide = sliderImages[currentSlide];

    return (
        <section className="relative w-full h-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/7] lg:aspect-[16/6] xl:aspect-[16/6] bg-gray-900">
            <div className="w-full h-full relative overflow-hidden">
                {sliderImages.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
                    >
                        <picture className="w-full h-full">
                            {slide.mobileImage && <source media="(max-width: 640px)" srcSet={slide.mobileImage} />}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="object-cover w-full h-full"
                            />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                    </div>
                ))}
            </div>
            
            <div key={currentSlide} className="absolute inset-0 flex items-center justify-start p-6 sm:p-10 md:p-16 z-20">
                <div className="max-w-md space-y-3 sm:space-y-4 text-white animate-fadeInUp">
                    <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-shadow ${activeSlide.color}`}>
                        {activeSlide.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-100 font-medium text-shadow">
                        {activeSlide.subtitle}
                    </p>
                    <div>
                      <button
                          onClick={() => navigate('/shop')}
                          className="mt-4 bg-pink-600 text-white text-sm sm:text-base font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                      >
                          Shop Now
                      </button>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {sliderImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-pink-600 w-6' : 'bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroSlider;