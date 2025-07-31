'use client';

import Link from 'next/link';
import Image from 'next/image'; // Importăm componenta Image
import { useCart } from '@/context/CartContext';

// Definim o interfață pentru structura unui produs
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl?: string; // Am adăugat imageUrl ca opțional
}

// Componenta primește produsul ca proprietate (props)
export default function ProductClientPage({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                &larr; Înapoi la toate produsele
            </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Coloana pentru imagini - ACTUALIZATĂ */}
          <div>
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <span className="text-gray-500">Imagine indisponibilă</span>
              )}
            </div>
            {/* Placeholder pentru galerie de imagini mici (vom implementa mai târziu) */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* Coloana pentru detalii și acțiuni */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-indigo-600">{product.category}</p>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-2">{product.name}</h1>
            </div>
            
            <div>
              <p className="text-3xl text-gray-900">{product.price.toFixed(2)} RON</p>
            </div>

            <div className="prose lg:prose-xl text-gray-600">
              <h2 className="text-xl font-semibold text-gray-800">Descriere</h2>
              <p>{product.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Stoc: <span className="font-medium text-green-600">{product.stock > 0 ? `${product.stock} bucăți disponibile` : 'Stoc epuizat'}</span>
              </p>
            </div>

            {/* Butonul de adăugare în coș */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Adaugă în coș
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
