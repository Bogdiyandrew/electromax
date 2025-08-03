'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase/config';

// Definim tipul pentru valorile din context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

// Creăm contextul cu o valoare inițială
const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

// Creăm Provider-ul. Acesta va "îmbrăca" aplicația noastră.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged este un listener de la Firebase.
    // El se declanșează ori de câte ori starea de autentificare se schimbă (login, logout).
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    // Curățăm listener-ul la demontarea componentei pentru a evita memory leaks
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isLoading,
  };

  // Oferim valorile (user, isLoading) tuturor componentelor copil
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Creăm un hook custom pentru a folosi contextul mai ușor în alte componente
export const useAuth = () => {
  return useContext(AuthContext);
};
