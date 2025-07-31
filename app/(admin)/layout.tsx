'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';

// Acest layout va "îmbrăca" toate paginile din folderul (admin)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Obținem calea curentă

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Cazul 1: Utilizatorul este logat
      if (user) {
        // Dacă este logat și încearcă să acceseze pagina de login,
        // îl redirecționăm la panoul de control.
        if (pathname === '/admin/login') {
          router.replace('/admin/dashboard');
        } else {
          // Altfel, este pe o pagină protejată, deci oprim încărcarea.
          setIsLoading(false);
        }
      } 
      // Cazul 2: Utilizatorul NU este logat
      else {
        // Dacă nu este logat și NU este pe pagina de login,
        // îl redirecționăm acolo.
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        } else {
          // Altfel, este deja pe pagina de login, deci oprim încărcarea.
          setIsLoading(false);
        }
      }
    });

    // Curățăm "ascultătorul"
    return () => unsubscribe();
  }, [router, pathname]);

  // Afișăm mesajul de încărcare cât timp facem verificarea
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Se verifică autentificarea...</p>
      </div>
    );
  }

  // Afișăm conținutul paginii
  return <>{children}</>;
}
