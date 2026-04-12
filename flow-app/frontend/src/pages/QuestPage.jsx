import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startQuest = (quest) => {
    if (quest.completed) return;
    nav('/map', { state: { quest } });
  };

  const completed = quests.filter(q => q.completed);
  const pending = quests.filter(q => !q.completed);

  return (
    <div className="min-h-screen pb-24 bg-[var(--bg)]">
      <div className="px-4 pt-5 pb-3 flex justify-between items-center">
        <h1 className="text-2xl font-black text-[var(--text)]">Quests</h1>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border
          ${sinMode ? 'bg-red-950 border-red-800 text-red-300' : 'bg-[var(--bg3)] border-[var(--border)] text-[var(--text2)]'}`}>
          {completed.length}/{quests.length} done
        </div>
      </div>

      {/* XP display */}
      <div className={`mx-4 mb-4 rounded-2xl p-4 border flex items-center justify-between
        ${sinMode ? 'bg-red-950 border-red-900' : 'bg-[#111] border-transparent'}`}>
        <div>
          <p className="text-white text-sm font-bold">Total XP</p>
          <p className="text-white text-3xl font-black">{dbUser?.xp || 0}</p>
        </div>
        <span className="text-4xl">💫</span>
      </div>

      {loading ? (
        <p className="text-center text-[var(--text2)] mt-10">Loading quests...</p>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {/* Active quests */}
          {pending.length > 0 && (
            <>
              <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider mt-1">Active</p>
              {pending.map(quest => (
                <button key={quest.id} onClick={() => startQuest(quest)}
                  className={`w-full text-left rounded-2xl p-4 border transition active:scale-95
                    ${sinMode ? 'bg-[var(--card)] border-red-900 hover:border-red-600' : 'bg-white border-[var(--border)] hover:border-[#aaa] shadow-sm'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{quest.emoji}</span>
                        <span className="font-bold text-[var(--text)]">{quest.title}</span>
                      </div>
                      <p className="text-sm text-[var(--text2)]">{quest.description}</p>
                    </div>
                    <div className={`ml-3 px-2.5 py-1 rounded-full text-xs font-black
                      ${sinMode ? 'bg-red-900 text-red-300' : 'bg-[#f0f0f0] text-[#555]'}`}>
                      +{quest.xp.toLocaleString()} XP
                    </div>
                  </div>
                  <div className={`mt-3 flex items-center gap-2 text-xs font-bold
                    ${sinMode ? 'text-red-400' : 'text-[#111]'}`}>
                    <span>▶ Tap to start</span>
                    <span className="text-[var(--text2)]">•</span>
                    <span className="text-[var(--text2)]">{quest.goalType === 'time'
                      ? `${quest.goalValue >= 60 ? Math.floor(quest.goalValue/60)+'min' : quest.goalValue+'sec'}`
                      : `${(quest.goalValue/1000).toFixed(1)}km`}
                    </span>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Completed quests */}
          {completed.length > 0 && (
            <>
              <p className="text-xs font-bold text-[var(--text2)] uppercase tracking-wider mt-3">Completed</p>
              {completed.map(quest => (
                <div key={quest.id}
                  className="rounded-2xl p-4 border opacity-50 bg-[var(--bg3)] border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{quest.emoji}</span>
                    <span className="font-bold text-[var(--text)] line-through">{quest.title}</span>
                    <span className="ml-auto text-green-500 font-bold text-sm">✓ Done</span>
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
