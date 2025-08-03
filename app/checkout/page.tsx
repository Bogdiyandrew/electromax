'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Pasul 1: Încarcă Stripe. Asigură-te că ai cheia publică în fișierul .env.local
// Exemplu .env.local: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Pasul 2: Creăm componenta care conține formularul. 
// Aceasta va fi redată în interiorul provider-ului <Elements>.
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setErrorMessage("Stripe nu s-a încărcat corect.");
      return;
    }
    setIsLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message || 'A apărut o eroare la validarea datelor.');
      setIsLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
        receipt_email: shippingInfo.email,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'A apărut o eroare la plată.');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const orderData = {
          userId: user ? user.uid : null,
          shippingInfo,
          cartItems,
          total: totalAmount,
          paymentIntentId: paymentIntent.id,
          paymentStatus: paymentIntent.status,
          createdAt: new Date(),
        };

        await addDoc(collection(db, 'orders'), orderData);
        
        clearCart();
        router.push(`/order-confirmation?payment_intent=${paymentIntent.id}`);
      } catch (dbError) {
        console.error("Eroare la salvarea comenzii:", dbError);
        setErrorMessage("Plata a fost procesată, dar a apărut o eroare la salvarea comenzii.");
        setIsLoading(false);
      }
    } else {
       setErrorMessage("Plata nu a putut fi procesată.");
       setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleFormSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Informații de Livrare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nume complet" onChange={handleInputChange} required className="w-full p-2 border rounded" />
              <input type="email" name="email" placeholder="Adresă de email" onChange={handleInputChange} required className="w-full p-2 border rounded" />
              <input type="text" name="address" placeholder="Adresă" onChange={handleInputChange} required className="w-full p-2 border rounded sm:col-span-2" />
              <input type="text" name="city" placeholder="Oraș" onChange={handleInputChange} required className="w-full p-2 border rounded" />
              <input type="text" name="state" placeholder="Județ" onChange={handleInputChange} required className="w-full p-2 border rounded" />
              <input type="text" name="zip" placeholder="Cod poștal" onChange={handleInputChange} required className="w-full p-2 border rounded" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Informații de Plată</h2>
            <PaymentElement />
          </div>

          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Se procesează...' : `Plătește ${totalAmount.toFixed(2)} RON`}
          </button>
          {errorMessage && <p className="text-red-500 mt-4 text-center">{errorMessage}</p>}
        </form>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sumar Comandă</h2>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} RON</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{totalAmount.toFixed(2)} RON</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// Pasul 3: Componenta principală care încarcă datele și oferă contextul Elements
const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { cartItems } = useCart();
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (totalAmount > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount * 100 }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [totalAmount]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: 'stripe' },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Finalizare Comandă</h1>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
      {!clientSecret && cartItems.length > 0 && <p>Se încarcă formularul de plată...</p>}
      {cartItems.length === 0 && <p>Coșul tău este gol.</p>}
    </div>
  );
};

export default CheckoutPage;
