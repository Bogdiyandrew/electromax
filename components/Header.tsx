'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart } from 'lucide-react'; // Am importat iconița de căutare
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Important pentru a redirecționa utilizatorul

const Header = () => {
  const { cartItems } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Stare pentru textul din search
  const router = useRouter(); // Inițializăm router-ul

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

  // Funcția care se ocupă de căutare
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Oprește reîncărcarea paginii
    if (searchQuery.trim()) {
      // Redirecționează utilizatorul către o pagină de rezultate
      // Exemplu: /search?q=produsul_meu
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

          {/* Bara de Căutare (NOU) */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                  placeholder="Caută produse..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
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