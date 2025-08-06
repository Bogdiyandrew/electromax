import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

// Forțează pagina să fie mereu actualizată cu datele din baza de date
export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
}

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

async function CategoryProducts({ categoryName }: { categoryName: string }) {
  let products: Product[] = [];
  const decodedCategoryName = decodeURIComponent(categoryName);
  
  // Convertim numele categoriei din URL în litere mici pentru căutare
  const lowerCaseCategory = decodedCategoryName.toLowerCase();

  const productsRef = collection(db, "products");
  // Modificăm interogarea să caute în câmpul `category_lowercase`
  const q = query(
    productsRef,
    where('category_lowercase', '==', lowerCaseCategory),
    orderBy('name')
  );

  try {
    const querySnapshot = await getDocs(q);
    products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error("Eroare la preluarea produselor pe categorie:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">
        Produse din categoria: <span className="text-blue-400">{decodedCategoryName}</span>
      </h1>

      {products.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-400">Momentan nu există produse în această categorie.</p>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CategoryPage({ params }: any) {
  const { categoryName } = params;

  return (
    <main className="min-h-screen bg-gray-900">
      <Suspense fallback={<p className="text-center text-white py-10">Se încarcă produsele...</p>}>
        <CategoryProducts categoryName={categoryName} />
      </Suspense>
    </main>
  );
}