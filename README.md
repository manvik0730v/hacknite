# ==== (Flow Like Water) — Complete Hackathon Implementation Guide

---

## PHASE 0 — GITHUB + FOLDER STRUCTURE

### Create GitHub Repo
```bash
# On GitHub: click New Repository → name it "flow-app" → create
# Then locally:
git clone https://github.com/YOUR_USERNAME/flow-app.git
cd flow-app
```

### Project Folder Tree
```
flow-app/
├── frontend/                  # React app
│   ├── public/
│   ├── src/
│   │   ├── assets/            # images, character SVGs
│   │   ├── components/        # reusable UI pieces
│   │   │   ├── BottomNav.jsx
│   │   │   ├── CharacterGuide.jsx   # animated boy/girl character
│   │   │   ├── SinModeToggle.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── QuestPage.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── FriendsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   ├── api.js           # axios calls to backend
│   │   │   └── firebase.js      # firebase init + auth
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx  # normal vs SIN mode
│   │   ├── hooks/
│   │   │   └── useRunTracker.js  # GPS tracking logic
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                   # Node + Express
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── questController.js
│   │   ├── runController.js
│   │   ├── friendController.js
│   │   └── mapController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # Firebase token verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Run.js
│   │   ├── Quest.js
│   │   └── Region.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── questRoutes.js
│   │   ├── runRoutes.js
│   │   └── friendRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

### Root .gitignore
```
# Dependencies
node_modules/

# Environment variables — NEVER commit these
.env
.env.local
.env.production

# Build outputs
dist/
build/

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## PHASE 1 — BACKEND SETUP

### Initialize
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose dotenv cors helmet morgan
npm install firebase-admin          
npm install nodemon --save-dev
```

### package.json scripts
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### backend/.env
```
PORT=8000
MONGO_URI=mongodb+srv://manvik0730v:YOUR_DB_PASSWORD@cluster0.qbigyod.mongodb.net/flowapp?appName=Cluster0
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### backend/config/db.js
```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected ✓');
  } catch (err) {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### backend/server.js
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/users',   require('./routes/userRoutes'));
app.use('/api/quests',  require('./routes/questRoutes'));
app.use('/api/runs',    require('./routes/runRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));

app.get('/', (req, res) => res.json({ message: '==== API running' }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

---

## PHASE 2 — MONGODB MODELS

### backend/models/User.js
```js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  username: { type: String, required: true, unique: true },
  email: String,
  profilePhoto: String,
  height: Number,
  weight: Number,
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalCalories: { type: Number, default: 0 },
  badges: [{ name: String, description: String, icon: String, earnedAt: Date }],
  stats: {
    longestRun: { type: Number, default: 0 },
    bestPace: { type: Number, default: 0 },
    regionsCapture: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 }
  },
  friends: [{ type: String }], // array of uids
  sinModeEnabled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
```

### backend/models/Run.js
```js
const mongoose = require('mongoose');

const RunSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  duration: Number,      // seconds
  distance: Number,      // meters
  calories: Number,
  pace: Number,          // min/km
  steps: Number,
  route: [{              // GPS coordinates array
    lat: Number,
    lng: Number,
    timestamp: Number
  }],
  regionsVisited: [String]
}, { timestamps: true });

module.exports = mongoose.model('Run', RunSchema);
```

### backend/models/Quest.js
```js
const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['daily', 'level'] },
  requiredLevel: { type: Number, default: 1 },
  goal: Number,          // e.g. 6000 steps
  goalType: String,      // 'steps', 'distance', 'calories'
  xpReward: Number,
  badgeReward: String,
  expiresAt: Date
});

module.exports = mongoose.model('Quest', QuestSchema);
```

### backend/models/Region.js (SIN mode)
```js
const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  name: String,
  center: { lat: Number, lng: Number },
  radius: Number,        // meters
  capturedBy: String,    // userId
  capturedByTeam: [String],
  requirements: String,
  glowColor: { type: String, default: '#00ffcc' },
  capturedAt: Date
});

