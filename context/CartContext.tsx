'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  // MODIFICARE: Funcția acceptă acum și stocul maxim
  addToCart: (product: { id: string; name: string; price: number; stock: number }, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // #################################################################
  // ## MODIFICARE MAJORĂ: Logica de adăugare validează acum stocul  ##
  // #################################################################
  const addToCart = (product: { id: string; name: string; price: number; stock: number }, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Verificăm dacă noua cantitate totală depășește stocul
        if (newQuantity > product.stock) {
          alert(`Stoc insuficient! Poți adăuga maxim ${product.stock} bucăți pentru "${product.name}". Momentan ai deja ${existingItem.quantity} în coș.`);
          // Nu modificăm coșul dacă stocul este depășit
          return prevItems;
        }
        // Dacă stocul permite, actualizăm cantitatea
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        // Dacă produsul nu există, îl adăugăm cu cantitatea specificată (deja validată pe pagina produsului)
        return [...prevItems, { id: product.id, name: product.name, price: product.price, quantity }];
      }
    });
    // Afișăm alerta doar dacă adăugarea s-a făcut (nu se execută dacă stocul e depășit)
    if (!cartItems.find(item => item.id === product.id && item.quantity + quantity > product.stock)) {
      alert(`"${product.name}" (x${quantity}) a fost adăugat în coș!`);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};