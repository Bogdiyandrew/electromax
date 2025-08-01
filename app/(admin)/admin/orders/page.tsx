'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Definim o interfață pentru structura unei comenzi
interface Order {
  id: string;
  shippingInfo: {
    name: string;
    email: string;
  };
  total: number;
  createdAt: Timestamp; // Folosim tipul Timestamp din Firebase
  status: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Creăm o interogare pentru a sorta comenzile de la cea mai nouă la cea mai veche
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(ordersQuery);
        
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Eroare la preluarea comenzilor: ", err);
        setError("Nu s-au putut încărca comenzile. Vă rugăm să încercați din nou.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800">
            &larr; Înapoi la Panoul de Control
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestionare Comenzi</h1>
          
          {isLoading ? (
            <p className="text-gray-600">Se încarcă comenzile...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600">Nu a fost găsită nicio comandă.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dată</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acțiuni</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.shippingInfo.name}</div>
                        <div className="text-sm text-gray-500">{order.shippingInfo.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt.seconds * 1000).toLocaleDateString('ro-RO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.total.toFixed(2)} RON
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Detalii</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;