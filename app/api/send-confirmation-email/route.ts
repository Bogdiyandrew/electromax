import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

const resend = new Resend(process.env.RESEND_API_KEY);

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new NextResponse("ID-ul comenzii lipsește", { status: 400 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return new NextResponse("Comanda nu a fost găsită", { status: 404 });
    }

    const orderData = orderSnap.data();
    const { shippingInfo, cartItems, total } = orderData;
    
    const productsHtml = cartItems.map((item: CartItem) => `
      <tr>
        <td>${item.name} (x${item.quantity})</td>
        <td style="text-align: right;">${(item.price * item.quantity).toFixed(2)} RON</td>
      </tr>
    `).join('');

    // #################################################################
    // ## MODIFICARE: Verificăm dacă cheia API există înainte de a trimite ##
    // #################################################################
    if (!process.env.RESEND_API_KEY) {
        console.error("Cheia API RESEND lipsește din variabilele de mediu!");
        return new NextResponse("Configurare server incorectă.", { status: 500 });
    }

    const { error } = await resend.emails.send({
      // Pentru a testa, poți schimba temporar 'from' în: 'onboarding@resend.dev'
      from: 'ElectroMax <suport@electro-max.ro>', 
      to: [shippingInfo.email],
      subject: `Confirmare Comandă #${orderId.substring(0, 6)}`,
      html: `<h1>Detalii comandă...</h1>` // Simplificat pentru test
    });
    
    // #################################################################
    // ## MODIFICARE: Logare detaliată a erorii de la Resend          ##
    // #################################################################
    if (error) {
      console.error("Eroare primită de la Resend:", JSON.stringify(error, null, 2));
      return NextResponse.json({ message: "Eroare la trimiterea email-ului", errorDetails: error }, { status: 500 });
    }

    return NextResponse.json({ message: "Email trimis cu succes!" });

  } catch (error) {
    console.error("Eroare internă în API route:", error);
    const err = error as Error;
    return new NextResponse(err.message, { status: 500 });
  }
}