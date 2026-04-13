import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useStory } from '../context/StoryContext';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiCircle, FiZap, FiLock } from 'react-icons/fi';
import API from '../services/api';

export default function QuestPage() {
  const { sinMode } = useTheme();
  const { triggerStory } = useStory();
  const { dbUser } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => { fetchQuests(); }, [sinMode]);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/quests?mode=${sinMode?'sincity':'uptown'}`);
      setQuests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleQuestTap = (quest) => {
    if (quest.completed || quest.locked) return;
    if (quest.special) {
      // Trigger Stranger intro story, then go to map
      triggerStory('special_quest_intro', () => nav('/map', { state: { quest } }));
    } else {
      nav('/map', { state: { quest } });
    }
  };

  const completed = quests.filter(q => q.completed);
  const pending = quests.filter(q => !q.completed);
  const regular = pending.filter(q => !q.special);
  const special = pending.filter(q => q.special);

  const goalLabel = (q) => {
    if (q.goalType==='time') return q.goalValue>=60 ? `${Math.floor(q.goalValue/60)} min` : `${q.goalValue} sec`;
    if (q.goalType==='distanceInTime') return `${(q.goalValue/1000).toFixed(0)}km in ${Math.floor(q.timeLimit/60)} min`;
    return `${(q.goalValue/1000).toFixed(1)} km`;
  };

  const accent = sinMode ? 'bg-red-600 text-white' : 'bg-blue-600 text-white';
  const xpBadge = sinMode ? 'bg-red-900 text-red-300' : 'bg-blue-100 text-blue-700';

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">{sinMode ? 'SinCity Quests' : 'Quests'}</h1>
          <p className={`text-xs ${sinMode?'text-red-400':'text-blue-400'}`}>
            {sinMode ? 'Prove your dominance' : 'Build your fitness'}
          </p>
        </div>
        <div className="glass-card px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 text-[var(--text)]">
          <FiCheckCircle size={12} />{completed.length}/{quests.length}
        </div>
      </div>

      {/* XP banner */}
      <div className={`mx-4 mb-4 rounded-2xl p-4 btn-lift flex items-center justify-between
        ${sinMode ? 'bg-gradient-to-r from-red-950 to-red-900 border border-red-800' : 'bg-gradient-to-r from-blue-700 to-blue-500'}`}>
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
          {/* Regular quests */}
          {regular.length > 0 && (
            <>
              <p className={`text-xs font-bold uppercase tracking-wider ${sinMode?'text-red-400':'text-blue-400'}`}>Active</p>
              {regular.map(quest => (
                <button key={quest.id} onClick={() => handleQuestTap(quest)}
                  className="w-full text-left glass-card p-4 btn-lift transition active:scale-95">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FiCircle size={14} className="text-[var(--text2)] flex-shrink-0" />
                        <span className="font-bold text-[var(--text)]">{quest.title}</span>
                      </div>
                      <p className="text-sm text-[var(--text2)] ml-5">{quest.description}</p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-black ${xpBadge}`}>
                      +{quest.xp?.toLocaleString()}
                    </span>
                  </div>
                  <p className={`mt-2 text-xs font-bold ml-5 ${sinMode?'text-red-400':'text-blue-500'}`}>
                    Goal: {goalLabel(quest)}
                  </p>
                </button>
              ))}
            </>
          )}

          {/* Special quest */}
          {special.length > 0 && sinMode && (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-500 mt-2">Special Quest</p>
              {special.map(quest => (
                <button key={quest.id} onClick={() => handleQuestTap(quest)}
                  disabled={quest.locked}
                  className={`w-full text-left rounded-2xl p-4 border transition btn-lift
                    ${quest.locked
                      ? 'opacity-50 border-[var(--border)] bg-[var(--bg3)] cursor-not-allowed'
                      : sinMode ? 'glass-card border-yellow-600 hover:border-yellow-400' : 'glass-card'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {quest.locked
                          ? <FiLock size={14} className="text-yellow-600 flex-shrink-0" />
                          : <FiCircle size={14} className="text-yellow-500 flex-shrink-0" />}
                        <span className="font-bold text-[var(--text)]">{quest.title}</span>
                        <span className="text-xs text-yellow-500 font-bold ml-1">SPECIAL</span>
                      </div>
                      <p className="text-sm text-[var(--text2)] ml-5">{quest.description}</p>
                      {quest.locked && (
                        <p className="text-xs text-yellow-600 ml-5 mt-1">Visit the SinCity Map to unlock</p>
                      )}
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-black bg-yellow-900 text-yellow-300">
                      +{quest.xp?.toLocaleString()}
                    </span>
                  </div>
                  {!quest.locked && (
                    <p className="mt-2 text-xs font-bold ml-5 text-yellow-500">Goal: {goalLabel(quest)}</p>
                  )}
                </button>
              ))}
            </>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <>
              <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${sinMode?'text-red-400':'text-blue-400'}`}>Completed</p>
              {completed.map(quest => (
                <div key={quest.id} className="glass-card p-4 opacity-40">
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
