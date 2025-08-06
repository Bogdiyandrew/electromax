'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { auth, db } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import { useState, useEffect, useRef } from 'react'; // Am adăugat useRef
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';

const Header = () => {
  const { cartItems } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null); // Ref pentru a detecta click-urile în afara meniului

  // Efect pentru a prelua categoriile
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const fetchedCategories = querySnapshot.docs.map(doc => doc.data().category as string);
      setCategories([...new Set(fetchedCategories)]);
    };

    fetchCategories();
    setIsClient(true);
  }, []);

  // Efect pentru a închide meniul la click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Eroare la delogare:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ElectroMax Logo" width={40} height={40} />
              <span className="text-2xl font-bold text-white hidden sm:block">
                ElectroMax
              </span>
            </Link>

            {/* Meniu Categorii pe bază de CLICK */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="group inline-flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <span>Categorii</span>
                <ChevronDown 
                  className={`ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={`/category/${encodeURIComponent(category)}`}
                        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                        role="menuitem"
                        onClick={() => setIsCategoryMenuOpen(false)}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            {/* Bara de Căutare */}
            <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm"
                    placeholder="Caută produse..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </div>

            {/* Secțiunea Auth + Coș */}
            <div className="flex items-center space-x-4 ml-4">
              {isAuthLoading ? ( <div className="h-5 w-40 bg-gray-700 rounded animate-pulse"></div>) : user ? (
                <>
                  <span className="text-gray-300 hidden sm:block">Salut, {user.displayName || 'Client'}!</span>
                  <Link href="/account" className="text-gray-300 hover:text-white">Contul Meu</Link>
                  <button onClick={handleLogout} className="text-gray-300 hover:text-white">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-300 hover:text-white">Login</Link>
                  <Link href="/register" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Register</Link>
                </>
              )}
              
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
        </div>
      </nav>
    </header>
  );
};

export default Header;