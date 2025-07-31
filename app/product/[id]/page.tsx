import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { notFound } from 'next/navigation';
import ProductClientPage from './ProductClientPage';

// Tipul unui produs
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl?: string;
}

// Funcție pentru a obține produsul din Firestore
async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    const product: Product = {
      id: docSnap.id,
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category,
      stock: data.stock,
      imageUrl: data.imageUrl || '',
    };

    return product;
  }

  return null;
}

// Next.js page function
interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductClientPage product={product} />;
}