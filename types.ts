
// FIX: Import Dispatch and SetStateAction types from React to resolve namespace errors.
import type { Dispatch, SetStateAction } from 'react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  fabric: string;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  isTrending: boolean;
  onSale: boolean;
  images: string[];
}

export interface CartItem {
  id: number;
  name:string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  cartItems: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod: 'COD' | 'Online';
  paymentDetails?: {
    paymentNumber: string;
    method: string;
    amount: number;
    transactionId: string;
  };
}

export interface SliderImage {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  image: string;
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface SliderImageSetting {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  image: string;
  mobileImage?: string;
}

export interface CategoryImageSetting {
  categoryName: string;
  image: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  charge: number;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface AppSettings {
  onlinePaymentInfo: string;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  onlinePaymentMethods: string[];
  sliderImages: SliderImageSetting[];
  categoryImages: CategoryImageSetting[];
  categories: string[];
  shippingOptions: ShippingOption[];
  productPagePromoImage: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  showWhatsAppButton: boolean;
  socialMediaLinks: SocialMediaLink[];
  privacyPolicy: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UseStore {
  path: string;
  navigate: (path: string) => void;
  products: Product[];
  // FIX: Use imported Dispatch and SetStateAction types instead of React.Dispatch and React.SetStateAction.
  setProducts: Dispatch<SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size: string) => void;
  updateCartQuantity: (id: number, size: string, newQuantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  selectedProduct: Product | null;
  // FIX: Use imported Dispatch and SetStateAction types instead of React.Dispatch and React.SetStateAction.
  setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
  notification: Notification | null;
  notify: (message: string, type?: 'success' | 'error') => void;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrder: (
    customerDetails: { name: string; phone: string; address: string; city: string; }, 
    cartItems: CartItem[], 
    total: number,
    paymentInfo: {
        paymentMethod: 'COD' | 'Online';
        paymentDetails?: {
            paymentNumber: string;
            method: string;
            amount: number;
            transactionId: string;
        }
    }
  ) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>;
  isAdminAuthenticated: boolean;
  // FIX: Change login function return type to Promise<boolean> to match its async implementation.
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  contactMessages: ContactMessage[];
  addContactMessage: (messageData: Omit<ContactMessage, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markMessageAsRead: (messageId: string, isRead: boolean) => Promise<void>;
  deleteContactMessage: (messageId: string) => Promise<void>;
  loading: boolean;
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
}