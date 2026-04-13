import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../context/StoryContext';
import API from '../services/api';

export default function OnboardingPage() {
  const { user, setIsNewUser } = useAuth();
  const { triggerStory } = useStory();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    username: user?.displayName?.replace(/\s/g,'').toLowerCase() || '',
    gender: '', height: '', weight: '', profilePhoto: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update('profilePhoto', reader.result);
    reader.readAsDataURL(file);
  };

  const finish = async () => {
    setLoading(true);
    try {
      await API.post('/api/auth/login', {
        username: data.username || user?.email?.split('@')[0] || 'user',
        gender: data.gender || null, height: data.height ? Number(data.height) : null,
        weight: data.weight ? Number(data.weight) : null,
        profilePhoto: data.profilePhoto || null, onboardingDone: true
      });
      setIsNewUser(false);
      // Trigger intro story AFTER onboarding
      triggerStory('onboarding_complete', () => nav('/home'));
    } catch (err) {
      setError('Something went wrong.');
    } finally { setLoading(false); }
  };

  const skipAll = () => {
    setIsNewUser(false);
    triggerStory('onboarding_complete', () => nav('/home'));
  };

  const inputCls = "w-full bg-[var(--bg3)] text-[var(--text)] border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--accent)] transition";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`h-2 rounded-full transition-all duration-300
              ${step===s ? 'bg-[var(--accent)] w-8' : step>s ? 'bg-[var(--accent)] w-2 opacity-50' : 'bg-[var(--border)] w-2'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-black text-center text-[var(--text)]">What should we call you?</h2>
            <p className="text-[var(--text2)] text-center text-sm">Choose your username</p>
            <input className={inputCls} placeholder="Username"
              value={data.username} onChange={e => update('username', e.target.value)} />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button onClick={() => setStep(2)} disabled={!data.username.trim()}
              className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl disabled:opacity-40 btn-lift">
              Continue
            </button>
            <button onClick={skipAll} className="text-[var(--text2)] text-sm text-center py-2">Skip all setup →</button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-black text-center text-[var(--text)]">Your body stats</h2>
            <p className="text-[var(--text2)] text-center text-sm">Helps calculate accurate calories</p>
            <div className="flex gap-2">
              {['Male','Female','Other'].map(g => (
                <button key={g} onClick={() => update('gender', data.gender===g?'':g)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm border transition btn-lift
                    ${data.gender===g ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-[var(--bg3)] text-[var(--text)] border-[var(--border)]'}`}>
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Height (cm)" type="number"
                value={data.height} onChange={e => update('height', e.target.value)} />
              <input className={inputCls} placeholder="Weight (kg)" type="number"
                value={data.weight} onChange={e => update('weight', e.target.value)} />
            </div>
            <button onClick={() => setStep(3)}
              className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl btn-lift">
              Continue
            </button>
            <button onClick={skipAll} className="text-[var(--text2)] text-sm text-center py-2">Skip →</button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4 items-center">
            <h2 className="text-2xl font-black text-center text-[var(--text)]">Profile picture</h2>
            <p className="text-[var(--text2)] text-center text-sm">Optional — you can change this later</p>
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-2 border-[var(--accent)] flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                {data.profilePhoto
                  ? <img src={data.profilePhoto} className="w-full h-full object-cover" />
                  : <span className="text-4xl font-black text-white">{(data.username[0]||'?').toUpperCase()}</span>}
              </div>
              <button onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[var(--accent)] text-white text-xl font-bold flex items-center justify-center shadow-lg border-2 border-[var(--bg)] hover:scale-110 transition btn-lift">
                +
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
            {data.profilePhoto && (
              <button onClick={() => update('profilePhoto','')} className="text-red-400 text-xs">Remove photo</button>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button onClick={finish} disabled={loading}
              className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-xl disabled:opacity-40 btn-lift">
              {loading ? 'Setting up...' : "Let's go! 🚀"}
            </button>
            <button onClick={skipAll} className="text-[var(--text2)] text-sm text-center py-2">Skip →</button>
          </div>
        )}
      </div>
    </div>
  );
}
