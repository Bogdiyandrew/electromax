'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { db } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

// Componenta internă care conține logica principală
const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('processing');
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const pendingOrderJSON = localStorage.getItem('pendingOrder');

    if (!paymentIntentId || !pendingOrderJSON) {
      setError('Datele comenzii nu au fost găsite. Este posibil să fi reîmprospătat pagina.');
      setStatus('failed');
      return;
    }

    const saveOrder = async () => {
      try {
        // Verificăm dacă o comandă cu acest ID de plată a fost deja salvată
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('paymentIntentId', '==', paymentIntentId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Comanda a fost deja salvată.");
          setOrderId(querySnapshot.docs[0].id);
          setStatus('succeeded');
          localStorage.removeItem('pendingOrder');
          clearCart();
          return;
        }

        // Dacă nu a fost salvată, o salvăm acum
        const pendingOrder = JSON.parse(pendingOrderJSON);
        const orderData = {
          ...pendingOrder,
          paymentIntentId: paymentIntentId,
          paymentStatus: 'succeeded',
          createdAt: new Date(pendingOrder.createdAt), // Convertim înapoi în obiect Date
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        setOrderId(docRef.id);

        // Trimitem emailul de confirmare
        await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderDetails: { id: docRef.id, ...orderData },
            userEmail: orderData.shippingInfo.email,
          }),
        });

        // Curățăm datele temporare
        localStorage.removeItem('pendingOrder');
        clearCart();
        setStatus('succeeded');

      } catch (err) {
        console.error("Eroare la finalizarea comenzii:", err);
        setError("A apărut o eroare la salvarea comenzii. Vă rugăm contactați suportul.");
        setStatus('failed');
      }
    };

    saveOrder();
  }, [searchParams, clearCart]);

  if (status === 'processing') {
    return <p className="text-center text-lg">Se procesează comanda...</p>;
  }

  if (status === 'failed') {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Eroare la procesarea comenzii</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Înapoi la pagina principală
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Comanda a fost plasată cu succes!</h1>
      <p className="text-gray-700 mb-2">Vă mulțumim pentru comanda dumneavoastră.</p>
      {orderId && <p className="text-gray-500 mb-6">Numărul comenzii este: #{orderId.substring(0, 8)}</p>}
      <p className="text-gray-600 mb-6">Veți primi în curând un email de confirmare cu detaliile comenzii.</p>
      <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Continuă cumpărăturile
      </Link>
    </div>
  );
};

// Componenta principală care folosește Suspense pentru a accesa parametrii URL
const OrderConfirmationPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <Suspense fallback={<p className="text-center text-lg">Se încarcă...</p>}>
          <OrderConfirmationContent />
        </Suspense>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
