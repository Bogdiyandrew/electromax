'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/firebase/config'; // Am importat și 'db'
import { doc, getDoc } from 'firebase/firestore'; // Am importat funcțiile necesare pentru Firestore

// O funcție ajutătoare pentru a verifica rolul utilizatorului
const checkUserRole = async (user: User): Promise<string | null> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data().role || null;
    }
    return null; // Utilizatorul este autentificat, dar nu are document în 'users'
  } catch (error) {
    console.error("Eroare la verificarea rolului:", error);
    return null;
  }
};

// Acest layout va "îmbrăca" toate paginile din folderul (admin)
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => { // Am făcut funcția 'async'
      // Cazul 1: Utilizatorul este logat
      if (user) {
        // Verificăm rolul utilizatorului
        const role = await checkUserRole(user);

        if (role === 'admin') {
          // Utilizatorul este ADMIN, îi permitem accesul
          if (pathname === '/admin/login') {
            router.replace('/admin/dashboard');
          } else {
            setIsLoading(false);
          }
        } else {
          // Utilizatorul NU este admin, îl redirecționăm
          alert('Acces restricționat. Nu aveți permisiuni de administrator.');
          router.replace('/'); // Redirecționare către pagina principală
        }
      } 
      // Cazul 2: Utilizatorul NU este logat
      else {
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        } else {
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
        <p className="text-gray-600">Se verifică permisiunile...</p>
      </div>
    );
  }

  // Afișăm conținutul paginii
  return <>{children}</>;
}