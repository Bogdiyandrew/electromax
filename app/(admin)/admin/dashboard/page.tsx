'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

const AdminDashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Eroare la delogare:', error);
      alert('Nu s-a putut efectua delogarea.');
    }
  };

  const handleAddTestProduct = async () => {
    try {
      const testProduct = {
        name: 'Bec LED Inteligent',
        price: 89.99,
        description: 'Un bec LED inteligent, economic, controlabil prin Wi-Fi.',
        stock: 100,
        category: 'Iluminat',
        createdAt: new Date(),
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/electromax-86641.appspot.com/o/products%2F1722497699933_bec.jpeg?alt=media&token=487d27e1-88f6-4e14-8025-a131238d9709' // Imagine de test
      };
      await addDoc(collection(db, "products"), testProduct);
      alert(`Produs de test adăugat cu succes!`);
    } catch (e) {
      console.error("Eroare la adăugarea documentului: ", e);
      alert("A apărut o eroare la adăugarea produsului.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Bun venit în Panoul de Administrare!</h2>
            <p className="mt-2 text-gray-600">
              De aici vei putea gestiona produsele, comenzile și clienții magazinului tău.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Acțiuni Rapide</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              {/* ################################################# */}
              {/* ## LINK NOU ADĂUGAT AICI                       ## */}
              {/* ################################################# */}
               <Link 
                href="/admin/products"
                className="px-4 py-2 font-medium text-white bg-gray-700 rounded-md hover:bg-gray-800"
              >
                Gestionează Produse
              </Link>
               <Link 
                href="/admin/orders"
                className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Vezi Comenzile
              </Link>
              <Link 
                href="/admin/add-product"
                className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Adaugă Produs Nou
              </Link>
              <button
                onClick={handleAddTestProduct}
                className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Adaugă Produs Test
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;