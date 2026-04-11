import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const res = await API.post('/api/auth/login', {
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0]
          });
          setDbUser(res.data);
        } catch (err) {
          console.error('Backend sync failed:', err.message);
          // App still works even if backend sync fails
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, dbUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
