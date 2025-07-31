'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Definim structura unui produs din coș - ACUM ESTE EXPORTATĂ
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Definim ce va conține contextul nostru
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: string; name: string; price: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
}

// Creăm contextul cu o valoare implicită
const CartContext = createContext<CartContextType | undefined>(undefined);

// Creăm Provider-ul, componenta care va ține logica
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Încercăm să încărcăm coșul din localStorage la pornire
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Salvăm coșul în localStorage de fiecare dată când se modifică
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: { id: string; name: string; price: number }) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    alert(`"${product.name}" a fost adăugat în coș!`);
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Cantitatea nu poate fi mai mică de 1
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateItemQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Creăm un hook personalizat pentru a folosi contextul mai ușor
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
