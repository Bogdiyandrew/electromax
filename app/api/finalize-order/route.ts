import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Interfețe pentru tipizare
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  // Poți adăuga aici alte proprietăți ex: imageUrl
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

    // Verificăm dacă comanda există deja
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('paymentIntentId', '==', paymentIntentId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("Comanda a fost deja procesată anterior.");
      return NextResponse.json({
        success: true,
        orderId: querySnapshot.docs[0].id,
        message: 'Comanda a fost deja procesată.'
      });
    }

    // Obținem detalii de la Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Plata nu a fost finalizată cu succes.' }, { status: 400 });
    }

    const metadata = paymentIntent.metadata;
    const cartItems = JSON.parse(metadata.cartItems || '[]') as CartItem[];
    const shippingInfo = JSON.parse(metadata.shippingInfo || '{}') as ShippingInfo;
    const userId = metadata.userId;

    const orderData = {
      userId,
      shippingInfo,
      cartItems,
      total: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      createdAt: new Date(paymentIntent.created * 1000),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log("Comanda a fost salvată cu succes în Firestore cu ID-ul:", docRef.id);

    return NextResponse.json({ success: true, orderId: docRef.id });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Eroare la finalizarea comenzii pe server:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error('Eroare necunoscută la finalizarea comenzii.');
      return NextResponse.json({ error: 'A apărut o eroare necunoscută.' }, { status: 500 });
    }
  }
}