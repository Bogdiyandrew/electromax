'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  MultiFactorResolver,
  RecaptchaVerifier,
  AuthError,
  MultiFactorError,
  PhoneMultiFactorInfo
} from 'firebase/auth';
import { auth } from '@/firebase/config';

type MfaStep = 'LOGIN' | 'ENROLL' | 'VERIFY';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [mfaStep, setMfaStep] = useState<MfaStep>('LOGIN');
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  useEffect(() => {
    // Inițializăm reCAPTCHA o singură dată
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).recaptchaVerifier) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => { /* reCAPTCHA rezolvat */ }
      });
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
        setMfaResolver(resolver);

        if (resolver.hints.some(hint => hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID)) {
            setMfaStep('VERIFY');
            handleSendVerificationCode(resolver);
        } else {
            setMfaStep('ENROLL');
        }
      } else {
        setError('Email sau parolă invalidă.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendVerificationCode = async (resolver: MultiFactorResolver) => {
    try {
        const phoneInfoOptions = resolver.hints.find(
            (info) => info.factorId === PhoneMultiFactorGenerator.FACTOR_ID
        ) as PhoneMultiFactorInfo;

        if (!phoneInfoOptions) {
            setError("Acest cont nu are un număr de telefon configurat pentru 2FA.");
            return;
        }
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recaptchaVerifier = (window as any).recaptchaVerifier;
        const newVerificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
        setVerificationId(newVerificationId);
    } catch (err) {
        console.error("MFA Verify Error:", err);
        setError("Eroare la trimiterea codului SMS. Reîmprospătează pagina și încearcă din nou.");
    }
  }

  const handleEnroll = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!mfaResolver) return;

    try {
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recaptchaVerifier = (window as any).recaptchaVerifier;

      const newVerificationId = await phoneAuthProvider.verifyPhoneNumber({
          phoneNumber: phoneNumber,
          session: mfaResolver.session,
      }, recaptchaVerifier);

      setVerificationId(newVerificationId);
      setMfaStep('VERIFY');
    } catch (err) {
      console.error(err);
      setError("Numărul de telefon este invalid sau a apărut o eroare.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!mfaResolver) return;
    setIsLoading(true);
    setError(null);

    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError("Codul de verificare este invalid sau a expirat.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (mfaStep) {
        case 'ENROLL':
          return (
            <>
              <h1 className="text-2xl font-bold text-center text-gray-900">Adaugă un număr de telefon</h1>
              <p className="text-center text-gray-600">Pentru a-ți securiza contul, te rog adaugă un număr de telefon.</p>
              <form onSubmit={handleEnroll} className="space-y-6">
                <div>
                  <label htmlFor="phone-number" className="text-sm font-medium text-gray-700">Număr de telefon (ex: +40722123456)</label>
                  <input id="phone-number" name="phone-number" type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  {isLoading ? 'Se trimite...' : 'Trimite codul de verificare'}
                </button>
              </form>
            </>
          );
        case 'VERIFY':
          return (
            <>
              <h1 className="text-2xl font-bold text-center text-gray-900">Verificare în 2 pași</h1>
              <p className="text-center text-gray-600">Introduceți codul primit prin SMS.</p>
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label htmlFor="mfa-code" className="text-sm font-medium text-gray-700">Cod de verificare</label>
                  <input id="mfa-code" name="mfa-code" type="text" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  {isLoading ? 'Se verifică...' : 'Confirmă'}
                </button>
              </form>
            </>
          );
        case 'LOGIN':
        default:
          return (
            <>
              <h1 className="text-2xl font-bold text-center text-gray-900">Admin Login</h1>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                  <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900"/>
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Parolă</label>
                  <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-gray-900"/>
                </div>
                <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  {isLoading ? 'Se autentifică...' : 'Login'}
                </button>
              </form>
            </>
          );
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {renderForm()}
        {error && (<p className="text-sm text-center text-red-600 pt-4">{error}</p>)}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default AdminLogin;