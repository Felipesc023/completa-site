
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, googleProvider, db } from '../services/firebase';
// Fix: Import from firebase modules as namespaces to resolve "no exported member" errors.
import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';

const { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} = firebaseAuth;

const { doc, getDoc, setDoc, serverTimestamp } = firestore;

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'Usuário',
              email: userData.email || firebaseUser.email || '',
              role: userData.role || 'user',
              photoURL: firebaseUser.photoURL || undefined
            });
          } else {
            // Fallback para login social se o doc não existir (sincronização automática)
            // Para registro via email/senha, o doc é criado na função de registro
            const newUser = {
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email,
              role: 'user',
              createdAt: serverTimestamp(),
              photoURL: firebaseUser.photoURL
            };
            await setDoc(userRef, newUser);
            setUser({
              id: firebaseUser.uid,
              name: newUser.name,
              email: newUser.email || '',
              role: 'user',
              photoURL: newUser.photoURL || undefined
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com Google");
      return false;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (err: any) {
      console.error(err);
      let msg = "Erro ao fazer login.";
      if (err.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
      if (err.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
      if (err.code === 'auth/wrong-password') msg = "Senha incorreta.";
      setError(msg);
      return false;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string): Promise<boolean> => {
    setError(null);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = userCredential.user;

      // 2. Update Profile Name
      await updateProfile(newUser, { displayName: name });

      // 3. Create Firestore Document
      await setDoc(doc(db, 'users', newUser.uid), {
        name: name,
        email: email,
        role: 'user',
        createdAt: serverTimestamp()
      });

      return true;
    } catch (err: any) {
      console.error(err);
      let msg = "Erro ao cadastrar.";
      if (err.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
      if (err.code === 'auth/weak-password') msg = "A senha é muito fraca.";
      if (err.code === 'auth/invalid-email') msg = "E-mail inválido.";
      setError(msg);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err: any) {
      console.error(err);
      let msg = "Erro ao enviar e-mail de recuperação.";
      if (err.code === 'auth/user-not-found') msg = "E-mail não encontrado.";
      setError(msg);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginWithGoogle, 
      loginWithEmail,
      registerWithEmail,
      resetPassword,
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      loading,
      error
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
