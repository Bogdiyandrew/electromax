import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb as db } from '@/firebase/admin-config';

// Tipuri
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
  state: string;
  zip: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body: { paymentIntentId?: string } = await request.json();
    const paymentIntentId = body.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'ID-ul plății este obligatoriu.' }, { status: 400 });
    }

    // Verificăm dacă comanda a fost deja salvată
    const ordersRef = db.collection('orders');
    const existingOrders = await ordersRef
      .where('paymentIntentId', '==', paymentIntentId)
      .get();

    if (!existingOrders.empty) {
      console.log('Comanda a fost deja procesată anterior.');
      return NextResponse.json({
        success: true,
        orderId: existingOrders.docs[0].id,
        message: 'Comanda a fost deja procesată.',
      });
    }

    // Preluăm detalii de plată de la Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Plata nu a fost finalizată cu succes.' },
        { status: 400 }
      );
    }

    const metadata = paymentIntent.metadata;
    const cartItems: CartItem[] = JSON.parse(metadata.cartItems || '[]');
    const shippingInfo: ShippingInfo = JSON.parse(metadata.shippingInfo || '{}');
    const userId: string | null = metadata.userId ?? null; // ✅ evită undefined

    const orderData = {
      userId,
      shippingInfo,
      cartItems,
      total: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      createdAt: new Date(paymentIntent.created * 1000),
    };

    const newOrder = await db.collection('orders').add(orderData);
    console.log('Comanda a fost salvată cu succes în Firestore cu ID-ul:', newOrder.id);

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Eroare la finalizarea comenzii:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error('Eroare necunoscută la finalizarea comenzii.');
      return NextResponse.json({ error: 'Eroare necunoscută.' }, { status: 500 });
    }
  }
}