import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inițializează Stripe cu cheia secretă din .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Definim structura unui produs din coș pentru siguranță
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { cartItems } = await req.json() as { cartItems: CartItem[] };

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Coșul este gol sau datele sunt invalide.' }, { status: 400 });
    }

    // Calculăm totalul pe server pentru a preveni manipularea prețului de către client
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountInCents = Math.round(total * 100); // Stripe lucrează cu subdiviziuni (cenți)

    // Creăm o "intenție de plată" la Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'ron', // Moneda este setată pe RON
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Trimitem înapoi către frontend "secretul" necesar pentru a finaliza plata
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    const err = error as Error;
    console.error("Stripe API Error:", err.message);
    // Returnează mereu JSON la eroare
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
