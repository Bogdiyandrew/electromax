'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/firebase/config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // AM ELIMINAT: Verificarea dacă emailul a fost confirmat.
      // Acum utilizatorul va fi logat direct.

      router.push('/');
    } catch (err) {
      const error = err as { code?: string };

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Adresa de email sau parola este incorectă.');
      } else {
        setError('A apărut o eroare la autentificare. Vă rugăm încercați din nou.');
        console.error('Eroare la autentificare:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Te rog introdu adresa de email mai întâi pentru a reseta parola.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError('Nu am putut trimite emailul de resetare. Verifică adresa introdusă.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {resetSent ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Verifică-ți Emailul</h1>
            <p className="mt-4 text-gray-600">
              Am trimis un link pentru resetarea parolei la adresa <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Autentificare</h1>
              <p className="mt-2 text-gray-600">Bine ai revenit! Te rugăm să te autentifici.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Adresă de email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Parolă</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div className="text-right text-sm">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Ai uitat parola?
                </button>
              </div>
              {error && (<p className="text-sm text-center text-red-600">{error}</p>)}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isLoading ? 'Se autentifică...' : 'Intră în cont'}
              </button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Nu ai cont?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:underline">
                  Înregistrează-te acum
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
