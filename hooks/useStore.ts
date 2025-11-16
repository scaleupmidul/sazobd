
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, CartItem, Notification, UseStore, Order, OrderStatus, ContactMessage, AppSettings } from '../types';

// Dynamically set the API URL based on the hostname.
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.');
const API_URL = isProduction 
    ? 'https://your-backend-service-name.onrender.com/api' // <-- IMPORTANT: Replace this with your actual Render backend URL
    : 'http://localhost:5000/api';

// Helper function to get data from our simulated "global" storage (localStorage) for cart
const getCartFromStorage = (): CartItem[] => {
    try {
        return JSON.parse(localStorage.getItem('sazo_cart') || '[]')
    } catch {
        return [];
    }
};
const setCartInStorage = (cart: CartItem[]): void => {
    localStorage.setItem('sazo_cart', JSON.stringify(cart));
};
const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('sazo_admin_token');
};

const DEFAULT_SETTINGS: AppSettings = {
    onlinePaymentInfo: '', codEnabled: true, onlinePaymentEnabled: true, onlinePaymentMethods: [],
    sliderImages: [], categoryImages: [], categories: [], shippingOptions: [], productPagePromoImage: '',
    contactAddress: '', contactPhone: '', contactEmail: '', whatsappNumber: '', showWhatsAppButton: false,
    socialMediaLinks: [], privacyPolicy: '', adminEmail: '', adminPassword: ''
};

export const useStore = (): UseStore => {
  const [path, setPath] = useState(window.location.pathname);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [cart, setCart] = useState<CartItem[]>(getCartFromStorage);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(!!getTokenFromStorage());

  const getAuthHeader = useCallback(() => {
    const token = getTokenFromStorage();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [productsRes, settingsRes] = await Promise.all([
                fetch(`${API_URL}/products`),
                fetch(`${API_URL}/settings`)
            ]);
            
            const productsData = await productsRes.json();
            const settingsData = await settingsRes.json();

            setProducts(productsData);
            setSettings(settingsData);
            
            if (isAdminAuthenticated) {
                 const [ordersRes, messagesRes] = await Promise.all([
                    fetch(`${API_URL}/orders`, { headers: getAuthHeader() }),
                    fetch(`${API_URL}/messages`, { headers: getAuthHeader() })
                ]);
                const ordersData = await ordersRes.json();
                const messagesData = await messagesRes.json();
                setOrders(ordersData);
                setContactMessages(messagesData);
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
            notify("Could not connect to the server.", "error");
        } finally {
            setLoading(false);
        }
    };
    loadInitialData();
  }, [isAdminAuthenticated]);

  useEffect(() => { setCartInStorage(cart); }, [cart]);

  const navigate = useCallback((newPath: string) => {
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    setPath(newPath);
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const adminPageCheck = path.startsWith('/admin') && path !== '/admin/login';
    if (adminPageCheck && !isAdminAuthenticated) {
        navigate('/admin/login');
    }
  }, [path, isAdminAuthenticated, navigate]);

  const notify = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, size: string) => {
    if (!size) {
      notify("Please select a size.", "error");
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        notify(`Quantity updated for ${product.name} (Size: ${size})!`, 'success');
        return prevCart.map(item =>
          item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id, name: product.name, price: product.price, quantity: quantity,
          image: product.images[0], size: size,
        };
        notify(`${product.name} (Size: ${size}) added to cart!`, 'success');
        return [...prevCart, newItem];
      }
    });
  }, [notify]);

  const updateCartQuantity = useCallback((id: number, size: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => !(item.id === id && item.size === size));
      }
      return prevCart.map(item =>
        item.id === id && item.size === size ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);

  const login = useCallback(async (email: string, password: string) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        const { token } = await res.json();
        localStorage.setItem('sazo_admin_token', token);
        setIsAdminAuthenticated(true);
        navigate('/admin/dashboard');
        notify('Login successful!', 'success');
        return true;
    } catch (error) {
        notify('Incorrect email or password.', 'error');
        return false;
    }
  }, [navigate, notify]);

  const logout = useCallback(() => {
    localStorage.removeItem('sazo_admin_token');
    setIsAdminAuthenticated(false);
    setOrders([]);
    setContactMessages([]);
    navigate('/');
    notify('You have been logged out.', 'success');
  }, [navigate, notify]);
  
  // API-driven data modification functions
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(productData),
    });
    const newProduct = await res.json();
    setProducts(prev => [newProduct, ...prev]);
    notify('Product added successfully!', 'success');
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    const res = await fetch(`${API_URL}/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updatedProduct),
    });
    const savedProduct = await res.json();
    setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
    notify('Product updated successfully!', 'success');
  };

  const deleteProduct = async (id: number) => {
    await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    setProducts(products.filter(p => p.id !== id));
    notify('Product deleted successfully.', 'success');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
    });
    const updatedOrder = await res.json();
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    notify(`Order ${orderId} status updated to ${status}.`, 'success');
  };

  const addOrder = async (
    customerDetails: { name: string; phone: string; address: string; city: string; }, 
    cartItems: CartItem[], 
    total: number,
    paymentInfo: { paymentMethod: 'COD' | 'Online'; paymentDetails?: any }
  ) => {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerDetails, cartItems, total, paymentInfo }),
    });
    const newOrder = await res.json();
    if(isAdminAuthenticated) setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const deleteOrder = async (orderId: string) => {
    await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    setOrders(orders.filter(order => order.id !== orderId));
    notify(`Order ${orderId} has been deleted.`, 'success');
  };
  
  const addContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'date' | 'isRead'>) => {
    await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
    });
    // No local state update needed for user, admin will see it on next load
  };

  const markMessageAsRead = async (messageId: string, isRead: boolean) => {
    const res = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ isRead }),
    });
    const updatedMessage = await res.json();
    setContactMessages(contactMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
    notify(`Message marked as ${isRead ? 'read' : 'unread'}.`, 'success');
  };

  const deleteContactMessage = async (messageId: string) => {
    await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
    });
    setContactMessages(contactMessages.filter(msg => msg.id !== messageId));
    notify('Message has been deleted.', 'success');
  };
  
  const updateSettings = async (newSettings: AppSettings) => {
    const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(newSettings),
    });
    const updatedSettings = await res.json();
    setSettings(updatedSettings);
    notify('Settings updated successfully!', 'success');
  };

  return {
    path, navigate, products, setProducts, addProduct, updateProduct, deleteProduct,
    cart, addToCart, updateCartQuantity, clearCart, cartTotal, selectedProduct, setSelectedProduct,
    notification, notify, orders, updateOrderStatus, addOrder, deleteOrder,
    isAdminAuthenticated, login, logout, contactMessages, addContactMessage, markMessageAsRead, deleteContactMessage,
    loading, settings, updateSettings,
  };
};