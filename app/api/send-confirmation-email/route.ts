import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Inițializează Resend cu cheia API din variabilele de mediu
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Preluăm ID-ul comenzii din corpul cererii
    const { orderId } = await req.json();

    if (!orderId) {
      return new NextResponse("ID-ul comenzii lipsește", { status: 400 });
    }

    // Căutăm detaliile comenzii în Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return new NextResponse("Comanda nu a fost găsită", { status: 404 });
    }

    const orderData = orderSnap.data();
    const { shippingInfo, cartItems, total } = orderData;
    
    // Construim lista de produse pentru email
    const productsHtml = cartItems.map((item: any) => `
      <tr>
        <td>${item.name} (x${item.quantity})</td>
        <td style="text-align: right;">${(item.price * item.quantity).toFixed(2)} RON</td>
      </tr>
    `).join('');

    // Trimitem email-ul folosind Resend
    const { data, error } = await resend.emails.send({
      from: 'ElectroMax <suport@electro-max.ro>', // Folosește adresa ta de email verificată
      to: [shippingInfo.email], // Email-ul clientului
      subject: `Confirmare Comandă #${orderId.substring(0, 6)}`,
      html: `
        <h1>Mulțumim pentru comanda ta, ${shippingInfo.name}!</h1>
        <p>Am primit comanda ta și o vom procesa în cel mai scurt timp.</p>
        <h3>Detalii Comandă:</h3>
        <table width="100%">
          ${productsHtml}
          <tr><td colspan="2"><hr/></td></tr>
          <tr style="font-weight: bold;">
            <td>Total</td>
            <td style="text-align: right;">${total.toFixed(2)} RON</td>
          </tr>
        </table>
        <p>Vei primi un alt email când comanda ta va fi expediată.</p>
        <p>Cu respect,<br/>Echipa ElectroMax</p>
      `,
    });

    if (error) {
      console.error("Eroare Resend:", error);
      return new NextResponse("Eroare la trimiterea email-ului", { status: 500 });
    }

    return NextResponse.json({ message: "Email trimis cu succes!" });

  } catch (error) {
    console.error("Eroare internă:", error);
    const err = error as Error;
    return new NextResponse(err.message, { status: 500 });
  }
}