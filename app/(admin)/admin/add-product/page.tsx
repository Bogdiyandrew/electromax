'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';

interface ProductFormState {
  name: string;
  price: string;
  description: string;
  stock: string;
  category: string;
}

const AddProductPage = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<ProductFormState>({ name: '', price: '', description: '', stock: '', category: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Te rog să selectezi o imagine pentru produs.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);

      const newProduct = {
        name: formState.name,
        price: parseFloat(formState.price),
        description: formState.description,
        stock: parseInt(formState.stock, 10),
        category: formState.category,
        imageUrl: downloadURL,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products"), newProduct);
      
      alert('Produsul a fost adăugat cu succes!');
      router.push('/admin/dashboard');

    } catch (err) {
      // Corecție pentru a specifica tipul erorii
      const error = err as Error;
      setError(error.message || "A apărut o eroare la adăugarea produsului.");
      console.error("Eroare detaliată:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800">
            &larr; Înapoi la Panoul de Control
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Adaugă un Produs Nou</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" name="name" required placeholder="Nume Produs" value={formState.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"/>
            <input type="text" name="price" required placeholder="Preț" value={formState.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"/>
            <input type="number" name="stock" required placeholder="Stoc" value={formState.stock} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"/>
            <input type="text" name="category" required placeholder="Categorie" value={formState.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"/>
            <textarea name="description" rows={4} required placeholder="Descriere" value={formState.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"></textarea>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Imagine Produs</label>
              <input type="file" name="image" id="image" required onChange={handleImageChange} accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={isLoading} className="px-6 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                {isLoading ? 'Se adaugă...' : 'Adaugă Produs'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
