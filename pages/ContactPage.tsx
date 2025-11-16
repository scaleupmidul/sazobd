
import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useAppStore } from '../StoreContext';

interface ContactPageProps {
  notify: (message: string, type?: 'success' | 'error') => void;
}

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; isTextarea?: boolean; required?: boolean; }> = 
({ label, name, type = 'text', value, onChange, isTextarea = false, required = true }) => (
    <div className="space-y-1.5">
        <label htmlFor={name} className="text-sm font-medium text-stone-700">{label} {required && <span className="text-red-500">*</span>}</label>
        {isTextarea ? (
             <textarea id={name} name={name} rows={4} value={value} onChange={onChange} required={required} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black" />
        ) : (
            <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black" />
        )}
    </div>
);

const ContactPage: React.FC<ContactPageProps> = ({ notify }) => {
    const { addContactMessage, settings } = useAppStore();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addContactMessage({
              name: formData.name,
              email: formData.email,
              message: formData.message,
            });
            notify("Thank you! Your message has been sent successfully.", "success");
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            notify("Failed to send message. Please try again later.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8 text-center">Get in Touch</h2>
            <div className="lg:grid lg:grid-cols-3 lg:gap-8 max-w-7xl mx-auto">
                <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-xl shadow-lg border border-stone-200 h-fit mb-6 lg:mb-0">
                    <h3 className="text-xl font-bold text-pink-600 mb-4">Our Contact Details</h3>
                    {settings.contactAddress && (
                        <div className="flex items-start space-x-4">
                            <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-stone-800 text-sm">Address</p>
                                <p className="text-sm text-stone-600">{settings.contactAddress}</p>
                            </div>
                        </div>
                    )}
                    {settings.contactPhone && (
                        <div className="flex items-start space-x-4">
                            <Phone className="w-5 h-5 text-pink-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-stone-800 text-sm">Phone</p>
                                <p className="text-sm text-stone-600">{settings.contactPhone}</p>
                            </div>
                        </div>
                    )}
                    {settings.contactEmail && (
                        <div className="flex items-start space-x-4">
                            <Mail className="w-5 h-5 text-pink-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-stone-800 text-sm">Email</p>
                                <p className="text-sm text-stone-600">{settings.contactEmail}</p>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-stone-200">
                    <h3 className="text-xl font-bold text-stone-800 mb-4">Send Us a Message</h3>
                    <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
                    <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                    <InputField label="Message" name="message" value={formData.message} onChange={handleChange} required isTextarea={true} />
                    <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 text-white text-base font-bold px-6 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow flex items-center justify-center space-x-2 active:scale-95 disabled:bg-pink-400 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ContactPage;