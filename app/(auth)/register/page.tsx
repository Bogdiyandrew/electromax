'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: 'client',
        createdAt: new Date()
      });
      
      router.push('/');

    } catch (err) {
      const error = err as { code?: string };

      if (error.code === 'auth/email-already-in-use') {
        setError('Această adresă de email este deja folosită.');
      } else {
        setError('A apărut o eroare la înregistrare. Vă rugăm încercați din nou.');
        console.error("Eroare la înregistrare:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Creează un Cont Nou</h1>
          <p className="mt-2 text-gray-400">Completează detaliile pentru a te înregistra.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-300">Nume complet</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Adresă de email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Parolă</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-800"
          >
            {isLoading ? 'Se creează contul...' : 'Înregistrează-te'}
          </button>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Ai deja un cont?{' '}
            <Link href="/login" className="font-medium text-blue-500 hover:underline">
              Autentifică-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;