module.exports = mongoose.model('Region', RegionSchema);
```

---

## PHASE 3 — FIREBASE AUTH MIDDLEWARE

### Install Firebase Admin
```bash
# In backend/
npm install firebase-admin
```

### Get your Firebase service account:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" → download JSON
3. Save as `backend/serviceAccountKey.json`
4. Add to .gitignore: `serviceAccountKey.json`

### backend/middleware/authMiddleware.js
```js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // contains uid, email, etc.
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { protect };
```

### backend/routes/authRoutes.js
```js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Called after Firebase login to create/get user in MongoDB
router.post('/login', protect, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { username, height, weight } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email, username, height, weight });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

---

## PHASE 4 — BACKEND ROUTES (KEY EXAMPLES)

### backend/routes/runRoutes.js
```js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Run = require('../models/Run');
const User = require('../models/User');

// Save a completed run
router.post('/', protect, async (req, res) => {
  try {
    const run = await Run.create({ userId: req.user.uid, ...req.body });
    // Update user stats
    const user = await User.findOne({ uid: req.user.uid });
    if (run.distance > user.stats.longestRun) {
      user.stats.longestRun = run.distance;
    }
    user.stats.totalCalories += run.calories || 0;
    await user.save();
    res.status(201).json(run);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all runs for user
router.get('/', protect, async (req, res) => {
  const runs = await Run.find({ userId: req.user.uid }).sort({ date: -1 });
  res.json(runs);
});

// Delete a run
router.delete('/:id', protect, async (req, res) => {
  await Run.findByIdAndDelete(req.params.id);
  res.json({ message: 'Run deleted' });
});

module.exports = router;
```

### backend/routes/questRoutes.js
```js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Quest = require('../models/Quest');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });
  const quests = await Quest.find({
    $or: [
      { type: 'daily' },
      { type: 'level', requiredLevel: { $lte: user.level } }
    ]
  });
  res.json(quests);
});

module.exports = router;
```

---

## PHASE 5 — FRONTEND SETUP

### Create React App with Vite
```bash
cd ..   # back to root flow-app/
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### tailwind.config.js
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sin: {
          bg: '#0a0a0a',
          accent: '#00ffcc',
          glow: '#ff00ff',
        }
      },
      fontFamily: {
        flow: ['"Orbitron"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* SIN mode body override */
body.sin-mode {
  background-color: #0a0a0a;
  color: #e0e0e0;
}
```

### Install frontend dependencies
```bash
npm install axios react-router-dom leaflet react-leaflet
npm install framer-motion   # for character animations
npm install firebase
```

### frontend/.env
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:8000
```

---

## PHASE 6 — FIREBASE FRONTEND SETUP

### Go to firebase.google.com:
1. Create project → name it "flow-app"
2. Add Web App → copy config
3. Authentication → Sign-in methods → Enable Google + Email/Password

### src/services/firebase.js
```js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup,
         createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const registerWithEmail = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
export const loginWithEmail = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const logout = () => auth.signOut();
```

### src/services/api.js — Sending tokens to backend
```js
import axios from 'axios';
import { auth } from './firebase';

const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

// Automatically attach Firebase token to every request
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

---

## PHASE 7 — CONTEXT SETUP

### src/context/AuthContext.jsx
```jsx
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
        // Sync with MongoDB on every login
        const res = await API.post('/api/auth/login', {
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        });
        setDbUser(res.data);
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
```

### src/context/ThemeContext.jsx
```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [sinMode, setSinMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('sin-mode', sinMode);
  }, [sinMode]);

  return (
    <ThemeContext.Provider value={{ sinMode, setSinMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## PHASE 8 — KEY PAGE IMPLEMENTATIONS

### src/pages/LoginPage.jsx
```jsx
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
```

### src/pages/HomePage.jsx (skeleton)
```jsx
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CharacterGuide from '../components/CharacterGuide';

