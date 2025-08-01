'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

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
  postalCode: string;
}

interface OrderDetails {
  id: string;
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  total: number;
  createdAt: Timestamp;
  status: string;
}

// Folosim `params` pentru a prelua ID-ul din URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function OrderDetailPage({ params }: any) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // #################################################################
  // ## State-uri noi pentru managementul statusului              ##
  // #################################################################
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const orderId = params.id;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() } as OrderDetails;
          setOrder(orderData);
          setSelectedStatus(orderData.status); // Inițializăm select-ul cu statusul curent
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
  }, [orderId]);

  // #################################################################
  // ## Funcție nouă pentru a actualiza statusul în Firestore       ##
  // #################################################################
  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: selectedStatus
      });
      // Actualizăm și starea locală pentru a reflecta imediat schimbarea
      if (order) {
        setOrder({ ...order, status: selectedStatus });
      }
      alert("Statusul comenzii a fost actualizat cu succes!");
    } catch (err) {
      console.error("Eroare la actualizarea statusului: ", err);
      alert("Nu s-a putut actualiza statusul comenzii.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Dată invalidă';
    return timestamp.toDate().toLocaleString('ro-RO');
  };

  if (isLoading) return <div className="p-8 text-center">Se încarcă detaliile comenzii...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!order) return <div className="p-8 text-center">Comanda nu a fost găsită.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/orders" className="text-indigo-600 hover:text-indigo-800">
            &larr; Înapoi la toate comenzile
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalii Comandă</h1>
              <p className="text-sm text-gray-500">ID Comandă: {order.id}</p>
              <p className="text-sm text-gray-500">Dată: {formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${order.status === 'Finalizat' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Client</h2>
              <p className="text-gray-600">{order.shippingInfo.name}</p>
              <p className="text-gray-600">{order.shippingInfo.email}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Adresă de livrare</h2>
              <p className="text-gray-600">{order.shippingInfo.address}</p>
              <p className="text-gray-600">{order.shippingInfo.city}, {order.shippingInfo.postalCode}</p>
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
          
          <div className="border-t mt-6 pt-6 flex justify-between items-center">
            {/* ################################################################# */}
            {/* ## Componente noi pentru actualizarea statusului             ## */}
            {/* ################################################################# */}
            <div className="flex items-center gap-4">
               <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              >
                <option value="pending">Pending</option>
                <option value="În procesare">În procesare</option>
                <option value="Expediat">Expediat</option>
                <option value="Finalizat">Finalizat</option>
                <option value="Anulat">Anulat</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isUpdating ? 'Se actualizează...' : 'Actualizează Status'}
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-gray-600">Subtotal: {order.total.toFixed(2)} RON</p>
              <p className="text-gray-600">Livrare: 0.00 RON</p>
              <p className="text-xl font-bold text-gray-900 mt-2">Total: {order.total.toFixed(2)} RON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}