import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const saveState = async (key: string, state: any) => {
  console.log('Trying to save to Firebase:', key, state); // Debug log
  try {
    await setDoc(doc(db, 'userData', key), { data: state });
    console.log('Successfully saved to Firebase:', key);
  } catch (error) {
    console.error('Failed to save to Firebase:', error);
  }
};

export const loadState = async (key: string) => {
    console.log(`Trying to load from Firebase: ${key}`);
    try {
      const docRef = doc(db, "subtopics", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`Loaded data from Firebase:`, data);
        return data;
      }
      // Remove this log to reduce noise
      // console.log(`No data found in Firebase for: ${key}`);
      return null;
    } catch (error) {
      console.error(`Error loading from Firebase for ${key}:`, error);
      return null;
    }
  };