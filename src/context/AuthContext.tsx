import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import {
  getUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  fetchAllUsers,
  updateUserRoleInDb,
  saveUserProfile,
  ADMIN_INVITE_CODE,
  SimpleAuthUser,
} from '../services/authService';

interface AuthContextType {
  user: SimpleAuthUser | User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isUser: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    pass: string,
    displayName: string,
    adminCode?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  promoteWithCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => Promise<UserProfile[]>;
  changeUserRole: (uid: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const LOCAL_SESSION_KEY = 'liga_academia_current_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SimpleAuthUser | User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) return JSON.parse(saved).user;
    } catch (e) {}
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) return JSON.parse(saved).profile;
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(false);

  const persistSession = (u: SimpleAuthUser | User | null, p: UserProfile | null) => {
    setUser(u);
    setUserProfile(p);
    try {
      if (u && p) {
        localStorage.setItem(
          LOCAL_SESSION_KEY,
          JSON.stringify({
            user: { uid: u.uid, email: u.email, displayName: u.displayName },
            profile: p,
          })
        );
      } else {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    } catch (e) {}
  };

  const fetchProfile = async (firebaseUser: User) => {
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        persistSession(firebaseUser, profile);
      } else {
        const fallback: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };
        try {
          await saveUserProfile(fallback);
        } catch (e) {}
        persistSession(firebaseUser, fallback);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchProfile(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    if (res.success && res.user && res.profile) {
      persistSession(res.user, res.profile);
    }
    return { success: res.success, error: res.error };
  };

  const register = async (email: string, pass: string, displayName: string, adminCode?: string) => {
    const res = await registerUser(email, pass, displayName, adminCode);
    if (res.success && res.user && res.profile) {
      persistSession(res.user, res.profile);
    }
    return { success: res.success, error: res.error };
  };

  const logout = async () => {
    await logoutUser();
    persistSession(null, null);
  };

  const promoteWithCode = async (code: string) => {
    if (!user || !userProfile) {
      return { success: false, error: 'Debes iniciar sesión primero.' };
    }
    if (code.trim() !== ADMIN_INVITE_CODE) {
      return { success: false, error: 'Código de administrador incorrecto.' };
    }
    try {
      await updateUserRoleInDb(user.uid, 'admin');
    } catch (e) {}

    const updatedProfile: UserProfile = {
      ...userProfile,
      role: 'admin',
    };
    persistSession(user, updatedProfile);
    return { success: true };
  };

  const getAllUsers = async () => {
    return await fetchAllUsers();
  };

  const changeUserRole = async (uid: string, role: UserRole) => {
    const res = await updateUserRoleInDb(uid, role);
    if (user?.uid === uid && userProfile) {
      persistSession(user, { ...userProfile, role });
    }
    return res;
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        persistSession(user, profile);
      }
    }
  };

  const isAdmin = !!(user && userProfile?.role === 'admin');
  const isUser = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isUser,
        loading,
        login,
        register,
        logout,
        promoteWithCode,
        getAllUsers,
        changeUserRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
