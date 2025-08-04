import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  FirestoreDataConverter
} from 'firebase/firestore';

// Definim interfețe pentru a asigura tipizarea corectă a datelor
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

// Definim interfața pentru o Comandă
interface Order {
  userId: string | null;
  shippingInfo: ShippingInfo;
  cartItems: CartItem[];
  total: number;
  paymentIntentId: string;
  paymentStatus: string;
  createdAt: Date;
}

// ✅ CORECȚIE FINALĂ: Creăm un "converter" pentru a elimina complet tipul 'any'
const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore(order: Order): DocumentData {
    return { ...order };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Order {
    const data = snapshot.data(options);
    return {
      userId: data.userId,
      shippingInfo: data.shippingInfo,
      cartItems: data.cartItems,
      total: data.total,
      paymentIntentId: data.paymentIntentId,
      paymentStatus: data.paymentStatus,
      createdAt: data.createdAt.toDate(),
    };
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body: { paymentIntentId?: string } = await request.json();
    const paymentIntentId = body.paymentIntentId;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'ID-ul plății este obligatoriu.' }, { status: 400 });
    }

    // Folosim converter-ul pentru a avea tipuri de date stricte
    const ordersRef = collection(db, 'orders').withConverter(orderConverter);
    const q = query(ordersRef, where('paymentIntentId', '==', paymentIntentId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("Comanda a fost deja procesată anterior.");
      return NextResponse.json({ success: true, orderId: querySnapshot.docs[0].id, message: 'Comanda a fost deja procesată.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json({ error: 'Plata nu a fost finalizată cu succes.' }, { status: 400 });
    }

    const metadata = paymentIntent.metadata;
    const cartItems = JSON.parse(metadata.cartItems || '[]') as CartItem[];
    const shippingInfo = JSON.parse(metadata.shippingInfo || '{}') as ShippingInfo;
    const userId = metadata.userId;

    const orderData: Order = {
      userId: userId,
      shippingInfo,
      cartItems,
      total: paymentIntent.amount / 100,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      createdAt: new Date(paymentIntent.created * 1000),
    };

    const docRef = await addDoc(ordersRef, orderData);
    console.log("Comanda a fost salvată cu succes în Firestore cu ID-ul:", docRef.id);

    return NextResponse.json({ success: true, orderId: docRef.id });

  } catch (error: unknown) {
    console.error('Eroare la finalizarea comenzii pe server:', error);
    const errorMessage = error instanceof Error ? error.message : 'A apărut o eroare necunoscută.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
