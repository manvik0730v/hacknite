import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const res = await API.post('/api/auth/login', {
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0]
          });
          setDbUser(res.data);
          setIsNewUser(!res.data.onboardingDone);
        } catch (err) {
          console.error('Backend sync failed:', err.message);
        }
      } else {
        setDbUser(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshUser = async () => {
    try {
      const res = await API.get('/api/users/me');
      setDbUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, isNewUser, setIsNewUser, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
