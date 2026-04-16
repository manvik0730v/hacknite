import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiUserPlus, FiCheck, FiX, FiChevronRight } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { getLevel } from '../utils/level';
import API from '../services/api';

function LevelBadge({ xp, sinMode }) {
  const level = getLevel(xp || 0);
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sinMode?'bg-red-950 text-red-300':'bg-blue-100 text-blue-700'}`}>
      Lv.{level}
    </span>
  );
}

function UserProfileModal({ uid, onClose, onAddFriend, sinMode, isFriend }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    API.get(`/api/friends/profile/${uid}`).then(r => setProfile(r.data)).catch(console.error);
  }, [uid]);

  if (!profile) return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className={`rounded-3xl p-6 w-80 ${sinMode?'bg-[#140000]':'bg-white'}`}>
        <p className="text-center text-[var(--text2)]">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className={`rounded-3xl p-6 w-full max-w-sm ${sinMode?'bg-[#140000] border border-red-900':'bg-white'}`}
        style={{ boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden mb-2 border-2 border-[var(--border)]"
            style={{ background: sinMode?'linear-gradient(135deg,#3d0000,#1a0000)':'linear-gradient(135deg,#1a56db,#3b7ef8)' }}>
            {profile.profilePhoto
              ? <img src={profile.profilePhoto} className="w-full h-full object-cover" />
              : <span className="text-3xl font-black text-white">{profile.username[0].toUpperCase()}</span>}
          </div>
          <p className="font-black text-xl text-[var(--text)]">{profile.username}</p>
          <div className="flex items-center gap-2 mt-1">
            <LevelBadge xp={profile.xp} sinMode={sinMode} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label:'Longest Run', value:`${((profile.stats?.longestRun||0)/1000).toFixed(2)} km` },
            { label:'Best Pace',   value:`${profile.stats?.bestPace||0} min/km` },
            { label:'Streak',      value:`${profile.streak||0} days` },
            { label:'Districts',   value: profile.districtsDon || 0 },
          ].map(({ label, value }) => (
            <div key={label} className={`rounded-xl p-3 text-center ${sinMode?'bg-red-950':'bg-blue-50'}`}>
              <p className="text-xs text-[var(--text2)]">{label}</p>
              <p className="font-black text-[var(--text)]">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-[var(--border)] text-[var(--text)] font-bold btn-lift">
            Close
          </button>
          {!isFriend && (
            <button onClick={() => { onAddFriend(uid); onClose(); }}
              className={`flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 btn-lift ${sinMode?'bg-red-600':'bg-blue-600'}`}>
              <FiUserPlus size={16} /> Add Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const { sinMode } = useTheme();
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [viewProfile, setViewProfile] = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [dataLoaded, setDataLoaded] = useState(false);
  const searchRef = useRef(null);

  // Load on mount immediately
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await API.get('/api/friends/all');
      setFriends(res.data.friends || []);
      setRequests(res.data.requests || []);
      setAllUsers(res.data.allUsers || []);
      setDataLoaded(true);
    } catch (err) {
      console.error(err);
      setDataLoaded(true);
    }
  };

  const handleSearch = async (val) => {
    setSearch(val);
    try {
      const res = await API.get(`/api/friends/users?search=${encodeURIComponent(val)}`);
      setAllUsers(res.data || []);
    } catch (err) { console.error(err); }
  };

  const sendRequest = async (toUid) => {
    try {
      await API.post('/api/friends/request', { toUid });
      setSentRequests(s => new Set([...s, toUid]));
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const respondRequest = async (requestId, action) => {
    try {
      await API.post('/api/friends/respond', { requestId, action });
      await fetchAll();
    } catch (err) { console.error(err); }
  };

  const friendUids = new Set(friends.map(f => f.uid));
  const accent = sinMode ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-black text-[var(--text)]">Friends</h1>
      </div>

      {!dataLoaded ? (
        <div className="flex items-center justify-center mt-20">
          <div className={`w-8 h-8 rounded-full border-4 border-t-transparent animate-spin ${sinMode?'border-red-600':'border-blue-600'}`} />
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4">
          {/* My friends */}
          <div className="glass-card p-4">
            <p className="font-bold text-[var(--text)] mb-3">My Friends ({friends.length})</p>
            {friends.length === 0 ? (
              <button onClick={() => searchRef.current?.focus()}
                className="w-full text-center text-[var(--text2)] text-sm py-3 hover:text-[var(--text)] transition">
                Make new friends — search below
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map(f => (
                  <button key={f.uid} onClick={() => setViewProfile(f.uid)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg3)] transition w-full text-left btn-lift">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border border-[var(--border)]"
                      style={{ background: sinMode?'linear-gradient(135deg,#3d0000,#1a0000)':'linear-gradient(135deg,#1a56db,#93c5fd)' }}>
                      {f.profilePhoto
                        ? <img src={f.profilePhoto} className="w-full h-full object-cover" />
                        : <span className="font-bold text-white text-sm">{f.username[0].toUpperCase()}</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[var(--text)]">{f.username}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <LevelBadge xp={f.xp} sinMode={sinMode} />
                        <span className="text-xs text-[var(--text2)]">{f.streak||0}d streak</span>
                      </div>
                    </div>
                    <FiChevronRight size={16} className="text-[var(--text2)]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Requests */}
          {requests.length > 0 && (
            <div className="glass-card p-4">
              <p className="font-bold text-[var(--text)] mb-3">Friend Requests ({requests.length})</p>
              <div className="flex flex-col gap-3">
                {requests.map(r => (
                  <div key={r._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg3)] flex items-center justify-center flex-shrink-0 border border-[var(--border)]">
                      <span className="font-bold text-[var(--text)]">{r.from?.username?.[0]?.toUpperCase()}</span>
                    </div>
                    <p className="font-bold text-sm text-[var(--text)] flex-1">{r.from?.username}</p>
                    <button onClick={() => respondRequest(r._id, 'accepted')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white btn-lift ${accent}`}>
                      <FiCheck size={14} />
                    </button>
                    <button onClick={() => respondRequest(r._id, 'rejected')}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg3)] text-[var(--text2)] border border-[var(--border)] btn-lift">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Find people */}
          <div className="glass-card p-4">
            <p className="font-bold text-[var(--text)] mb-3">Find People</p>
            <div className="glass-card flex items-center gap-2 px-3 py-2.5 mb-3">
              <FiSearch size={16} className="text-[var(--text2)]" />
              <input ref={searchRef}
                className="flex-1 bg-transparent text-[var(--text)] text-sm outline-none placeholder:text-[var(--text2)]"
                placeholder="Search by username..."
                value={search} onChange={e => handleSearch(e.target.value)} />
            </div>
            {allUsers.filter(u => u.uid !== user?.uid).length === 0 ? (
              <p className="text-center text-[var(--text2)] text-sm py-3">No users found.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {allUsers.filter(u => u.uid !== user?.uid).map(u => {
                  const isFriend = friendUids.has(u.uid);
                  const sent = sentRequests.has(u.uid);
                  return (
                    <div key={u.uid} className="flex items-center gap-3">
                      <button onClick={() => setViewProfile(u.uid)}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border)] hover:opacity-80 transition btn-lift"
                        style={{ background: sinMode?'linear-gradient(135deg,#3d0000,#1a0000)':'linear-gradient(135deg,#1a56db,#93c5fd)' }}>
                        {u.profilePhoto
                          ? <img src={u.profilePhoto} className="w-full h-full object-cover" />
                          : <span className="font-bold text-white text-sm">{u.username[0].toUpperCase()}</span>}
                      </button>
                      <button onClick={() => setViewProfile(u.uid)} className="flex-1 text-left">
                        <p className="font-bold text-sm text-[var(--text)]">{u.username}</p>
                        <LevelBadge xp={u.xp} sinMode={sinMode} />
                      </button>
                      {isFriend ? (
                        <span className="text-xs text-[var(--text2)] font-bold px-3 py-1.5">Friends</span>
                      ) : sent ? (
                        <span className="text-xs text-[var(--text2)] font-bold px-3 py-1.5 flex items-center gap-1">
                          <FiCheck size={12} /> Sent
                        </span>
                      ) : (
                        <button onClick={() => sendRequest(u.uid)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 btn-lift ${accent}`}>
                          <FiUserPlus size={12} /> Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {viewProfile && (
        <UserProfileModal
          uid={viewProfile}
          sinMode={sinMode}
          isFriend={friendUids.has(viewProfile)}
          onClose={() => setViewProfile(null)}
          onAddFriend={sendRequest}
        />
      )}
    </div>
  );
}
