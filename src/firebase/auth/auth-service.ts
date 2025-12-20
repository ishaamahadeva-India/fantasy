
'use client';

import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';

const saveUserToFirestore = (user: { uid: string, displayName: string | null, email: string | null, photoURL: string | null }) => {
    const { firestore } = initializeFirebase();
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
};


export const handleGoogleSignIn = async () => {
    const { auth } = initializeFirebase();
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        saveUserToFirestore(result.user);
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
};

export const handleEmailSignUp = async (email: string, password: string, displayName: string) => {
    const { auth } = initializeFirebase();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Reload user to get the updated profile
        await userCredential.user.reload();
        const updatedUser = auth.currentUser;

        if (updatedUser) {
            saveUserToFirestore(updatedUser);
        }
        return null;
    } catch (error: any) {
        return error.message;
    }
};

export const handleEmailSignIn = async (email: string, password: string) => {
    const { auth } = initializeFirebase();
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return null;
    } catch (error: any) {
        return error.message;
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
