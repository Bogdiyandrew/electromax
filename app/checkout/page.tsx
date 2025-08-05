'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';

// Cheia publică Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Componenta internă cu formularul
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems } = useCart();
  const { user } = useAuth();

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

    const pendingOrderData = {
      userId: user ? user.uid : null,
      shippingInfo,
      cartItems,
      total: totalAmount,
    };
    localStorage.setItem('pendingOrder', JSON.stringify(pendingOrderData));

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'A apărut o eroare la plată.');
      localStorage.removeItem('pendingOrder');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleFormSubmit}>
          {/* --- CARD INFORMAȚII DE LIVRARE (STILIZAT) --- */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Informații de Livrare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nume complet" onChange={handleInputChange} required className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500" />
              <input type="email" name="email" placeholder="Adresă de email" onChange={handleInputChange} required className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" name="address" placeholder="Adresă" onChange={handleInputChange} required className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 sm:col-span-2" />
              <input type="text" name="city" placeholder="Oraș" onChange={handleInputChange} required className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" name="state" placeholder="Județ" onChange={handleInputChange} required className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500" />
              <input type="text" name="zip" placeholder="Cod poștal" onChange={handleInputChange} required className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          
          {/* --- CARD INFORMAȚII DE PLATĂ (STILIZAT) --- */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-white">Informații de Plată</h2>
            <PaymentElement />
          </div>

          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800"
          >
            {isLoading ? 'Se procesează...' : `Plătește ${totalAmount.toFixed(2)} RON`}
          </button>
          {errorMessage && <p className="text-red-500 mt-4 text-center">{errorMessage}</p>}
        </form>
      </div>
      {/* --- CARD SUMAR COMANDĂ (STILIZAT) --- */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-white">Sumar Comandă</h2>
          <div className="space-y-4 text-gray-300">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} RON</span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-gray-700" />
          <div className="flex justify-between font-bold text-lg text-white">
            <span>Total</span>
            <span>{totalAmount.toFixed(2)} RON</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componenta principală
const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { cartItems } = useCart();
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (totalAmount > 0 && cartItems.length > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Stripe API error:', data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(err => console.error('Network or parsing error:', err));
    }
  }, [totalAmount, cartItems]);

  // --- AICI ESTE MODIFICAREA CHEIE PENTRU STRIPE ---
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { 
      theme: 'night', // Setăm tema întunecată a Stripe
      variables: {
        colorPrimary: '#3b82f6', // Potrivim culoarea de accent cu albastrul nostru
        colorBackground: '#1f2937', // Potrivim fundalul cu cel al cardurilor (gray-800)
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        borderRadius: '6px',
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Finalizare Comandă</h1>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      ) : (
        cartItems.length > 0 ? <p className="text-gray-400">Se încarcă formularul de plată...</p> : <p className="text-gray-400">Coșul tău este gol.</p>
      )}
    </div>
  );
};

export default CheckoutPage;