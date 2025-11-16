
import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '../StoreContext';
import { CheckCircle } from 'lucide-react';

interface ThankYouPageProps {
  orderId: string;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ orderId }) => {
    const { orders, navigate, loading } = useAppStore();
    
    const order = useMemo(() => {
      return orders.find(o => o.id === orderId);
    }, [orders, orderId]);

    useEffect(() => {
        if (order) {
            const shippingCharge = order.total - (order.cartItems || []).reduce((acc, item) => acc + item.price * item.quantity, 0);

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'purchase',
                ecommerce: {
                    transaction_id: order.id,
                    value: order.total,
                    shipping: shippingCharge,
                    currency: 'BDT',
                    items: (order.cartItems || []).map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        item_variant: item.size
                    })),
                    // Add customer information for detailed analytics and tracking
                    customer: {
                        name: order.customerName,
                        phone: order.phone,
                        address: order.address,
                        city: order.city
                    }
                }
            });
        }
    }, [order]);

    if (loading) {
        return (
            <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 min-h-screen">
                <div className="text-center p-8 mt-10">
                    <p>Loading order details...</p>
                </div>
            </main>
        );
    }
    
    if (!order) {
        return (
             <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8 min-h-screen">
                <div className="text-center p-8 bg-red-50 rounded-xl shadow-lg mt-10 border border-red-200">
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">Order Not Found</h2>
                    <p className="text-sm sm:text-base text-stone-600 mb-6">We couldn't find the details for this order. It might have been a temporary issue.</p>
                    <button onClick={() => navigate('/')} className="bg-pink-600 text-white font-medium px-6 py-2 rounded-full hover:bg-pink-700 transition duration-300 shadow-md active:scale-95">
                        Go to Homepage
                    </button>
                </div>
            </main>
        );
    }

    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="text-center p-6 sm:p-8 bg-green-50/50 rounded-xl shadow-lg mt-10 border border-green-200">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-sm sm:text-base text-stone-600 mb-4">Your order <span className="font-bold text-pink-600">{order.id}</span> has been received. We will call you shortly to confirm the details.</p>
          <p className="text-lg font-extrabold text-pink-600 mb-6">Total Price : ৳{order.total.toLocaleString('en-IN')}</p>
          
          <div className="my-6 text-left bg-white p-4 rounded-lg border border-stone-200">
            {(order.cartItems || []).map(item => (
                <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-xs border-b last:border-0 py-2">
                    <span className="text-stone-700">{item.name} (x{item.quantity})</span>
                    <span className="font-medium text-stone-800">৳{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
            ))}
          </div>

          <button onClick={() => navigate('/')} className="bg-pink-600 text-white font-medium px-8 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow active:scale-95">
            Continue Shopping
          </button>
        </div>
      </main>
    );
};

export default ThankYouPage;