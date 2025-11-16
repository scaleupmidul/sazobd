
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../StoreContext';

const InputField: React.FC<{ label: string; name: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; required?: boolean; placeholder?: string; }> = 
({ label, name, type = 'text', value, onChange, required = true, placeholder }) => (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-stone-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black" />
    </div>
);

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, navigate, clearCart, notify, addOrder, settings } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: settings.codEnabled ? 'COD' : settings.onlinePaymentEnabled ? 'Online' : '',
    shippingOptionId: settings.shippingOptions[0]?.id || '',
    paymentNumber: '',
    onlinePaymentMethod: 'Choose',
    transactionId: '',
  });

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
            currency: 'BDT',
            value: cartTotal,
            items: cart.map(item => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
                item_variant: item.size
            }))
        }
    });
  }, [cart, cartTotal]);
  
  // Effect to update default payment method if settings change (e.g., admin disables COD)
  useEffect(() => {
    const isCurrentMethodDisabled = 
        (formData.paymentMethod === 'COD' && !settings.codEnabled) || 
        (formData.paymentMethod === 'Online' && !settings.onlinePaymentEnabled);

    if (isCurrentMethodDisabled || !formData.paymentMethod) {
        setFormData(prev => ({
            ...prev,
            paymentMethod: settings.codEnabled ? 'COD' : settings.onlinePaymentEnabled ? 'Online' : ''
        }));
    }
  }, [settings.codEnabled, settings.onlinePaymentEnabled, formData.paymentMethod]);

  const selectedShippingOption = useMemo(() => {
    return settings.shippingOptions.find(opt => opt.id === formData.shippingOptionId) || settings.shippingOptions[0];
  }, [formData.shippingOptionId, settings.shippingOptions]);

  const shippingCharge = selectedShippingOption?.charge || 0;
  const totalPayable = cartTotal + shippingCharge;
  
  const noPaymentMethodAvailable = !settings.codEnabled && !settings.onlinePaymentEnabled;
  const noShippingMethodAvailable = settings.shippingOptions.length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
        return false;
    }
    if (!formData.shippingOptionId) {
        return false;
    }
    if (formData.paymentMethod === 'Online' && settings.onlinePaymentEnabled) {
        if (!formData.paymentNumber.trim() || formData.onlinePaymentMethod === 'Choose' || !formData.transactionId.trim()) {
            return false;
        }
    }
    if (noPaymentMethodAvailable || noShippingMethodAvailable) {
        return false;
    }
    return true;
  }, [formData, settings.onlinePaymentEnabled, noPaymentMethodAvailable, noShippingMethodAvailable]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) {
        notify("Please fill in all required fields.", "error");
        return;
    }
    if (cartTotal === 0) {
      notify("Your cart is empty. Cannot place an order.", "error");
      return;
    }

    const paymentInfo = {
        paymentMethod: formData.paymentMethod as 'COD' | 'Online',
        paymentDetails: formData.paymentMethod === 'Online' ? {
            paymentNumber: formData.paymentNumber,
            method: formData.onlinePaymentMethod,
            amount: totalPayable,
            transactionId: formData.transactionId
        } : undefined
    };
    
    const newOrder = await addOrder(
      { name: formData.name, phone: formData.phone, address: formData.address, city: formData.city },
      cart,
      totalPayable,
      paymentInfo
    );

    clearCart();
    navigate(`/thank-you/${newOrder.id}`);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8 text-center">Checkout</h2>
      <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
        
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-stone-200 lg:sticky top-24 h-fit order-1 lg:order-2 mb-6 lg:mb-0">
          <h3 className="text-xl font-bold text-stone-900 mb-4">Order Totals</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Cart Subtotal</span>
              <span>৳{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-600 border-b border-stone-200 pb-2">
              <span className="font-semibold">Shipping ({selectedShippingOption?.label || 'Not selected'})</span>
              <span>৳{shippingCharge.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-stone-900">Total Payable</span>
            <span className="text-xl sm:text-2xl font-extrabold text-pink-600">৳{totalPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-lg border border-stone-200 order-2 lg:order-1">
          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Your Name" />
              <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g., 017XX XXX XXX" />
              <InputField label="Full Delivery Address" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., House 1, Road 2, Block A, Gulshan" />
              <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Dhaka" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4 pt-4">Select Delivery Area</h3>
            <div className="space-y-3">
              {settings.shippingOptions.length > 0 ? settings.shippingOptions.map((option) => (
                <div key={option.id} className="p-4 bg-white rounded-lg border border-stone-300">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center space-x-3">
                      <input type="radio" name="shippingOptionId" value={option.id} checked={formData.shippingOptionId === option.id} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600" />
                      <span className="font-semibold text-stone-700 text-sm">{option.label}</span>
                    </span>
                    <span className="font-bold text-stone-900 text-sm">{option.charge.toLocaleString('en-IN')} ৳</span>
                  </label>
                </div>
              )) : (
                   <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                       No shipping options are currently available. Please contact our support team for assistance.
                   </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4 pt-4">Payment Method</h3>
            <div className="space-y-3">
               {settings.codEnabled && (
                  <div className="p-4 bg-white rounded-lg border border-stone-300">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600" />
                      <div>
                        <span className="font-semibold text-stone-700 text-sm">Cash on Delivery (COD)</span>
                        <p className="text-xs text-stone-500 hidden sm:block">Pay upon receiving the product</p>
                      </div>
                    </label>
                  </div>
                )}
                {settings.onlinePaymentEnabled && (
                  <div className="p-4 bg-white rounded-lg border border-stone-300">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="paymentMethod" value="Online" checked={formData.paymentMethod === 'Online'} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600" />
                       <div>
                         <span className="font-semibold text-stone-700 text-sm">Online Payment</span>
                         {settings.onlinePaymentMethods.length > 0 && (
                            <p className="text-xs text-stone-500 hidden sm:block">{settings.onlinePaymentMethods.join(' / ')}</p>
                         )}
                       </div>
                    </label>
                  </div>
                )}
                 {noPaymentMethodAvailable && (
                   <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                       No payment methods are currently available. Please contact our support team for assistance.
                   </div>
                )}
            </div>
          </div>
            
          {formData.paymentMethod === 'Online' && settings.onlinePaymentEnabled && (
            <div className="mt-6 pt-6 border-t border-stone-200 space-y-4 animate-scaleIn bg-pink-50/50 rounded-xl shadow-inner p-6">
              <div className="text-center py-3 sm:p-4 bg-pink-100 rounded-lg">
                <div className="whitespace-pre-wrap text-sm font-semibold text-stone-800 leading-relaxed">{settings.onlinePaymentInfo}</div>
              </div>

              <div className="space-y-1">
                <label htmlFor="paymentNumber" className="text-sm font-medium text-stone-700">Your sending number <span className="text-red-500">*</span></label>
                <input type="tel" id="paymentNumber" name="paymentNumber" value={formData.paymentNumber} onChange={handleChange} required={formData.paymentMethod === 'Online'} placeholder="e.g., 017XX XXX XXX" className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black" />
              </div>

              <div className="space-y-1">
                  <label htmlFor="onlinePaymentMethod" className="text-sm font-medium text-stone-700">Payment Method <span className="text-red-500">*</span></label>
                  <select id="onlinePaymentMethod" name="onlinePaymentMethod" value={formData.onlinePaymentMethod} onChange={handleChange} required={formData.paymentMethod === 'Online'} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black">
                      <option value="Choose" disabled>Choose</option>
                      {settings.onlinePaymentMethods.map(method => (
                         <option key={method} value={method}>{method}</option>
                      ))}
                  </select>
              </div>

              <div className="space-y-1">
                  <label htmlFor="transactionId" className="text-sm font-medium text-stone-700">Transaction ID <span className="text-red-500">*</span></label>
                  <input type="text" id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleChange} required={formData.paymentMethod === 'Online'} placeholder="e.g., 9K8G7F6H5J" className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-sm bg-white text-black" />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isFormValid} 
            className={`w-full text-white text-lg font-bold px-6 py-3 rounded-full transition duration-300 shadow flex items-center justify-center space-x-2 active:scale-95 mt-6 ${isFormValid ? 'bg-pink-600 hover:bg-pink-700 cursor-pointer' : 'bg-pink-300 cursor-not-allowed'}`}
          >
            <span>Place Order</span>
          </button>
        </form>

      </div>
    </main>
  );
};

export default CheckoutPage;