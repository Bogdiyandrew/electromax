'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/app/context/AuthContext';

// Definim interfețele pentru o structură clară a datelor
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string; // Am adăugat județul
  zip: string;
}

interface OrderDetails {
  id: string;
  userId: string;
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  total: number;
  createdAt: Timestamp;
  status: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CustomerOrderDetailPage({ params }: any) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const orderId = params.id;

  useEffect(() => {
    if (isAuthLoading) return; // Așteptăm să se încarce starea de autentificare
    if (!user) {
      router.push('/login'); // Redirecționăm dacă nu e logat
      return;
    }
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() } as OrderDetails;

          // Securitate: Verificăm dacă comanda aparține utilizatorului logat
          if (orderData.userId !== user.uid) {
            setError("Nu aveți permisiunea de a vizualiza această comandă.");
          } else {
            setOrder(orderData);
          }
        } else {
          setError("Comanda nu a fost găsită.");
        }
      } catch (err) {
        console.error("Eroare la preluarea detaliilor comenzii: ", err);
        setError("A apărut o eroare la încărcarea datelor.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, isAuthLoading, router]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Dată invalidă';
    return timestamp.toDate().toLocaleString('ro-RO');
  };

  if (isLoading || isAuthLoading) return <div className="p-8 text-center">Se încarcă detaliile comenzii...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return <div className="p-8 text-center">Comanda nu a fost găsită.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/account" className="text-indigo-600 hover:text-indigo-800">
            &larr; Înapoi la contul meu
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalii Comandă</h1>
              <p className="text-sm text-gray-500">ID Comandă: #{order.id.substring(0, 8)}</p>
              <p className="text-sm text-gray-500">Dată: {formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
              Status: {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Adresă de livrare</h2>
              <p className="text-gray-600">{order.shippingInfo.name}</p>
              <p className="text-gray-600">{order.shippingInfo.address}</p>
              <p className="text-gray-600">{order.shippingInfo.city}, {order.shippingInfo.state}, {order.shippingInfo.zip}</p>
              <p className="text-gray-600">{order.shippingInfo.email}</p>
            </div>
          </div>

          <div className="border-t mt-6 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Produse Comandate</h2>
            <ul className="divide-y divide-gray-200">
              {order.cartItems.map(item => (
                <li key={item.id} className="flex py-4 justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Cantitate: {item.quantity}</p>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {(item.price * item.quantity).toFixed(2)} RON
                  </p>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t mt-6 pt-6 text-right">
            <p className="text-gray-600">Subtotal: {order.total.toFixed(2)} RON</p>
            <p className="text-gray-600">Livrare: 0.00 RON</p>
            <p className="text-xl font-bold text-gray-900 mt-2">Total: {order.total.toFixed(2)} RON</p>
          </div>
        </div>
      </div>
    </div>
  );
}