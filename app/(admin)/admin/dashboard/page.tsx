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

  // Funcție pentru a adăuga un produs de test
  const handleAddTestProduct = async () => {
    try {
      const testProduct = {
        name: 'Bec LED Inteligent',
        price: 89.99,
        description: 'Un bec LED inteligent, economic, controlabil prin Wi-Fi.',
        stock: 100,
        category: 'Iluminat',
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "products"), testProduct);
      
      alert(`Produs de test adăugat cu succes! ID: ${docRef.id}`);
    } catch (e) {
      console.error("Eroare la adăugarea documentului: ", e);
      alert("A apărut o eroare la adăugarea produsului.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bara de navigare de sus */}
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conținutul principal al paginii */}
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
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleAddTestProduct}
                className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Adaugă Produs Test
              </button>
              <Link 
                href="/admin/add-product"
                className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Adaugă un Produs Nou (Formular)
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
