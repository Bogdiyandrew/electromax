import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin-config';
import { FieldValue } from 'firebase-admin/firestore';

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new NextResponse("ID-ul comenzii lipsește", { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return new NextResponse("Comanda nu a fost găsită", { status: 404 });
    }
    
    const orderData = orderSnap.data();
    if (!orderData) {
        return new NextResponse("Datele comenzii sunt invalide", { status: 500 });
    }

    const cartItems = orderData.cartItems as CartItem[];

    await adminDb.runTransaction(async (transaction) => {
      for (const item of cartItems) {
        const productRef = adminDb.collection('products').doc(item.id);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Produsul cu ID-ul ${item.id} nu a fost găsit!`);
        }
        
        // MODIFICARE: Verificăm dacă produsul are stoc nelimitat
        const isUnlimited = productDoc.data()?.isUnlimited || false;
        
        // Dacă stocul este nelimitat, sărim peste acest produs
        if (isUnlimited) {
            continue;
        }

        const currentStock = productDoc.data()?.stock || 0;
        const newStock = currentStock - item.quantity;

        if (newStock < 0) {
          throw new Error(`Stoc insuficient pentru produsul ${item.id}.`);
        }

        transaction.update(productRef, { stock: FieldValue.increment(-item.quantity) });
      }
    });

    return NextResponse.json({ message: "Stocul a fost actualizat cu succes!" });

  } catch (error) {
    console.error("Eroare la actualizarea stocului:", error);
    const err = error as Error;
    return new NextResponse(`Eroare internă de server: ${err.message}`, { status: 500 });
  }
}