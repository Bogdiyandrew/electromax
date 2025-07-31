'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext'; // Am importat și tipul CartItem
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';

// Încarcă cheia publică Stripe. Asigură-te că o adaugi în .env.local!
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Componenta principală a formularului de checkout
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    // Confirmă plata cu Stripe
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'A apărut o eroare.');
      setIsLoading(false);
      return;
    }

    // Obține clientSecret de la API-ul nostru
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems }),
    });

    const { clientSecret } = await res.json();

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: 'if_required', // Important: nu redirecționăm automat
    });

    if (error) {
      setErrorMessage(error.message || 'Plata a eșuat.');
    } else {
      // Plata a reușit! Salvăm comanda în Firestore.
      try {
        await addDoc(collection(db, 'orders'), {
          shippingInfo,
          cartItems,
          // CORECȚIE: Am adăugat tipuri explicite pentru a ajuta TypeScript
          total: cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
          createdAt: new Date(),
          status: 'pending',
        });
        clearCart();
        router.push('/order-confirmation'); // Redirecționăm la pagina de succes
      } catch (dbError) {
        setErrorMessage('Plata a reușit, dar a apărut o eroare la salvarea comenzii.');
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Informații de Livrare</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          {/* Câmpuri pentru nume, email, adresă, etc. */}
          <input name="name" type="text" required placeholder="Nume complet" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
          <input name="email" type="email" required placeholder="Adresă de email" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
          <input name="address" type="text" required placeholder="Adresă" onChange={handleInputChange} className="sm:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
          <input name="city" type="text" required placeholder="Oraș" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
          <input name="postalCode" type="text" required placeholder="Cod Poștal" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900">Detalii Plată</h2>
        <div className="mt-4">
          <PaymentElement />
        </div>
      </div>

      {errorMessage && <div className="text-red-600">{errorMessage}</div>}

      <button
        type="submit"
        disabled={isLoading || !stripe}
        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {isLoading ? 'Se procesează...' : 'Plătește Acum'}
      </button>
    </form>
  );
};

// Componenta principală a paginii
const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const { cartItems } = useCart();

  useEffect(() => {
    // Creăm un PaymentIntent de îndată ce pagina se încarcă
    if (cartItems.length > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [cartItems]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Finalizează comanda</h1>
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
