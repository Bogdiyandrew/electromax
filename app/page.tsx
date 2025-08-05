import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
}

async function getProducts(): Promise<Product[]> {
  const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(productsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
}

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border border-gray-700 group rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 bg-gray-800">
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
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">Fără imagine</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-100 truncate">{product.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{product.category}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-white">{product.price.toFixed(2)} RON</span>
          <Link 
            href={`/product/${product.id}`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Vezi Detalii
          </Link>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">Soluții Electrice Complete</span>
            <span className="block text-blue-500">Pentru Casa și Afacerea Ta</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            De la cabluri și siguranțe, la prize inteligente și corpuri de iluminat. La ElectroMax găsești tot ce ai nevoie pentru proiectul tău.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link href="#products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                Vezi Produsele
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
               <Link href="/contact" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg md:px-10">
                Contactează-ne
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <HeroSection />
      <div id="products" className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">Produsele Noastre</h2>
          <p className="mt-4 text-lg text-gray-400">
            Descoperă cele mai noi produse electrice de pe piață.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}