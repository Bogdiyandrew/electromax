import admin from 'firebase-admin';

// Verifică dacă cheia de serviciu există
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

// Verifică dacă aplicația a fost deja inițializată
if (!admin.apps.length) {
  try {
    // Decodăm string-ul Base64 înapoi în JSON
    const serviceAccountString = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      'base64'
    ).toString('utf-8');

    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Exportă instanța Firestore pentru admin
const adminDb = admin.firestore();
export { adminDb };