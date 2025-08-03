'use client';

import { PhoneAuthProvider, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useEffect } from 'react';

// ✅ AICI ESTE CORECȚIA: Declarăm noua proprietate pe obiectul global `window`.
declare global {
  interface Window {
    recaptchaVerifierTest?: RecaptchaVerifier;
  }
}

const SmsTest = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifierTest) {
      window.recaptchaVerifierTest = new RecaptchaVerifier(auth, 'recaptcha-container-test', {
        'size': 'invisible'
      });
    }
  }, []);

  const handleTestSms = async () => {
    console.log("--- Început Test Izolat SMS ---");
    const testPhoneNumber = '+40730784892'; // Numărul tău corect, fără spații
    
    try {
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const recaptchaVerifier = window.recaptchaVerifierTest;

      if (!recaptchaVerifier) {
        console.error("Verifier-ul de test nu a fost găsit!");
        return;
      }
      
      console.log(`Se încearcă trimiterea SMS la numărul hardcodat: ${testPhoneNumber}`);
      
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(testPhoneNumber, recaptchaVerifier);
      
      console.log("✅ TEST REUȘIT! SMS-ul a fost trimis. Verification ID:", verificationId);
      alert("Test reușit! Verifică telefonul pentru SMS.");

    } catch (error) {
      console.error("❌ TEST EȘUAT! Eroare detaliată:", error);
      alert("Testul a eșuat. Verifică consola pentru eroarea exactă.");
    }
  };

  return (
    <div className="p-6 my-8 border-2 border-dashed border-red-500">
      <h3 className="font-bold text-lg text-center">Componentă de Test Izolat</h3>
      <p className="text-center text-sm mb-4">Acest buton testează doar trimiterea SMS.</p>
      <button 
        onClick={handleTestSms}
        className="w-full px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
      >
        Testează Trimitere SMS
      </button>
      {/* Container separat pentru verifier-ul de test */}
      <div id="recaptcha-container-test"></div>
    </div>
  );
};

export default SmsTest;