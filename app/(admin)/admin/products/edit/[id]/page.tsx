'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';

interface ProductFormState {
  name: string;
  price: string;
  description: string;
  stock: string;
  category: string;
  unit: string;
  isUnlimited: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditProductPage = ({ params }: any) => {
  const router = useRouter();
  const productId = params.id;

  const [formState, setFormState] = useState<ProductFormState>({ name: '', price: '', description: '', stock: '', category: '', unit: '', isUnlimited: false });
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormState({
            name: data.name,
            price: data.price.toString(),
            description: data.description,
            stock: data.stock.toString(),
            category: data.category,
            unit: data.unit || 'buc',
            isUnlimited: data.isUnlimited || false
          });
          setCurrentImageUrl(data.imageUrl || null);
        } else {
          setError("Produsul nu a fost găsit.");
        }
      } catch (err) {
        console.error("Eroare la preluarea produsului:", err);
        setError("Eroare la încărcarea produsului.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState(prevState => ({ ...prevState, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    try {
      let downloadURL = currentImageUrl; 

      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        downloadURL = await getDownloadURL(storageRef);
      }
      
      const updatedProduct = {
        name: formState.name,
        price: parseFloat(formState.price),
        name_lowercase: formState.name.toLowerCase(),
        description: formState.description,
        stock: formState.isUnlimited ? Infinity : parseInt(formState.stock, 10),
        category: formState.category,
        unit: formState.unit,
        isUnlimited: formState.isUnlimited,
        imageUrl: downloadURL,
      };

      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, updatedProduct);
      
      alert('Produsul a fost actualizat cu succes!');
      router.push('/admin/products');

    } catch (err) {
      const error = err as Error;
      setError(error.message || "A apărut o eroare la actualizarea produsului.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading) return <p className="p-8">Se încarcă produsul...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/products" className="text-indigo-600 hover:text-indigo-800">&larr; Înapoi la listă</Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editează Produs</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {currentImageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagine curentă</label>
                <Image src={currentImageUrl} alt="Imaginea curentă a produsului" width={100} height={100} className="mt-1 rounded-md object-cover"/>
              </div>
            )}
            
            <input type="text" name="name" required placeholder="Nume Produs" value={formState.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <input type="number" step="0.01" name="price" required placeholder="Preț" value={formState.price} onChange={handleChange} className="md:col-span-1 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
              <input type="number" name="stock" placeholder="Stoc" value={formState.stock} onChange={handleChange} disabled={formState.isUnlimited} required={!formState.isUnlimited} className="md:col-span-1 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-200"/>
              <input type="text" name="unit" required placeholder="Unitate (ex: buc, ml, set)" value={formState.unit} onChange={handleChange} className="md:col-span-1 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
            </div>
            <div className="flex items-center">
                <input type="checkbox" name="isUnlimited" id="isUnlimited" checked={formState.isUnlimited} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                <label htmlFor="isUnlimited" className="ml-2 block text-sm text-gray-900">Stoc nelimitat (disponibil la comandă)</label>
            </div>
            <input type="text" name="category" required placeholder="Categorie" value={formState.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"/>
            <textarea name="description" rows={4} required placeholder="Descriere" value={formState.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"></textarea>
            
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Schimbă Imaginea (opțional)</label>
              <input type="file" name="image" id="image" onChange={handleImageChange} accept="image/png, image/jpeg" className="mt-1 block w-full text-sm"/>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={isUpdating} className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {isUpdating ? 'Se actualizează...' : 'Actualizează Produs'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;