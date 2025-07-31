'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext'; // Asigură-te că calea este corectă
import { useState, useEffect } from 'react';

const Header = () => {
  const { cartItems } = useCart();
  const [isClient, setIsClient] = useState(false);

  // Acest efect rulează doar în browser, după ce componenta s-a încărcat
  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              ElectroMax
            </Link>
          </div>

          {/* Iconița Coș - Acum este un link! */}
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {/* Afișăm numărul doar dacă suntem în browser și coșul nu este gol */}
            {isClient && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
