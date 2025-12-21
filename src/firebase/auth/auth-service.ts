
'use client';

import { 
    type Auth,
    signInWithPopup, 
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
} from 'firebase/auth';
import { type Firestore, doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '../errors';

const SUPER_ADMIN_EMAIL = 'admin@fantasy.com';

const saveUserToFirestore = (firestore: Firestore, user: { uid: string, displayName: string | null, email: string | null, photoURL: string | null }) => {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userData: {
        displayName: string | null;
        email: string | null;
        avatarUrl: string | null;
        isAdmin?: boolean;
    } = {
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.photoURL,
    };

    // Check if the user is the designated super admin
    if (user.email === SUPER_ADMIN_EMAIL) {
        userData.isAdmin = true;
    }

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


export const handleGoogleSignIn = async (auth: Auth, firestore: Firestore) => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        saveUserToFirestore(firestore, result.user);
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
};

export const handleEmailSignUp = async (auth: Auth, firestore: Firestore, email: string, password: string, displayName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Reload user to get the updated profile
        await userCredential.user.reload();
        const updatedUser = auth.currentUser;

        if (updatedUser) {
            saveUserToFirestore(firestore, updatedUser);
        }
        return null;
    } catch (error: any) {
        return error.message;
    }
};

export const handleEmailSignIn = async (auth: Auth, firestore: Firestore, email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // After successful sign-in, ensure the admin role is set if it's the super admin
        if (userCredential.user.email === SUPER_ADMIN_EMAIL) {
            saveUserToFirestore(firestore, userCredential.user);
        }
        return null;
    } catch (error: any) {
        return error.message;
    }
};


export const handleLogout = async (auth: Auth) => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};
