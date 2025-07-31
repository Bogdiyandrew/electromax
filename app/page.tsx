import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image'; // Am importat componenta Image

// Definim o interfață pentru structura unui produs, acum cu imageUrl
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string; // Am adăugat câmpul opțional pentru imagine
}

// Funcție pentru a citi produsele de pe server
async function getProducts(): Promise<Product[]> {
  const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
  
  const querySnapshot = await getDocs(productsQuery);
  const products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  return products;
}

// Componenta pentru cardul de produs, acum cu imagine reală
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      <Link href={`/product/${product.id}`} className="block">
        <div className="w-full h-48 relative overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Fără imagine</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-gray-900">{product.price.toFixed(2)} RON</span>
          <Link 
            href={`/product/${product.id}`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Vezi Detalii
          </Link>
        </div>
      </div>
    </div>
  );
};

// Pagina Principală
export default async function HomePage() {
  const products = await getProducts();

  return (
    <main className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Magazinul Nostru
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Descoperă cele mai noi produse electrice de pe piață.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