export default function HomePage() {
  const { dbUser } = useAuth();
  const { sinMode, setSinMode } = useTheme();

  // Fetch weekly steps from backend for histogram
  // useEffect → API.get('/api/runs') → process data

  return (
    <div className={`min-h-screen pb-20 ${sinMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Top bar */}
      <div className="flex justify-between items-center p-4">
        <div>
          <p className="text-sm text-gray-500">Hi!</p>
          <p className="text-xl font-bold">{dbUser?.username}</p>
        </div>
        {/* SIN Mode toggle */}
        <button onClick={() => setSinMode(!sinMode)}
          className={`px-4 py-2 rounded-full font-bold text-sm transition ${
            sinMode ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-white'}`}>
          {sinMode ? '⚡ SIN' : 'NORMAL'}
        </button>
      </div>

      {/* Stats grid 2x2 */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
        {[
          { label: 'Steps Today', value: dbUser?.todaySteps || 0 },
          { label: 'Level', value: dbUser?.level || 1 },
          { label: 'Streak 🔥', value: `${dbUser?.streak || 0} days` },
          { label: 'Calories', value: `${dbUser?.todayCalories || 0} kcal` }
        ].map(({ label, value }) => (
          <div key={label} className={`rounded-2xl p-4 ${sinMode ? 'bg-gray-900 border border-cyan-900' : 'bg-white shadow'}`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Animated character */}
      <CharacterGuide event="home" sinMode={sinMode} />

      {/* Ongoing quests preview */}
      {/* Weekly steps histogram — use recharts or canvas */}
    </div>
  );
}
```

### src/pages/MapPage.jsx (GPS tracking)
```jsx
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function MapPage() {
  const { dbUser } = useAuth();
  const { sinMode } = useTheme();
  const [running, setRunning] = useState(false);
  const [route, setRoute] = useState([]);
  const [regions, setRegions] = useState([]);
  const watchId = useRef(null);
  const startTime = useRef(null);

  const startRun = () => {
    setRunning(true);
    startTime.current = Date.now();
    watchId.current = navigator.geolocation.watchPosition((pos) => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() };
      setRoute(prev => [...prev, point]);
    }, null, { enableHighAccuracy: true });
  };

  const stopRun = async () => {
    navigator.geolocation.clearWatch(watchId.current);
    setRunning(false);
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    // Calculate distance from route
    const distance = calculateDistance(route);
    const calories = Math.floor(distance * 0.06);
    await API.post('/api/runs', { route, duration, distance, calories });
    setRoute([]);
  };

  // Load SIN mode regions
  useEffect(() => {
    if (sinMode) {
      API.get('/api/regions').then(res => setRegions(res.data));
    }
  }, [sinMode]);

  return (
    <div className="h-screen relative pb-20">
      <MapContainer
        center={[12.9716, 77.5946]} // Bangalore default
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={sinMode
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        {route.length > 1 && (
          <Polyline positions={route.map(p => [p.lat, p.lng])} color={sinMode ? '#00ffcc' : '#4f46e5'} />
        )}
        {/* SIN mode glowing regions */}
        {sinMode && regions.map(r => (
          <Circle key={r._id} center={[r.center.lat, r.center.lng]}
            radius={r.radius} color={r.glowColor} fillOpacity={0.2} />
        ))}
      </MapContainer>

      {/* Play/Pause button */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000]">
        <button
          onClick={running ? stopRun : startRun}
          className={`w-16 h-16 rounded-full font-bold text-2xl shadow-xl ${
            running ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'}`}>
          {running ? '■' : '▶'}
        </button>
      </div>
    </div>
  );
}

function calculateDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    const R = 6371e3;
    const φ1 = route[i-1].lat * Math.PI/180;
    const φ2 = route[i].lat * Math.PI/180;
    const Δφ = (route[i].lat - route[i-1].lat) * Math.PI/180;
    const Δλ = (route[i].lng - route[i-1].lng) * Math.PI/180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  return Math.floor(total);
}
```

### src/components/BottomNav.jsx
```jsx
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const tabs = [
  { path: '/quests', label: 'Quest', icon: '⚔️' },
  { path: '/map',    label: 'Map',   icon: '🗺️' },
  { path: '/home',   label: 'Home',  icon: '🏠' },
  { path: '/friends',label: 'Friends',icon: '👥' },
  { path: '/profile',label: 'Profile',icon: '👤' },
];

export default function BottomNav() {
  const { sinMode } = useTheme();
  return (
    <nav className={`fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50
      ${sinMode ? 'bg-black border-t border-cyan-900' : 'bg-white border-t border-gray-200'}`}>
      {tabs.map(t => (
        <NavLink key={t.path} to={t.path}
          className={({ isActive }) => `flex flex-col items-center text-xs gap-0.5
            ${isActive ? (sinMode ? 'text-cyan-400' : 'text-indigo-600') : 'text-gray-400'}`}>
          <span className="text-xl">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

### src/components/CharacterGuide.jsx
```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const dialogues = {
  home:    { normal: "Ready to crush today's goals?", sin: "Rise up, warrior. The city is yours." },
  quest:   { normal: "Complete your quests to level up!", sin: "Every mission brings you closer to power." },
  finish:  { normal: "Awesome work today! 🎉", sin: "You have conquered. Rest, then rise again." },
  quit:    { normal: "Don't give up!", sin: "You have become soft and weak {username}. Get gud." },
};

export default function CharacterGuide({ event, sinMode, username }) {
  const [visible, setVisible] = useState(true);
  const text = dialogues[event]?.[sinMode ? 'sin' : 'normal']
    ?.replace('{username}', username || 'warrior');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [event]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className={`fixed bottom-20 left-4 flex items-end gap-3 z-40`}>
          {/* Character avatar — swap src based on sinMode */}
          <div className={`w-16 h-16 rounded-full border-2 overflow-hidden
            ${sinMode ? 'border-cyan-400' : 'border-indigo-400'}`}>
            <img src={sinMode ? '/character-sin.png' : '/character-normal.png'}
              alt="guide" className="w-full h-full object-cover" />
          </div>
          {/* Speech bubble */}
          <div className={`max-w-48 rounded-2xl px-3 py-2 text-sm
            ${sinMode ? 'bg-gray-900 text-cyan-300 border border-cyan-800' : 'bg-white shadow text-gray-800'}`}>
            {text}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## PHASE 9 — SIN MODE STORY MODE (backend route)

### backend/routes/storyRoutes.js
```js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Story mode missions — can be seeded in DB or hardcoded
const storyMissions = [
  { id: 1, task: 'Run 3km within 30 minutes', goal: { type: 'distance', value: 3000, timeLimit: 1800 } },
  { id: 2, task: 'Capture 2 regions in SIN mode', goal: { type: 'regions', value: 2 } },
];

router.get('/mission/:id', protect, (req, res) => {
  const mission = storyMissions.find(m => m.id == req.params.id);
  res.json(mission || { error: 'Mission not found' });
});

module.exports = router;
```

---

## PHASE 10 — RUNNING EVERYTHING

### Install concurrently at root
```bash
# At flow-app root
npm init -y
npm install concurrently --save-dev
```

### Root package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
    "backend": "npm run dev --prefix backend",
    "frontend": "npm run dev --prefix frontend"
  }
}
```

### Start everything with:
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
```

---

## PHASE 11 — MAP API (FREE OPTIONS)

**Best choice: Leaflet.js + OpenStreetMap** — 100% free, no API key needed.
```bash
npm install leaflet react-leaflet
```
- Dark theme tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (free, Carto)
- Normal tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

**For routing/path analysis**: OpenRouteService API (free tier, 2000 req/day)
- API: `https://api.openrouteservice.org/v2/`
- Sign up at openrouteservice.org for free key

**Strava API** — requires users to connect their Strava account. Good for importing existing runs.

---

## PHASE 12 — DEPLOYMENT (optional but fast)

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → import project at vercel.com → auto deploys
```

### Backend → Render.com (free tier)
1. Push backend to GitHub
2. Go to render.com → New Web Service
3. Set environment variables in Render dashboard
4. Set start command: `node server.js`

---

## SECURITY CHECKLIST

- [ ] `.env` files are in `.gitignore`
- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] All backend routes that need auth use `protect` middleware
- [ ] Frontend never exposes Firebase Admin SDK
- [ ] MongoDB connection string has correct IP whitelist (0.0.0.0/0 for hackathon)
- [ ] CORS is set to your frontend URL only

---

## QUICK START COMMAND SEQUENCE (copy-paste order)

```bash
# 1. Clone and setup
git clone https://github.com/YOU/flow-app && cd flow-app

# 2. Backend
cd backend && npm install && cp .env.example .env
# → fill in MONGO_URI and Firebase details in .env

# 3. Frontend
cd ../frontend && npm install && cp .env.example .env
# → fill in Firebase web config keys in .env

# 4. Run both
cd .. && npm run dev
```

That's it. ==== is live.
