import { NextResponse } from 'next/server';
import { Resend } from 'resend';
// Se importă configurația de ADMIN, nu cea de client!
import { adminDb } from '@/firebase/admin-config';

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

    // Se folosește 'adminDb' pentru a accesa Firestore cu privilegii de admin
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return new NextResponse("Comanda nu a fost găsită", { status: 404 });
    }

    const orderData = orderSnap.data();
    if (!orderData) {
        return new NextResponse("Datele comenzii sunt invalide", { status: 500 });
    }

    const { shippingInfo, cartItems, total } = orderData;
    
    const productsHtml = cartItems.map((item: CartItem) => `
      <tr>
        <td>${item.name} (x${item.quantity})</td>
        <td style="text-align: right;">${(item.price * item.quantity).toFixed(2)} RON</td>
      </tr>
    `).join('');

    const { error } = await resend.emails.send({
      from: 'ElectroMax <suport@electro-max.ro>',
      to: [shippingInfo.email],
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
      console.error("Eroare primită de la Resend:", JSON.stringify(error, null, 2));
      return NextResponse.json({ message: "Eroare la trimiterea email-ului", errorDetails: error }, { status: 500 });
    }

    return NextResponse.json({ message: "Email trimis cu succes!" });

  } catch (error) {
    console.error("Eroare internă în API route:", error);
    return new NextResponse("Eroare internă de server", { status: 500 });
  }
}