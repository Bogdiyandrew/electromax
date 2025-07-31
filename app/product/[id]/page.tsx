import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { notFound } from 'next/navigation';
import ProductClientPage from './ProductClientPage';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl?: string;
}

async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  return {
    id: docSnap.id,
    name: data.name,
    price: data.price,
    description: data.description,
    category: data.category,
    stock: data.stock,
    imageUrl: data.imageUrl || '',
  };
}

// 👇 ASTA e cheia — fără niciun import extern pentru PageProps
export default async function Page({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  return <ProductClientPage product={product} />;
}