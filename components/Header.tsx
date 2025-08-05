'use client';

import Link from 'next/link';
import Image from 'next/image'; // Importăm componenta Image
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

const Header = () => {
  const { cartItems } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Eroare la delogare:", error);
    }
  };

  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ElectroMax Logo" width={40} height={40} />
              <span className="text-2xl font-bold text-white hidden sm:block">
                ElectroMax
              </span>
            </Link>
          </div>

          {/* Secțiunea dinamică: Auth + Coș */}
          <div className="flex items-center space-x-4">
            {isAuthLoading ? (
              <div className="h-5 w-40 bg-gray-700 rounded animate-pulse"></div>
            ) : user ? (
              <>
                <span className="text-gray-300 hidden sm:block">Salut, {user.displayName || 'Client'}!</span>
                <Link href="/account" className="text-gray-300 hover:text-white">Contul Meu</Link>
                <button onClick={handleLogout} className="text-gray-300 hover:text-white">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
                <Link href="/register" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
            
            {/* Coșul de cumpărături */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-700 transition-colors">
              <ShoppingCart className="h-6 w-6 text-gray-300" />
              {isClient && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;