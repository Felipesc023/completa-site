
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartItemQuantity: (productId: string, size: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('completa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('completa_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }, [items]);

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, selectedSize: size }];
    });
  };

  const updateCartItemQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems(prev => prev.map(item => 
      (item.id === productId && item.selectedSize === size)
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const cartTotal = items.reduce((sum, item) => {
      const price = item.promoPrice || item.price;
      return sum + (price * item.quantity);
  }, 0);
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateCartItemQuantity, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
