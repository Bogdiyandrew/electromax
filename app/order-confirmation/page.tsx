'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

const OrderConfirmationPage = () => {
  const { clearCart } = useCart();

  // Golim coșul o singură dată, la încărcarea paginii de confirmare.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
          Mulțumim pentru comandă!
        </h1>
        <p className="mt-2 text-gray-600">
          Comanda ta a fost plasată cu succes. Vei primi în curând un e-mail de confirmare cu detaliile.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-6 py-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Înapoi la magazin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
