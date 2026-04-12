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
    setError(''); setLoading(true);
    try { await loginWithGoogle(); nav('/home'); }
    catch (err) { setError(err.message); setLoading(false); }
  };

  const handleEmailAuth = async () => {
    setError('');
    if (!email || !password) { setError('Enter email and password'); return; }
    if (password.length < 6) { setError('Password must be 6+ characters'); return; }
    setLoading(true);
    try {
      if (showForm === 'register') await registerWithEmail(email, password);
      else await loginWithEmail(email, password);
      nav('/home');
    } catch (err) {
      const codes = {
        'auth/email-already-in-use': 'Email already registered.',
        'auth/user-not-found': 'No account found.',
        'auth/wrong-password': 'Wrong password.',
        'auth/invalid-credential': 'Wrong email or password.',
      };
      setError(codes[err.code] || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-[#111]">SinCity Stride</h1>
        <p className="text-[#888] mt-2 text-sm">Your fitness journey, gamified.</p>
      </div>

      {!showForm && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => { setShowForm('register'); setError(''); }}
            className="w-full bg-[#111] text-white font-bold py-3.5 rounded-2xl text-base hover:bg-[#333] transition">
            Get Started
          </button>
          <button onClick={() => { setShowForm('login'); setError(''); }}
            className="w-full bg-white text-[#111] font-bold py-3.5 rounded-2xl text-base border border-[#ddd] hover:bg-[#f0f0f0] transition">
            Log In
          </button>
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#ddd]" />
            <span className="text-[#aaa] text-xs">or</span>
            <div className="flex-1 h-px bg-[#ddd]" />
          </div>
          <button onClick={handleGoogle} disabled={loading}
            className="w-full bg-white text-[#111] font-semibold py-3.5 rounded-2xl text-base border border-[#ddd] hover:bg-[#f0f0f0] transition flex items-center justify-center gap-2 disabled:opacity-50">
            <span>🌐</span> {loading ? 'Loading...' : 'Continue with Google'}
          </button>
        </div>
      )}

      {showForm && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <h2 className="text-xl font-bold text-center text-[#111]">
            {showForm === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <input className="bg-white border border-[#ddd] text-[#111] p-3.5 rounded-2xl outline-none focus:border-[#111] transition"
            placeholder="Email" type="email"
            value={email} onChange={e => setEmail(e.target.value)} />
          <input className="bg-white border border-[#ddd] text-[#111] p-3.5 rounded-2xl outline-none focus:border-[#111] transition"
            type="password" placeholder="Password (min 6 chars)"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
          {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl p-2">{error}</p>}
          <button onClick={handleEmailAuth} disabled={loading}
            className="w-full bg-[#111] text-white font-bold py-3.5 rounded-2xl disabled:opacity-40 hover:bg-[#333] transition">
            {loading ? 'Loading...' : showForm === 'register' ? 'Create Account' : 'Log In'}
          </button>
          <button onClick={() => { setShowForm(null); setError(''); }}
            className="text-[#888] text-sm text-center hover:text-[#111] transition">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
