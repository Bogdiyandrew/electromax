'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { ShoppingCart, Package, DollarSign } from 'lucide-react';

// Importăm componentele adiționale
import VerifyEmailNotice from '@/components/VerifyEmailNotice';
import SmsTest from '@/components/SmsTest';

// Definim interfața pentru Comenzi
interface Order {
  id: string;
  total: number;
  shippingInfo: { name: string };
  createdAt: Timestamp;
}

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({ totalRevenue: 0, orderCount: 0, productCount: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productCount = productsSnapshot.size;

        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        let totalRevenue = 0;
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          totalRevenue += data.total;
          return { id: doc.id, ...data } as Order;
        });
        
        setStats({ totalRevenue, orderCount: ordersSnapshot.size, productCount });
        setRecentOrders(ordersData.slice(0, 5));

      } catch (error) {
        console.error("Eroare la preluarea datelor pentru dashboard:", error);
        alert("Nu s-au putut încărca statisticile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Eroare la delogare:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Componenta de notificare pentru verificarea emailului */}
          <VerifyEmailNotice />

          {/* Componenta de test pentru trimiterea SMS */}
          <SmsTest />

          <div className="pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Bun venit în Panoul de Administrare!</h2>
            <p className="mt-2 text-gray-600">
              O privire de ansamblu asupra magazinului tău.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <p>Se încarcă statisticile...</p>
            ) : (
              <>
                <StatCard title="Venituri Totale" value={`${stats.totalRevenue.toFixed(2)} RON`} icon={<DollarSign className="h-6 w-6 text-green-600"/>} color="bg-green-100" />
                <StatCard title="Total Comenzi" value={stats.orderCount} icon={<ShoppingCart className="h-6 w-6 text-blue-600"/>} color="bg-blue-100" />
                <StatCard title="Produse în Stoc" value={stats.productCount} icon={<Package className="h-6 w-6 text-indigo-600"/>} color="bg-indigo-100" />
              </>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h3 className="text-lg font-medium text-gray-900">Acțiuni Rapide</h3>
              <div className="mt-4 flex flex-col gap-4">
                <Link href="/admin/products" className="block w-full text-center px-4 py-3 font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800">
                  Gestionează Produse
                </Link>
                <Link href="/admin/orders" className="block w-full text-center px-4 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Vezi Toate Comenzile
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900">Comenzi Recente</h3>
              <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
                {isLoading ? <p>Se încarcă...</p> : (
                  <ul className="divide-y divide-gray-200">
                    {recentOrders.map(order => (
                      <li key={order.id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.shippingInfo.name}</p>
                          <p className="text-xs text-gray-500">{order.id}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-semibold text-gray-800">{order.total.toFixed(2)} RON</p>
                           <Link href={`/admin/orders/${order.id}`} className="text-xs text-indigo-600 hover:underline">
                            Vezi detalii
                           </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
