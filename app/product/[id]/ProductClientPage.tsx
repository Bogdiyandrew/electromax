'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Minus, Plus } from 'lucide-react';

// Definim o interfață pentru structura unui produs
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl?: string;
  unit?: string;
}

// Componenta primește produsul ca proprietate (props)
export default function ProductClientPage({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      quantity
    );
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
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
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
              <div className="w-full h-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>

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
                {/* ################################################# */}
                {/* ## CORECȚIE AICI: Afișăm unitatea dinamic       ## */}
                {/* ################################################# */}
                Stoc: <span className="font-medium text-green-600">{product.stock > 0 ? `${product.stock} ${product.unit || 'buc.'} disponibile` : 'Stoc epuizat'}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={decreaseQuantity} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-md" disabled={quantity <= 1}>
                        <Minus size={16} />
                    </button>
                    <span className="px-5 py-2 text-gray-900 font-semibold">{quantity}</span>
                    <button onClick={increaseQuantity} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-md" disabled={quantity >= product.stock}>
                        <Plus size={16} />
                    </button>
                </div>
                <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 px-8 py-3 text-base font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                Adaugă în coș
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}