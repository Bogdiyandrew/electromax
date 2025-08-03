'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // 1. Importăm contextul de autentificare
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

const Header = () => {
  const { cartItems } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth(); // 2. Folosim hook-ul de autentificare
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 3. Adăugăm funcția de logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Eroare la delogare:", error);
    }
  };

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

          {/* 4. Secțiunea dinamică: Auth + Coș */}
          <div className="flex items-center space-x-4">
            {isAuthLoading ? (
              // Afișăm un placeholder în timp ce se verifică starea de auth
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              // Utilizatorul este logat
              <>
                <span className="text-gray-700 hidden sm:block">Salut, {user.displayName || 'Client'}!</span>
                <Link href="/account" className="text-gray-700 hover:text-indigo-600">Contul Meu</Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">
                  Logout
                </button>
              </>
            ) : (
              // Utilizatorul NU este logat
              <>
                <Link href="/login" className="text-gray-700 hover:text-indigo-600">Login</Link>
                <Link href="/register" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Register
                </Link>
              </>
            )}
            
            {/* Coșul de cumpărături rămâne neschimbat */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
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
