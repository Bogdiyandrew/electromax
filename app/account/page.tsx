'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

// Definim o interfață pentru datele comenzii
interface Order {
  id: string;
  total: number;
  createdAt: Timestamp;
  // Adaugă alte câmpuri dacă este necesar, ex: status
}

const AccountPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Efect pentru a proteja ruta și a redirecționa dacă nu există utilizator
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Efect pentru a prelua comenzile utilizatorului
  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const ordersQuery = query(
            collection(db, 'orders'), 
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(ordersQuery);
          const userOrders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Order));
          
          setOrders(userOrders);
        } catch (error) {
          console.error("Eroare la preluarea comenzilor:", error);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    if (user) {
        fetchOrders();
    }
  }, [user]);

  if (isAuthLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-400">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Contul Meu</h1>
      
      {/* Secțiunea cu detaliile contului */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Detalii Cont</h2>
        <div className="space-y-2 text-gray-300">
          <p><strong>Nume:</strong> {user.displayName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>

      {/* Secțiunea cu istoricul comenzilor */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Istoric Comenzi</h2>
        {isLoadingOrders ? (
          <p className="text-gray-400">Se încarcă istoricul comenzilor...</p>
        ) : orders.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {orders.map(order => (
              <li key={order.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">Comanda #{order.id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-400">
                    Data: {new Date(order.createdAt.seconds * 1000).toLocaleDateString('ro-RO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-200">{order.total.toFixed(2)} RON</p>
                  <Link href={`/order/${order.id}`} className="text-sm text-blue-500 hover:underline">
                    Vezi detalii
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Nu ai plasat nicio comandă până acum.</p>
        )}
      </div>
    </div>
  );
};

export default AccountPage;