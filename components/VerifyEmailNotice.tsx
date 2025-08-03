'use client';

import { useState } from 'react';
import { getAuth, sendEmailVerification, User } from 'firebase/auth';

const VerifyEmailNotice = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSendVerification = async () => {
    if (!user) return;

    setLoading(true);
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('Email de verificare trimis! Te rog verifică-ți inbox-ul (și folderul Spam).');
    } catch (error) {
      setMessage('A apărut o eroare. Te rog încearcă din nou.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Dacă nu există utilizator sau emailul este deja verificat, nu afișa nimic.
  if (!user || user.emailVerified) {
    return null;
  }

  // Afișează notificarea și butonul dacă emailul nu este verificat.
  return (
    <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 text-center">
      <p className="font-medium">⚠️ Contul tău de email nu este verificat.</p>
      <p className="mt-2">{message || 'Pentru a securiza complet contul, te rog verifică-ți adresa de email.'}</p>
      {!message && (
        <button
          onClick={handleSendVerification}
          disabled={loading}
          className="px-4 py-2 mt-3 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Se trimite...' : 'Trimite email de verificare'}
        </button>
      )}
    </div>
  );
};

export default VerifyEmailNotice;