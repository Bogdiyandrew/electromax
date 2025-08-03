'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';
import { auth } from '@/firebase/config';

const AdminLoginEmailLink = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  // Pasul 2: Verifică dacă pagina este încărcată printr-un link de autentificare
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setIsLoading(true);
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) {
        savedEmail = window.prompt('Te rog introdu adresa de email pentru confirmare');
      }
      
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            console.log("Autentificare reușită!", result.user);
            router.push('/admin/dashboard');
          })
          .catch((err) => {
            console.error(err);
            setError('Link-ul este invalid sau a expirat. Te rog încearcă din nou.');
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  // Pasul 1: Trimite link-ul de autentificare
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailSent(false);

    // ✅ CORECȚIA: Definim setările aici pentru a folosi URL-ul dinamic
    const actionCodeSettings = {
      // Acum va folosi URL-ul corect, fie el localhost sau electro-max.ro
      url: window.location.href, 
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
      console.log(`Link de login trimis la ${email}`);
    } catch (err) {
      console.error(err);
      setError('A apărut o eroare. Te rog verifică adresa de email și încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isSignInWithEmailLink(auth, window.location.href)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Se verifică link-ul de autentificare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {emailSent ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Verifică-ți Emailul</h1>
            <p className="mt-4 text-gray-600">
              Am trimis un link de autentificare la adresa <strong>{email}</strong>.
              Te rog accesează link-ul pentru a finaliza procesul de login.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-900">Admin Login</h1>
            <p className="text-center text-gray-600">Introdu adresa de email pentru a primi un link de autentificare.</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
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
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                {isLoading ? 'Se trimite...' : 'Trimite Link de Login'}
              </button>
            </form>
          </>
        )}
        {error && (<p className="text-sm text-center text-red-600 pt-4">{error}</p>)}
      </div>
    </div>
  );
};

export default AdminLoginEmailLink;
