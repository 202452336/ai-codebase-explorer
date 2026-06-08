import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let initialized = false;

export const initFirebase = () => {
    if (initialized) return;
    const serviceAccount = JSON.parse(readFileSync('./firebase-service-account.json', 'utf-8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
};

export const verifyToken = async(token) => {
    initFirebase();
    return await admin.auth().verifyIdToken(token);
};
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let initialized = false;

export const initFirebase = () => {
    if (initialized) return;

    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Production (Render) — read from environment variable
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Local development — read from file
        serviceAccount = JSON.parse(readFileSync('./firebase-service-account.json', 'utf-8'));
    }

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    initialized = true;
};

export const verifyToken = async(token) => {
    initFirebase();
    return await admin.auth().verifyIdToken(token);
};