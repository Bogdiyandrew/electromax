import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { notFound } from 'next/navigation';
import ProductClientPage from './ProductClientPage';

// Definim tipul pentru props-urile paginii, inclusiv params
type ProductDetailPageProps = {
  params: {
    id: string;
  };
};

// Definim o interfață pentru structura unui produs
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl?: string;
}

// Funcție pentru a citi datele unui singur produs de pe server
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
      imageUrl: data.imageUrl || undefined,
    };
    
    return product;
  } else {
    return null;
  }
}

// Pagina principală (Server Component) care doar preia datele
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // Pasăm datele "curățate" către componenta client
  return <ProductClientPage product={product} />;
}
