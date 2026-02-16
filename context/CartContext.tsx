import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartItemQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('completa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('completa_cart', JSON.stringify(items));
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      
      if (existing) {
        showToast("Quantidade atualizada na sacola");
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size && item.selectedColor === color)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      setIsCartOpen(true);
      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const updateCartItemQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) return; // Não remove se chegar a 1 conforme solicitado
    setItems(prev => prev.map(item => 
      (item.id === productId && item.selectedSize === size && item.selectedColor === color)
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setItems(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const cartTotal = items.reduce((sum, item) => {
    const price = item.promoPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateCartItemQuantity, 
      cartTotal, 
      cartCount, 
      isCartOpen, 
      setIsCartOpen,
      toastMessage
    }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-dark text-white px-6 py-3 rounded-lg shadow-2xl z-[100] animate-slide-up text-xs font-medium uppercase tracking-widest">
          {toastMessage}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};