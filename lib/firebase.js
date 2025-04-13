import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDXk-1QmyoIJFBvkXh5tmD_DeutqAioOoc",
    authDomain: "css-prep-dashboard.firebaseapp.com",
    projectId: "css-prep-dashboard",
    storageBucket: "css-prep-dashboard.firebasestorage.app",
    messagingSenderId: "266027507032",
    appId: "1:266027507032:web:33c6ffc93130e382bb592d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };