'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';
import { auth } from '@/firebase/config';

// Setările pentru acțiunea din email
const actionCodeSettings = {
  // IMPORTANT: Schimbă această adresă cu URL-ul tău real în producție
  // Pentru testare locală, 'http://localhost:3000' este de obicei corect.
  url: 'http://localhost:3000/admin/login', 
  handleCodeInApp: true,
};


const AdminLoginEmailLink = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  // Pasul 2: Verifică dacă pagina este încărcată printr-un link de autentificare
  useEffect(() => {
    // Confirmă dacă link-ul este unul valid de la Firebase.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setIsLoading(true);
      // Preia emailul salvat local.
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) {
        // Dacă utilizatorul deschide link-ul pe alt dispozitiv, cere emailul din nou pentru securitate.
        savedEmail = window.prompt('Te rog introdu adresa de email pentru confirmare');
      }
      
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then((result) => {
            // Șterge emailul din stocarea locală.
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

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Link-ul a fost trimis cu succes.
      // Salvăm emailul local pentru a nu-l mai cere dacă utilizatorul deschide link-ul pe același dispozitiv.
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

  // Afișează un mesaj de încărcare în timp ce se procesează link-ul
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
            <p className="mt-2 text-sm text-gray-500">(Poți închide această fereastră)</p>
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
