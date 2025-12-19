
'use client';

import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';

export const handleGoogleSignIn = async () => {
    const { auth, firestore } = initializeFirebase();
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Create or update user profile in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        const userData = {
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.photoURL,
        };

        setDoc(userDocRef, userData, { merge: true })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'write',
                    requestResourceData: userData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });

    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
};

export const handleLogout = async () => {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};
