
import React from 'react';
import { useAppStore } from '../StoreContext';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
    const { settings } = useAppStore();

    const socialIcons: { [key: string]: React.ElementType } = {
        Facebook: Facebook,
        Instagram: Instagram,
        Twitter: Twitter,
        Youtube: Youtube,
        YouTube: Youtube,
        Linkedin: Linkedin,
        LinkedIn: Linkedin,
    };

    const validSocialLinks = settings.socialMediaLinks.filter(link => link.url && link.url.trim() !== '' && link.url.trim() !== '#');

    return (
      <footer className="bg-stone-900 text-stone-300 mt-16 sm:mt-24">
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {/* About Section */}
                <div>
                    <h3 onClick={() => navigate('/')} className="sazo-logo text-2xl font-semibold text-white mb-4 cursor-pointer">SAZO</h3>
                    <p className="text-sm leading-relaxed text-stone-400">
                        Discover elegance and style with SAZO. We bring you the finest collections of women's wear, crafted with passion and precision for the modern woman.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-semibold text-white mb-4 tracking-wider uppercase text-sm">Quick Links</h4>
                    <nav className="flex flex-col space-y-2 text-sm">
                        <button onClick={() => navigate('/')} className="hover:text-pink-400 transition text-left w-fit">Home</button>
                        <button onClick={() => navigate('/shop')} className="hover:text-pink-400 transition text-left w-fit">Shop All</button>
                        <button onClick={() => navigate('/contact')} className="hover:text-pink-400 transition text-left w-fit">Contact</button>
                        <button onClick={() => navigate('/policy')} className="hover:text-pink-400 transition text-left w-fit">Privacy Policy</button>
                    </nav>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="font-semibold text-white mb-4 tracking-wider uppercase text-sm">Contact Us</h4>
                    <div className="space-y-2 text-sm text-stone-400">
                        {settings.contactAddress && <p>{settings.contactAddress}</p>}
                        {settings.contactPhone && <p className="pt-1">{settings.contactPhone}</p>}
                        {settings.contactEmail && <p className="pt-1">{settings.contactEmail}</p>}
                    </div>
                </div>

                {/* Social Media */}
                <div>
                    <h4 className="font-semibold text-white mb-4 tracking-wider uppercase text-sm">Follow Us</h4>
                     {validSocialLinks.length > 0 ? (
                        <div className="flex space-x-4">
                            {validSocialLinks.map(link => {
                                const Icon = socialIcons[link.platform];
                                return Icon ? (
                                    <a 
                                        key={link.platform} 
                                        href={link.url} 
                                        aria-label={link.platform} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:text-pink-400 transition"
                                    >
                                        <Icon size={20} />
                                    </a>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-stone-400">No social links configured.</p>
                    )}
                </div>
            </div>
        </div>
        <div className="bg-black/30 py-4">
            <div className="px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-400">
                <p>&copy; {new Date().getFullYear()} SAZO. All rights reserved.</p>
            </div>
        </div>
      </footer>
    );
};

export default Footer;