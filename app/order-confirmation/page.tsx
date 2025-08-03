'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

// Componenta internă care conține logica principală
const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('processing'); // Stări posibile: 'processing', 'succeeded', 'failed'
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
      setStatus('failed');
      setError('ID-ul plății lipsește. Tranzacția nu poate fi confirmată.');
      return;
    }

    const finalizeOrder = async () => {
      try {
        // Apelăm noul API endpoint pentru a finaliza comanda pe server
        const response = await fetch('/api/finalize-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Dacă răspunsul de la API nu este "ok", aruncăm o eroare cu mesajul de la server
          throw new Error(data.error || 'A apărut o eroare la finalizarea comenzii.');
        }
        
        // Comanda a fost procesată și salvată cu succes pe server
        setOrderId(data.orderId);
        setStatus('succeeded');
        clearCart(); // Golim coșul doar după ce totul a reușit

      } catch (err: any) {
        console.error("Eroare la finalizarea comenzii:", err);
        setError(err.message || "A apărut o eroare la salvarea comenzii. Vă rugăm contactați suportul.");
        setStatus('failed');
      }
    };

    finalizeOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Rulează o singură dată, la încărcarea paginii

  if (status === 'processing') {
    return <p className="text-center text-lg">Se finalizează comanda... Vă rugăm nu închideți fereastra.</p>;
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
