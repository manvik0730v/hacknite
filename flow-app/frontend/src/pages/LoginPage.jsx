import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, registerWithEmail, loginWithEmail } from '../services/firebase';

export default function LoginPage() {
  const [showForm, setShowForm] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      nav('/home');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (showForm === 'register') {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      nav('/home');
    } catch (err) {
      // Make Firebase errors readable
      if (err.code === 'auth/email-already-in-use') setError('Email already registered. Try logging in.');
      else if (err.code === 'auth/user-not-found') setError('No account found. Try signing up.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address.');
      else if (err.code === 'auth/invalid-credential') setError('Wrong email or password.');
      else setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="text-6xl font-bold mb-2 text-cyan-400 tracking-widest">====</div>
      <p className="text-gray-400 mb-12 text-lg">Flow Like Water</p>

      {!showForm && (
        <div className="flex flex-col gap-4 w-72">
          <button onClick={() => { setShowForm('register'); setError(''); }}
            className="bg-cyan-400 text-black font-bold py-3 rounded-xl text-lg hover:bg-cyan-300 transition">
            Get Started With Us
          </button>
          <button onClick={() => { setShowForm('login'); setError(''); }}
            className="border border-cyan-400 text-cyan-400 py-3 rounded-xl text-lg hover:bg-cyan-900 transition">
            Log In
          </button>
          <button onClick={handleGoogle} disabled={loading}
            className="bg-white text-black py-3 rounded-xl text-lg font-bold hover:bg-gray-100 transition disabled:opacity-50">
            {loading ? 'Loading...' : 'Continue with Google'}
          </button>
        </div>
      )}

      {showForm && (
        <div className="flex flex-col gap-3 w-72">
          <p className="text-center text-cyan-400 font-bold text-lg">
            {showForm === 'register' ? 'Create Account' : 'Welcome Back'}
          </p>
          <input
            className="bg-gray-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="bg-gray-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
          />
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900 bg-opacity-30 rounded-lg p-2">
              {error}
            </p>
          )}
          <button onClick={handleEmailAuth} disabled={loading}
            className="bg-cyan-400 text-black font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-cyan-300 transition">
            {loading ? 'Loading...' : showForm === 'register' ? 'Create Account' : 'Log In'}
          </button>
          <button onClick={() => { setShowForm(null); setError(''); }}
            className="text-gray-400 text-sm text-center hover:text-white transition">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
