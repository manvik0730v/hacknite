import { useState } from 'react';
import { motion } from 'framer-motion';
import { loginWithGoogle, registerWithEmail, loginWithEmail } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [showForm, setShowForm] = useState(null); // 'login' | 'register' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handleGoogle = async () => {
    await loginWithGoogle();
    nav('/home');
  };

  const handleEmailAuth = async () => {
    if (showForm === 'register') await registerWithEmail(email, password);
    else await loginWithEmail(email, password);
    nav('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      {/* Animated logo */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="text-6xl font-bold mb-2 text-cyan-400 tracking-widest"
      >
        ====
      </motion.div>
      <p className="text-gray-400 mb-12 text-lg">Flow Like Water</p>

      {!showForm && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 w-72">
          <button onClick={() => setShowForm('register')}
            className="bg-cyan-400 text-black font-bold py-3 rounded-xl text-lg hover:bg-cyan-300 transition">
            Get Started With Us
          </button>
          <button onClick={() => setShowForm('login')}
            className="border border-cyan-400 text-cyan-400 py-3 rounded-xl text-lg hover:bg-cyan-900 transition">
            Log In
          </button>
          <button onClick={handleGoogle}
            className="bg-white text-black py-3 rounded-xl text-lg font-bold hover:bg-gray-100 transition">
            Continue with Google
          </button>
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 w-72">
          <input className="bg-gray-800 text-white p-3 rounded-lg" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)} />
          <input className="bg-gray-800 text-white p-3 rounded-lg" type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleEmailAuth}
            className="bg-cyan-400 text-black font-bold py-3 rounded-xl">
            {showForm === 'register' ? 'Create Account' : 'Log In'}
          </button>
          <button onClick={() => setShowForm(null)} className="text-gray-400 text-sm">← Back</button>
        </motion.div>
      )}
    </div>
  );
}