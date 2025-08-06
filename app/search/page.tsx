import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

// Această interfață ar trebui să fie identică cu cea din pagina principală
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
}

// Reutilizăm componenta ProductCard, dar o punem direct aici pentru simplitate
const ProductCard = ({ product }: { product: Product }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 overflow-hidden group">
    <Link href={`/product/${product.id}`} className="block">
      <div className="relative h-60 bg-gray-700">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Imagine indisponibilă</div>
        )}
      </div>
    </Link>
    <div className="p-5">
      <span className="text-xs font-semibold text-blue-400 bg-gray-700 px-2 py-1 rounded-full">{product.category}</span>
      <h3 className="mt-3 text-lg font-bold text-white truncate group-hover:text-blue-400">{product.name}</h3>
      <p className="mt-2 text-2xl font-extrabold text-white">{product.price.toFixed(2)} RON</p>
      <Link href={`/product/${product.id}`} className="mt-4 block w-full text-center bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700">
        Vezi detalii
      </Link>
    </div>
  </div>
);

// Componenta principală care face căutarea și afișează rezultatele
async function SearchResults({ searchQuery }: { searchQuery: string }) {
  let products: Product[] = [];
  
  // Facem căutarea în Firestore
  if (searchQuery) {
    const productsRef = collection(db, "products");
    const lowerCaseQuery = searchQuery.toLowerCase(); // Convertim căutarea la litere mici

    const q = query(
      productsRef,
      where('name_lowercase', '>=', lowerCaseQuery), // Căutăm în câmpul nou
      where('name_lowercase', '<=', lowerCaseQuery + '\uf8ff'),
      orderBy('name_lowercase') // Ordonăm după câmpul nou
    );

    try {
      const querySnapshot = await getDocs(q);
      products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error("Eroare la căutarea produselor:", error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">
        Rezultate pentru: <span className="text-blue-400">{searchQuery}</span>
      </h1>

      {products.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-400">Nu am găsit niciun produs care să corespundă căutării tale.</p>
          <Link href="/" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
            Înapoi la pagina principală
          </Link>
        </div>
      )}
    </div>
  );
}

// Componenta paginii care preia parametrii din URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SearchPage({ searchParams }: any) { // <-- AM MODIFICAT AICI
  const searchQuery = searchParams.q || '';

  return (
    <main className="min-h-screen bg-gray-900">
      <Suspense fallback={<p className="text-center text-white py-10">Se încarcă rezultatele...</p>}>
        <SearchResults searchQuery={searchQuery} />
      </Suspense>
    </main>
  );
}