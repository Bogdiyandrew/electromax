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
  unit?: string;
  isUnlimited?: boolean;
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
    unit: data.unit || 'buc.',
    isUnlimited: data.isUnlimited || false,
  };
}

// 👇 Obligatoriu pentru dynamic rendering
export const dynamic = "force-dynamic";

// 👇 Obligatoriu ca să nu dea eroare de "params must be awaited"
export async function generateStaticParams() {
  return [];
}

// 👇 PageProps tip corect compatibil cu App Router
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductClientPage product={product} />;
}