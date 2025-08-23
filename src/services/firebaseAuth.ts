import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Register new user
export const registerUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  phone: string
): Promise<AuthUser> => {
  try {
    console.log('Starting user registration for:', email);
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Firebase user created with UID:', user.uid);

    // Update profile with display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    console.log('User profile updated with display name');

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      firstName,
      lastName,
      phone,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating Firestore document with data:', userProfile);
    
    // Store in Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    console.log('User profile successfully stored in Firestore');

    return {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      phone
    };
  } catch (error: any) {
    console.error('Error in registerUser:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please use a different email or sign in.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your Firestore security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firestore is currently unavailable. Please try again later.');
    } else {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
};

// Sign in user
export const signInUser = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data() as UserProfile;
    
    return {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get current user profile
export const getCurrentUserProfile = async (uid: string): Promise<AuthUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as UserProfile;
    
    return {
      uid: userData.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      address: userData.address,
      city: userData.city,
      state: userData.state,
      zipCode: userData.zipCode
    };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user profile exists in Firestore
export const checkUserProfileExists = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};

// Get user profile by UID (for debugging)
export const getUserProfileByUid = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile by UID:', error);
    return null;
  }
};
