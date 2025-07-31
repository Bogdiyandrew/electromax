import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inițializează Stripe cu cheia secretă. Asigură-te că o adaugi în .env.local!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { cartItems } = await req.json() as { cartItems: CartItem[] };

    // Calculăm totalul pe server pentru a preveni manipularea prețului de către client
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountInCents = Math.round(total * 100); // Stripe lucrează cu cenți

    // Creăm o intenție de plată
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'ron',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Trimitem înapoi "secretul" necesar pentru a finaliza plata în frontend
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
