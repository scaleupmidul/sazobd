
import React, { useState } from 'react';
import { useAppStore } from '../../StoreContext';
import { Save, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { SliderImageSetting, CategoryImageSetting, ShippingOption, SocialMediaLink } from '../../types';

// Tab Button Component
const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
            isActive
                ? 'bg-pink-600 text-white shadow'
                : 'text-gray-600 hover:bg-pink-100 hover:text-pink-700'
        }`}
    >
        {label}
    </button>
);

const AdminSettingsPage: React.FC = () => {
    const { settings, updateSettings, notify } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    
    // State for Admin Credentials
    const [adminEmail, setAdminEmail] = useState(settings.adminEmail || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // State for Payment Settings
    const [onlinePaymentInfo, setOnlinePaymentInfo] = useState(settings.onlinePaymentInfo || '');
    const [codEnabled, setCodEnabled] = useState(settings.codEnabled ?? true);
    const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(settings.onlinePaymentEnabled ?? true);
    const [onlinePaymentMethodsText, setOnlinePaymentMethodsText] = useState(settings.onlinePaymentMethods?.join(', ') || '');
    
    // State for Shipping Settings
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>(settings.shippingOptions || []);

    // State for Appearance Settings
    const [sliderImages, setSliderImages] = useState<SliderImageSetting[]>(settings.sliderImages || []);
    const [promoImage, setPromoImage] = useState(settings.productPagePromoImage || '');

    // State for Content Settings
    const [managedCategories, setManagedCategories] = useState<string[]>(settings.categories || []);
    const [categoryImages, setCategoryImages] = useState<CategoryImageSetting[]>(settings.categoryImages || []);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>(settings.socialMediaLinks || []);
    const [newSocialPlatform, setNewSocialPlatform] = useState('');
    const [newSocialUrl, setNewSocialUrl] = useState('');
    const [privacyPolicy, setPrivacyPolicy] = useState(settings.privacyPolicy || '');

    // State for Contact Page
    const [contactAddress, setContactAddress] = useState(settings.contactAddress || '');
    const [contactPhone, setContactPhone] = useState(settings.contactPhone || '');
    const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
    const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
    const [showWhatsAppButton, setShowWhatsAppButton] = useState(settings.showWhatsAppButton ?? true);

    const handleImageUpload = (file: File, callback: (base64: string) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                callback(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSliderChange = (index: number, field: keyof SliderImageSetting, value: string) => {
        const newSliders = [...sliderImages];
        (newSliders[index] as any)[field] = value;
        setSliderImages(newSliders);
    };

    const addSlider = () => {
        setSliderImages([...sliderImages, { id: Date.now(), title: '', subtitle: '', color: 'text-pink-600', image: '', mobileImage: '' }]);
    };

    const removeSlider = (id: number) => {
        setSliderImages(sliderImages.filter(slider => slider.id !== id));
    };
    
    const addCategory = () => {
        if (newCategoryName && !managedCategories.includes(newCategoryName)) {
            const newCategoriesList = [...managedCategories, newCategoryName];
            setManagedCategories(newCategoriesList);
            setCategoryImages([...categoryImages, { categoryName: newCategoryName, image: '' }]);
            setNewCategoryName('');
        }
    };

    const removeCategory = (categoryNameToRemove: string) => {
        setManagedCategories(managedCategories.filter(cat => cat !== categoryNameToRemove));
        setCategoryImages(categoryImages.filter(img => img.categoryName !== categoryNameToRemove));
    };

    const getCategoryImageForAdmin = (categoryName: string) => {
        return categoryImages.find(c => c.categoryName === categoryName)?.image || '';
    };

    const setCategoryImageForAdmin = (categoryName: string, image: string) => {
        const existingIndex = categoryImages.findIndex(c => c.categoryName === categoryName);
        if (existingIndex > -1) {
            const updated = [...categoryImages];
            updated[existingIndex].image = image;
            setCategoryImages(updated);
        } else {
            setCategoryImages([...categoryImages, { categoryName, image }]);
        }
    };

    const handleShippingOptionChange = (id: string, field: 'label' | 'charge', value: string | number) => {
        const newOptions = shippingOptions.map(option => {
            if (option.id === id) {
                return { ...option, [field]: value };
            }
            return option;
        });
        setShippingOptions(newOptions);
    };

    const addShippingOption = () => {
        setShippingOptions([...shippingOptions, { id: `so-${Date.now()}`, label: '', charge: 0 }]);
    };

    const removeShippingOption = (id: string) => {
        setShippingOptions(shippingOptions.filter(option => option.id !== id));
    };

    const handleSocialMediaLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
        const newLinks = [...socialMediaLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSocialMediaLinks(newLinks);
    };

    const addSocialMediaLink = () => {
        if (newSocialPlatform.trim() && newSocialUrl.trim()) {
            const isDuplicate = socialMediaLinks.some(link => link.platform.toLowerCase() === newSocialPlatform.trim().toLowerCase());
            if (isDuplicate) {
                notify("A link for this platform already exists.", "error");
                return;
            }
            setSocialMediaLinks([...socialMediaLinks, { platform: newSocialPlatform.trim(), url: newSocialUrl.trim() }]);
            setNewSocialPlatform('');
            setNewSocialUrl('');
        } else {
            notify("Please provide both a platform name and a URL.", "error");
        }
    };

    const removeSocialMediaLink = (indexToRemove: number) => {
        setSocialMediaLinks(socialMediaLinks.filter((_, index) => index !== indexToRemove));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmNewPassword) {
            notify("New passwords do not match.", "error");
            return;
        }
        setIsSaving(true);
        await updateSettings({ 
            ...settings, 
            adminEmail,
            adminPassword: newPassword ? newPassword : settings.adminPassword,
            onlinePaymentInfo, 
            codEnabled, 
            onlinePaymentEnabled,
            onlinePaymentMethods: onlinePaymentMethodsText.split(',').map(m => m.trim()).filter(Boolean),
            shippingOptions,
            sliderImages,
            categories: managedCategories,
            categoryImages,
            productPagePromoImage: promoImage,
            contactAddress,
            contactPhone,
            contactEmail,
            whatsappNumber,
            showWhatsAppButton,
            socialMediaLinks,
            privacyPolicy,
        });
        setNewPassword('');
        setConfirmNewPassword('');
        setIsSaving(false);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Admin Credentials</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                                <input type="email" id="adminEmail" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" />
                                <p className="text-xs text-gray-500 mt-1">The email used to log into the admin panel.</p>
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" />
                                <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current password.</p>
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Contact Page & Chat Button</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <input type="text" id="contactAddress" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" />
                            </div>
                            <div>
                                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input type="text" id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" />
                            </div>
                            <div>
                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" />
                            </div>
                             <div>
                                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                                <input type="text" id="whatsappNumber" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" placeholder="+8801..." />
                                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +880). This will enable the floating chat button.</p>
                            </div>
                             <div className="p-4 bg-gray-50 rounded-lg border">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="font-medium text-sm text-gray-800">Show Floating Chat Button</span>
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only peer" checked={showWhatsAppButton} onChange={(e) => setShowWhatsAppButton(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                                    </div>
                                </label>
                                 <p className="text-xs text-gray-500 mt-1">If enabled, a floating message button will appear on the website.</p>
                            </div>
                        </div>
                    </div>
                </>
            );
            case 'payments': return (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Payment Settings</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="onlinePaymentInfo" className="block text-sm font-medium text-gray-700 mb-2">Online Payment Information</label>
                                <textarea id="onlinePaymentInfo" value={onlinePaymentInfo} onChange={(e) => setOnlinePaymentInfo(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black h-24" rows={3}/>
                                <p className="text-xs text-gray-500 mt-1">Displayed on the checkout page. Use line breaks for new lines.</p>
                            </div>
                            <div>
                                <h3 className="block text-sm font-medium text-gray-700 mb-2">Payment Method Availability</h3>
                                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                                    <label className="flex items-center"><input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="h-5 w-5 text-pink-600 rounded" /><span className="ml-3 text-sm text-black">Enable COD</span></label>
                                    <label className="flex items-center"><input type="checkbox" checked={onlinePaymentEnabled} onChange={(e) => setOnlinePaymentEnabled(e.target.checked)} className="h-5 w-5 text-pink-600 rounded" /><span className="ml-3 text-sm text-black">Enable Online Payment</span></label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="onlinePaymentMethods" className="block text-sm font-medium text-gray-700 mb-2">Online Payment Options</label>
                                <input type="text" id="onlinePaymentMethods" value={onlinePaymentMethodsText} onChange={(e) => setOnlinePaymentMethodsText(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black" placeholder="e.g., Bkash, Nagad, UPAY" />
                                <p className="text-xs text-gray-500 mt-1">Comma-separated list for the checkout dropdown.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Shipping Settings</h2>
                        <div className="space-y-4">
                            {shippingOptions.map((option) => (
                                <div key={option.id} className="p-4 bg-gray-50 rounded-lg border flex flex-col md:flex-row items-center gap-4 relative">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Label</label>
                                        <input type="text" value={option.label} onChange={(e) => handleShippingOptionChange(option.id, 'label', e.target.value)} className="w-full p-2 border rounded bg-white text-black" placeholder="e.g., Inside Dhaka" />
                                    </div>
                                    <div className="w-full md:w-40">
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Charge (৳)</label>
                                        <input type="number" value={option.charge} onChange={(e) => handleShippingOptionChange(option.id, 'charge', Number(e.target.value))} className="w-full p-2 border rounded bg-white text-black" placeholder="e.g., 80" />
                                    </div>
                                    <button type="button" onClick={() => removeShippingOption(option.id)} className="md:absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addShippingOption} className="mt-4 bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Add Shipping Option</span></button>
                    </div>
                </>
            );
            case 'appearance': return (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Homepage Slider</h2>
                        <div className="space-y-4">
                            {sliderImages.map((slider, index) => (
                                <div key={slider.id} className="p-4 bg-gray-50 rounded-lg border space-y-3 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input value={slider.title} onChange={(e) => handleSliderChange(index, 'title', e.target.value)} placeholder="Title" className="p-2 border rounded w-full bg-white text-black" />
                                        <input value={slider.subtitle} onChange={(e) => handleSliderChange(index, 'subtitle', e.target.value)} placeholder="Subtitle" className="p-2 border rounded w-full bg-white text-black" />
                                        <input value={slider.color} onChange={(e) => handleSliderChange(index, 'color', e.target.value)} placeholder="Color Class (e.g., text-pink-600)" className="p-2 border rounded w-full bg-white text-black" />
                                    </div>
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 border-t pt-4 mt-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Desktop Image</label>
                                            <div className="flex items-center gap-4">
                                                <img src={slider.image} alt="Slider" className="w-24 h-12 object-cover rounded-lg flex-shrink-0"/>
                                                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], (base64) => handleSliderChange(index, 'image', base64))} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Image</label>
                                            <div className="flex items-center gap-4">
                                                <img src={slider.mobileImage} alt="Mobile Slider" className="w-12 h-16 object-cover rounded-lg flex-shrink-0"/>
                                                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], (base64) => handleSliderChange(index, 'mobileImage', base64))} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeSlider(slider.id)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addSlider} className="mt-4 bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 flex items-center space-x-2"><Plus className="w-4 h-4" /><span>Add Slide</span></button>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Product Page Promo Banner</h2>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-4">
                                <img src={promoImage} alt="Promo banner" className="w-32 h-16 object-cover rounded-lg flex-shrink-0"/>
                                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], (base64) => setPromoImage(base64))} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>
                            </div>
                        </div>
                    </div>
                </>
            );
            case 'content': return (
                <>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Homepage Categories</h2>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex gap-2 mb-4 pb-4 border-b">
                                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New Category Name" className="flex-grow p-2 border rounded w-full bg-white text-black" />
                                <button type="button" onClick={addCategory} className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 flex items-center space-x-2 flex-shrink-0"><Plus className="w-4 h-4" /><span>Add</span></button>
                            </div>
                            <div className="space-y-4">
                                 {managedCategories.map((catName) => (
                                    <div key={catName} className="p-4 bg-white rounded-lg border flex flex-col sm:flex-row items-center gap-4 relative">
                                        <span className="font-semibold text-gray-800 w-full sm:w-40 text-left">{catName}</span>
                                        <div className="flex items-center gap-4 flex-1 w-full">
                                            <img src={getCategoryImageForAdmin(catName)} alt="Category" className="w-20 h-20 object-cover rounded-lg flex-shrink-0"/>
                                            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], (base64) => setCategoryImageForAdmin(catName, base64))} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                                        </div>
                                         <button type="button" onClick={() => removeCategory(catName)} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Social Media Links</h2>
                        <div className="space-y-4">
                            {socialMediaLinks.map((link, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg border flex flex-col md:flex-row items-center gap-4 relative">
                                    <div className="w-full md:w-40">
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Platform</label>
                                        <input type="text" value={link.platform} onChange={(e) => handleSocialMediaLinkChange(index, 'platform', e.target.value)} className="w-full p-2 border rounded bg-white text-black" placeholder="e.g., Facebook"/>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="text-xs font-medium text-gray-700 block mb-1">URL</label>
                                        <input type="url" value={link.url} onChange={(e) => handleSocialMediaLinkChange(index, 'url', e.target.value)} className="w-full p-2 border rounded bg-white text-black" placeholder="https://..."/>
                                    </div>
                                    <button type="button" onClick={() => removeSocialMediaLink(index)} className="md:absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-md font-semibold text-gray-700 mb-3">Add New Social Link</h3>
                            <div className="flex flex-col md:flex-row gap-2 items-end">
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-medium text-gray-700 block mb-1">Platform Name</label>
                                    <input value={newSocialPlatform} onChange={(e) => setNewSocialPlatform(e.target.value)} placeholder="e.g., YouTube" className="w-full p-2 border rounded bg-white text-black"/>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="text-xs font-medium text-gray-700 block mb-1">Full URL</label>
                                    <input value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} placeholder="https://..." className="w-full p-2 border rounded bg-white text-black" />
                                </div>
                                <button type="button" onClick={addSocialMediaLink} className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 flex items-center space-x-2 w-full md:w-auto mt-2 md:mt-0"><Plus className="w-4 h-4" /><span>Add Link</span></button>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Privacy Policy Page</h2>
                        <textarea value={privacyPolicy} onChange={(e) => setPrivacyPolicy(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white text-black h-64" />
                        <p className="text-xs text-gray-500 mt-1">This content will be displayed on the Privacy Policy page.</p>
                    </div>
                </>
            );
            default: return null;
        }
    };

    return (
        <div>
            <form onSubmit={handleSave}>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <aside className="w-full md:w-1/4 md:sticky top-6">
                        <div className="bg-white p-2 rounded-lg shadow-md space-y-1">
                            <TabButton label="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                            <TabButton label="Payments & Shipping" isActive={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                            <TabButton label="Appearance" isActive={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                            <TabButton label="Content" isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                        </div>
                    </aside>
                    <main className="w-full md:w-3/4">
                        <div className="space-y-8 animate-fadeIn" key={activeTab}>
                            {renderTabContent()}
                        </div>
                    </main>
                </div>
                <div className="flex justify-end sticky bottom-6 mt-8">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-pink-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-pink-700 transition flex items-center space-x-2 disabled:bg-pink-400"
                    >
                        {isSaving ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="font-bold">{isSaving ? 'Saving...' : 'Save All Settings'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;