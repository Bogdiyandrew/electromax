'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { collection, addDoc, DocumentReference } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
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
    if (!stripe || !elements || !clientSecret) return;

    setIsLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'A apărut o eroare la trimiterea datelor.');
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: `${window.location.origin}/order-confirmation` },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Plata a eșuat.');
      setIsLoading(false);
    } else {
      try {
        // Pasul 1: Salvează comanda în Firestore
        const newOrderRef: DocumentReference = await addDoc(collection(db, 'orders'), {
          shippingInfo,
          cartItems,
          total: cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
          createdAt: new Date(),
          status: 'pending',
        });
        
        // #################################################################
        // ## MODIFICARE: Trimitem cererea către API-ul de email          ##
        // #################################################################
        // Pasul 2: Trimite email-ul de confirmare (nu așteptăm răspunsul)
        fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrderRef.id }), // Trimitem ID-ul comenzii noi
        }).catch(emailError => {
            // Chiar dacă email-ul eșuează, nu oprim clientul.
            // Putem loga eroarea pentru a o investiga mai târziu.
            console.error("Trimiterea email-ului de confirmare a eșuat:", emailError);
        });
        
        // Pasul 3: Curăță coșul și redirecționează
        clearCart();
        router.push('/order-confirmation');

      } catch (dbError) {
        console.error("Eroare la salvarea comenzii in Firestore:", dbError);
        setErrorMessage('Plata a reușit, dar a apărut o eroare la salvarea comenzii.');
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Informații de Livrare</h2>
        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
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

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const { cartItems } = useCart();

  useEffect(() => {
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
            <CheckoutForm clientSecret={clientSecret} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;