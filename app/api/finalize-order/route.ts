import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb as db } from '@/firebase/admin-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body: { paymentIntentId?: string; orderData?: any } = await request.json();
    const { paymentIntentId, orderData } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'ID-ul plății este obligatoriu.' }, { status: 400 });
    }
    if (!orderData) {
        return NextResponse.json({ error: 'Datele comenzii sunt obligatorii.' }, { status: 400 });
    }

    // Verificăm dacă comanda a fost deja salvată pentru a evita duplicatele
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

    // Verificăm statusul plății la Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Plata nu a fost finalizată cu succes.' },
        { status: 400 }
      );
    }

    // Folosim datele trimise de client (din localStorage) pentru a crea comanda
    const finalOrderData = {
      userId: orderData.userId,
      shippingInfo: orderData.shippingInfo,
      cartItems: orderData.cartItems,
      total: orderData.total,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      status: 'În procesare', // Adăugăm un status inițial
      createdAt: new Date(), // Folosim data serverului pentru consistență
    };

    const newOrder = await db.collection('orders').add(finalOrderData);
    console.log('Comanda a fost salvată cu succes în Firestore cu ID-ul:', newOrder.id);

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Eroare necunoscută.';
    console.error('Eroare la finalizarea comenzii:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}