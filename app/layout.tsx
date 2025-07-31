import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // Importăm provider-ul
import Header from "@/components/Header"; // Importăm header-ul

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElectroMax - Magazin Online",
  description: "Cele mai bune produse electrice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider> {/* Îmbrăcăm totul în CartProvider */}
          <Header /> {/* Adăugăm Header-ul deasupra conținutului */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
