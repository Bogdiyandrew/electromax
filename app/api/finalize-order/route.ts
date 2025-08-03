import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'ID-ul plății este obligatoriu.' }, { status: 400 });
    }

    // Verificăm dacă o comandă cu acest ID de plată a fost deja salvată
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('paymentIntentId', '==', paymentIntentId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("Comanda a fost deja procesată anterior.");
      return NextResponse.json({ success: true, orderId: querySnapshot.docs[0].id, message: 'Comanda a fost deja procesată.' });
    }

    // Preluăm detaliile plății de la Stripe, inclusiv metadatele
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json({ error: 'Plata nu a fost finalizată cu succes.' }, { status: 400 });
    }

    // Extragem metadatele pe care le-am salvat la crearea PaymentIntent
    const metadata = paymentIntent.metadata;
    const cartItems = JSON.parse(metadata.cartItems || '[]');
    const shippingInfo = JSON.parse(metadata.shippingInfo || '{}');
    const userId = metadata.userId;

    // Construim obiectul final al comenzii
    const orderData = {
      userId: userId,
      shippingInfo,
      cartItems,
      total: paymentIntent.amount / 100, // Convertim înapoi din cenți
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      createdAt: new Date(paymentIntent.created * 1000), // Convertim timestamp-ul Stripe
    };

    // Salvăm comanda în Firestore
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log("Comanda a fost salvată cu succes în Firestore cu ID-ul:", docRef.id);

    // Aici poți adăuga logica de trimitere a emailului, dacă este necesar
    // await fetch('/api/send-confirmation-email', ...);

    return NextResponse.json({ success: true, orderId: docRef.id });

  } catch (error: any) {
    console.error('Eroare la finalizarea comenzii pe server:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
