'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Definim o interfață pentru structura unui produs
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);
        
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Eroare la preluarea produselor: ", err);
        setError("Nu s-au putut încărca produsele. Vă rugăm să încercați din nou.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800">
            &larr; Înapoi la Panoul de Control
          </Link>
          <Link href="/admin/add-product" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Adaugă Produs Nou
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestionare Produse</h1>
          
          {isLoading ? (
            <p className="text-gray-600">Se încarcă produsele...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-gray-600">Nu a fost găsit niciun produs.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagine</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume Produs</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categorie</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preț</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stoc</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acțiuni</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="h-10 w-10 rounded-md object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.price.toFixed(2)} RON
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock} buc.
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">Editează</a>
                        <a href="#" className="text-red-600 hover:text-red-900">Șterge</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;