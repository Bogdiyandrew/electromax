import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext"; // Corect: calea include 'app/'
import { CartProvider } from "@/context/CartContext"; // Importăm CartProvider
import Header from "@/components/Header"; // Asigură-te că ai un component Header

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
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider> {/* AuthProvider trebuie să fie la exterior */}
          <CartProvider> {/* CartProvider este în interiorul AuthProvider */}
            <Header /> {/* Header-ul va avea acces la ambele contexte */}
            <main className="pt-16"> {/* Adăugăm un padding-top pentru a nu se suprapune cu header-ul fix */}
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
