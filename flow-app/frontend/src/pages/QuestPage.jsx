import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiCircle, FiZap } from 'react-icons/fi';
import API from '../services/api';

export default function QuestPage() {
  const { sinMode } = useTheme();
  const { dbUser, refreshUser } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => { fetchQuests(); }, []);

  const fetchQuests = async () => {
    try {
      const res = await API.get('/api/quests');
      setQuests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const completed = quests.filter(q => q.completed);
  const pending = quests.filter(q => !q.completed);

  const goalLabel = (q) => q.goalType === 'time'
    ? q.goalValue >= 60 ? `${Math.floor(q.goalValue/60)} min` : `${q.goalValue} sec`
    : `${(q.goalValue/1000).toFixed(1)} km`;

  return (
    <div className="min-h-screen pb-24 bg-[var(--bg)]">
      <div className="px-4 pt-5 pb-3 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[var(--text)]">Quests</h1>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1
          ${sinMode ? 'bg-red-950 border-red-800 text-red-300' : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text2)]'}`}>
          <FiCheckCircle size={12} />
          {completed.length}/{quests.length}
        </div>
      </div>

      {/* XP banner */}
      <div className={`mx-4 mb-4 rounded-2xl p-4 border flex items-center justify-between
        ${sinMode ? 'bg-red-950 border-red-900' : 'bg-[#111] border-transparent'}`}>
        <div>
          <p className="text-white text-xs font-bold opacity-70">Total XP</p>
          <p className="text-white text-3xl font-black">{dbUser?.xp || 0}</p>
        </div>
        <FiZap size={36} className="text-yellow-400" />
      </div>

      {loading ? (
        <p className="text-center text-[var(--text2)] mt-10">Loading quests...</p>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {pending.length > 0 && (
            <>
              <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider">Active</p>
              {pending.map(quest => (
                <button key={quest.id}
                  onClick={() => nav('/map', { state: { quest } })}
                  className={`w-full text-left rounded-2xl p-4 border transition active:scale-95
                    ${sinMode ? 'bg-[var(--card)] border-red-900 hover:border-red-500' : 'bg-white border-[var(--border)] hover:border-[#999] shadow-sm'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCircle size={14} className="text-[var(--text2)] flex-shrink-0" />
                        <span className="font-bold text-[var(--text)]">{quest.title}</span>
                      </div>
                      <p className="text-sm text-[var(--text2)] ml-5">{quest.description}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-black
                      ${sinMode ? 'bg-red-900 text-red-300' : 'bg-[#f0f0f0] text-[#555]'}`}>
                      +{quest.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <p className={`mt-2 text-xs font-bold ml-5 ${sinMode?'text-red-400':'text-[#555]'}`}>
                    Goal: {goalLabel(quest)}
                  </p>
                </button>
              ))}
            </>
          )}

          {completed.length > 0 && (
            <>
              <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider mt-2">Completed</p>
              {completed.map(quest => (
                <div key={quest.id}
                  className="rounded-2xl p-4 border opacity-40 bg-[var(--bg3)] border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    <span className="font-bold text-[var(--text)] line-through">{quest.title}</span>
                    <span className="ml-auto text-green-500 font-bold text-sm">Done</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
