import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessProduct } from '../types';
import {
  subscribeToOrders,
  createOrderInFirestore,
  updateOrderStatusInFirestore
} from '../services/firebase';

export interface CartItem {
  product: BusinessProduct;
  businessId: string;
  businessName: string;
  quantity: number;
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'bwana_wallet' | 'cash_on_delivery';

export interface Order {
  id: string;
  businessId: string;
  businessName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  platformSplitFee: number; // 1% Bwana platform split
  merchantPayout: number;   // 99% payout to merchant
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'received' | 'accepted' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber: string;
  courierName?: string;
  courierPhone?: string;
  createdAt: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: BusinessProduct, businessName: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  bwanaSplitFee: number; // 1% commission
  total: number;
  orders: Order[];
  createOrder: (orderDetails: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  walletBalance: number;
  addToWalletBalance: (amount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    businessId: 'biz-abc-hardware',
    businessName: 'ABC Hardware & Construction',
    items: [
      {
        product: {
          id: 'prod-1',
          businessId: 'biz-abc-hardware',
          name: 'Portland Composite Cement (Dangote 42.5N, 50kg)',
          price: 185,
          priceType: 'fixed',
          currency: 'ZMW',
          inStock: true,
          category: 'Building Materials',
        },
        businessId: 'biz-abc-hardware',
        businessName: 'ABC Hardware & Construction',
        quantity: 4,
      },
      {
        product: {
          id: 'prod-4',
          businessId: 'biz-abc-hardware',
          name: 'Industrial Heavy-Duty Angle Grinder 2300W',
          price: 1450,
          priceType: 'fixed',
          currency: 'ZMW',
          inStock: true,
          category: 'Power Tools',
        },
        businessId: 'biz-abc-hardware',
        businessName: 'ABC Hardware & Construction',
        quantity: 1,
      },
    ],
    subtotal: 2190,
    deliveryFee: 45,
    platformSplitFee: 21.90, // 1% of subtotal
    merchantPayout: 2168.10, // 99% of subtotal
    total: 2235,
    customerName: 'Mwamba Chisanga',
    customerPhone: '+260 97 711 8330',
    deliveryAddress: 'Plot 418, Riverside Ext, Kitwe',
    notes: 'Please call when offloading rebar and cement.',
    paymentMethod: 'mtn_momo',
    paymentStatus: 'paid',
    orderStatus: 'preparing',
    trackingNumber: 'BWN-KTW-8842',
    courierName: 'Kondwani Banda (Bwana Rider)',
    courierPhone: '+260 96 220 9140',
    createdAt: 'Today, 08:30 AM',
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bwana_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('bwana_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Synchronize orders with live Firestore database
  useEffect(() => {
    const unsubscribe = subscribeToOrders((liveOrders) => {
      if (liveOrders && liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bwana_wallet_balance');
      return saved ? parseFloat(saved) : 485.50; // K485.50 default starter float
    } catch {
      return 485.50;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bwana_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('bwana_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('bwana_wallet_balance', walletBalance.toString());
    } catch {}
  }, [walletBalance]);

  const addToCart = (product: BusinessProduct, businessName: string, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          businessId: product.businessId,
          businessName,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? 35 : 0; // Flat K35 courier delivery in Kitwe/Lusaka
  const bwanaSplitFee = Math.round(subtotal * 0.01 * 100) / 100; // 1% auto-split
  const total = subtotal + deliveryFee;

  const createOrder = ({
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    notes,
  }: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order | null => {
    if (items.length === 0) return null;

    const primaryBusinessId = items[0].businessId;
    const primaryBusinessName = items[0].businessName;
    const merchantPayout = subtotal - bwanaSplitFee;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      businessId: primaryBusinessId,
      businessName: primaryBusinessName,
      items: [...items],
      subtotal,
      deliveryFee,
      platformSplitFee: bwanaSplitFee,
      merchantPayout,
      total,
      customerName,
      customerPhone,
      deliveryAddress,
      notes,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      orderStatus: 'received',
      trackingNumber: `BWN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      courierName: 'Kondwani Banda (Bwana Verified Rider)',
      courierPhone: '+260 96 220 9140',
      createdAt: 'Just now',
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Persist to live Firestore database
    createOrderInFirestore(newOrder).catch((err) => {
      console.warn('Failed to persist order to Firestore:', err);
    });

    // If paid using Bwana Wallet, deduct balance
    if (paymentMethod === 'bwana_wallet') {
      setWalletBalance((prev) => Math.max(0, prev - total));
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
    updateOrderStatusInFirestore(orderId, status).catch((err) => {
      console.warn('Failed to update order status in Firestore:', err);
    });
  };

  const addToWalletBalance = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        bwanaSplitFee,
        total,
        orders,
        createOrder,
        updateOrderStatus,
        walletBalance,
        addToWalletBalance,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const defaultCartContext: CartContextType = {
  items: [],
  orders: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
  bwanaSplitFee: 0,
  total: 0,
  createOrder: () => ({
    id: '',
    businessId: '',
    businessName: '',
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    platformSplitFee: 0,
    merchantPayout: 0,
    total: 0,
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'pending',
    orderStatus: 'received',
    trackingNumber: '',
    createdAt: new Date().toISOString(),
  }),
  updateOrderStatus: () => {},
  walletBalance: 0,
  addToWalletBalance: () => {},
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return defaultCartContext;
  }
  return context;
};
