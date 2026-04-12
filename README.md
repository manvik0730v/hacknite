# 🏙️ SinCity Stride

> *The streets don't care about your excuses. Run.*

**SinCity Stride** is a gamified fitness web application that transforms your daily runs into a citywide conquest. Complete quests, capture districts, challenge friends, and climb the leaderboard — all powered by real-world movement.

Built for **HackNite 2026** by Zense — Web Development Track.

---

## 📸 Overview

| Theme | Description |
|-------|-------------|
| **Uptown** | Clean, light mode — minimal and fresh |
| **SinCity** | Dark, red-accented — cinematic and ruthless |

In **SinCity mode**, the map comes alive. Districts glow red when you own them. The Don/Lord system activates. Story Mode unlocks. The city is yours to conquer.

---

## ✨ Features

### 🔐 Authentication
- Firebase Authentication (Google + Email/Password)
- First-login onboarding: set username, height, weight, gender (all skippable)
- Firebase tokens verified server-side on every protected API call

### 🏠 Home
- Personalized greeting: *Hi, username!*
- Interactive calendar showing active days (days you ran or completed a quest)
- Scrollable month-by-month calendar navigation
- Daily streak counter — keep it alive by running or completing a quest each day
- App logo displayed prominently
- Theme toggle (Uptown ↔ SinCity) — fixed-width pill switch, never resizes

### ⚡ Quests
- 10 progressive quests from a 10-second test run to a 5 km milestone
- Each quest has an XP reward (1,000 → 10,000 XP)
- Progress bar per quest showing completion status
- Quests launch the map tracker when clicked
- Completed quests are permanently marked — XP awarded only once
- Completing a quest counts as an active day for streak purposes

| # | Quest | Target | XP |
|---|-------|--------|----|
| 1 | System Test Run | 10 seconds | 1,000 |
| 2 | Warm-Up Walk | 5 minutes | 2,000 |
| 3 | First Short Run | 2 minutes | 3,000 |
| 4 | 10-Minute Session | 10 minutes | 4,000 |
| 5 | First Distance | 1 km | 5,000 |
| 6 | Quick Time Challenge | 5 minutes continuous | 6,000 |
| 7 | Distance Builder | 2 km | 7,000 |
| 8 | Endurance Time | 20 minutes | 8,000 |
| 9 | Distance Push | 3 km | 9,000 |
| 10 | Beginner Milestone | 5 km | 10,000 |

### 🗺️ Map
- Full-screen interactive map of Bangalore (OpenStreetMap via Leaflet — **free, no API key**)
- Play/Pause button overlaid on the map to start/stop run tracking
- Live GPS location tracking using browser Geolocation API
- Haversine formula calculates real distance between GPS points
- 23 predefined Bangalore districts as polygon boundaries
- Automatically detects which district you're running in
- Distance added to each district as you move through it
- Save run dialog appears centered on screen (not hidden by nav bar) with:
  - Distance (km)
  - Duration
  - Average pace (min/km)
  - Steps
- Run saved to database and added to run history

#### District List
Jayanagar · JP Nagar · Banashankari · Basavanagudi · BTM Layout · Bommanahalli · Electronic City · Whitefield · Marathahalli · HSR Layout · Bellandur · Koramangala · Majestic · Indiranagar · MG Road · Brigade Road · Malleswaram · Frazer Town · Hebbal · Yelahanka · Rajajinagar · Yeshwanthpur · Kengeri

#### Scrollable District List (below map)
- Every district shows your distance covered there
- Shows current Don/Lord of the district
- "Unclaimed Territory" if nobody owns it yet
- Your owned districts appear in a dedicated "Your Territory" section

#### Don / Lord System *(SinCity mode only)*
- The user with the **most total distance** in a district becomes the **Don**
- Districts you own **glow red** on the map (cyan in Uptown mode when this is visible)
- Leaderboard per district showing all runners ranked by distance
- Owning districts increments your district count on your profile
- Losing the top spot transfers ownership in real time

### 👥 Friends
**Section A — Your Network**
- Lists all current friends with profile picture and stats
- Incoming friend requests with Accept / Reject buttons
- "Make new friends" prompt if friend list is empty, scrolls to search

**Section B — Discover Users**
- Search bar to find any user by username
- Full list of all registered users
- Add Friend button → sends a request to their inbox
- **Mutual request auto-accept**: if User A sends User B a request and User B also sends User A one, they are automatically friends — no conflicting state possible
- Click any user to view their public profile:
  - Username, profile picture
  - Longest run, best pace, streak, districts owned (2×2 grid)
  - Add Friend button (hidden if already friends)

### 👤 Profile
- Profile picture with pencil edit button → upload from device
- Display: username, email, height, weight, gender, XP points
- All-time records (2×2 grid):
  - Longest Run
  - Best Pace
  - Streak
  - Districts Owned (as Don)
- Edit profile: username, height, weight, gender, phone
- **My Runs** — full history of saved runs with distance, duration, pace, date
  - Option to delete individual runs (does not affect streak)
- Logout button at the bottom

### 🎭 Character System
- A male and female character appear throughout the app
- Show dialogues on key events: app open, quest complete, run saved, streak milestone
- **Uptown mode**: casual, friendly appearance and tone
- **SinCity mode**: same characters, more intense — darker aesthetic, more aggressive dialogue

### 📖 Story Mode *(SinCity mode only)*
Five-phase narrative driven by real-world activity:

| Phase | NPC | Personality | Key Tasks |
|-------|-----|-------------|-----------|
| 1 — Awakening | Kaizen | Calm mentor | Walk 2,000 steps, 2-day streak, 1 quest |
| 2 — Resistance | Lethargy | Discouraging enemy | Walk 5,000 steps, 2 quests in one day |
| 3 — Control | Nyx | Analytical strategist | Full tracked run, 5-day streak |
| 4 — Conquest | Virex | Competitive rival | Capture a district, beat a friend |
| 5 — Inner War | Abyss | Your dark self | 7-day streak, longest run, 3 hard quests |

- Typewriter-effect dialogue
- Success / failure / quit states
- Quit penalty dialogue: *"You have become soft and weak, [username]. Get gud."*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Icons | React Icons |
| Maps | Leaflet + React Leaflet (OpenStreetMap) |
| Authentication | Firebase Auth (Google + Email/Password) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Token Verification | Firebase Admin SDK |
| HTTP Client | Axios |
| Dev server | Nodemon |
| Fonts | Bebas Neue (display) + DM Sans (body) + JetBrains Mono |

---

## 📁 Project Structure

```
sincity-stride/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login/register + onboarding
│   │   ├── userController.js      # Profile CRUD
│   │   ├── runController.js       # Save runs, streak logic, district updates
│   │   ├── questController.js     # Quest completion + XP
│   │   ├── friendController.js    # Friend requests, mutual accept logic
│   │   └── districtController.js  # District leaderboards + lord
│   ├── middleware/
│   │   ├── verifyToken.js         # Firebase Admin token verification
│   │   └── errorHandler.js        # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema (xp, streak, activeDays, friends…)
│   │   ├── Run.js                 # Run schema (distance, pace, districts…)
│   │   ├── District.js            # District leaderboard + lord
│   │   └── Quest.js               # Quest completion records
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── runs.js
│   │   ├── quests.js
│   │   ├── friends.js
│   │   └── districts.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logo.svg               # App logo (add your own)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Top bar + bottom nav wrapper
│   │   │   ├── BottomNav.jsx      # 5-tab navigation bar
│   │   │   ├── ThemeToggle.jsx    # Uptown ↔ SinCity pill switch
│   │   │   └── CharacterDialogue.jsx  # Floating character speech bubble
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Firebase + DB user state
│   │   │   └── ThemeContext.jsx   # Theme state + localStorage persistence
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login / sign up page
│   │   │   ├── Onboarding.jsx     # First-time profile setup
│   │   │   ├── Home.jsx           # Dashboard + calendar + streak
│   │   │   ├── Quests.jsx         # Quest list with progress bars
│   │   │   ├── MapPage.jsx        # Live GPS tracking + districts
│   │   │   ├── Friends.jsx        # Friends, requests, user search
│   │   │   └── Profile.jsx        # Profile, stats, run history, edit
│   │   ├── services/
│   │   │   ├── authService.js     # Firebase auth helpers
│   │   │   ├── api.js             # Axios instance with auto-token
│   │   │   └── userService.js     # All API call functions
│   │   ├── constants/
│   │   │   └── quests.js          # Quest definitions with XP values
│   │   ├── utils/
│   │   │   └── districtBounds.js  # Bangalore polygons + Haversine + point-in-polygon
│   │   ├── App.jsx                # Router + protected routes
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles + CSS theme variables
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- A MongoDB Atlas account (free tier works)
- A Firebase project

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sincity-stride.git
cd sincity-stride
```

### 2. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it `sincity-stride`
3. Go to **Authentication** → **Sign-in method** → Enable:
   - Google
   - Email/Password
4. Go to **Project Settings** → **General** → scroll to **Your apps** → click **Web** (`</>`)
5. Register the app → copy the `firebaseConfig` object — you'll need these values for your frontend `.env`
6. Go to **Project Settings** → **Service Accounts** → click **Generate new private key**
7. Save the downloaded JSON as `backend/serviceAccountKey.json`
8. **Add `serviceAccountKey.json` to `.gitignore` immediately**

### 3. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://manvik0730v:YOUR_PASSWORD@cluster0.qbigyod.mongodb.net/sincitystride?appName=Cluster0
FIREBASE_PROJECT_ID=your-firebase-project-id
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `frontend/.env` with values from your Firebase project settings:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Add Your Logo

Place your logo file at:
```
frontend/public/logo.svg
```

### 6. Run the Project

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

**Or run both simultaneously from the root** (optional):

```bash
# In root directory
npm install -D concurrently

# Add to root package.json scripts:
# "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""

npm run dev
```

---

## 🔌 API Reference

All endpoints require a Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login or register user in MongoDB |
| POST | `/api/auth/onboarding` | Complete first-time profile setup |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile (username, height, weight, etc.) |
| GET | `/api/users/all?search=` | Get all users (with optional search) |
| GET | `/api/users/:uid` | Get public profile of any user |

### Runs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/runs` | Save a completed run |
| GET | `/api/runs/my` | Get all runs for current user |
| DELETE | `/api/runs/:id` | Delete a specific run |
| POST | `/api/runs/mark-active` | Mark today as active (for streak) |

### Quests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quests/complete` | Complete a quest, award XP |
| GET | `/api/quests/completed` | Get list of completed quest IDs |

### Friends
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | Get friends list + incoming requests |
| POST | `/api/friends/request` | Send a friend request |
| POST | `/api/friends/respond` | Accept or reject a request |

### Districts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/districts` | Get all districts with leaderboards |
| GET | `/api/districts/mine` | Get districts where current user is Lord |
| GET | `/api/districts/:name` | Get a specific district |

---

## 🗄️ Database Schema

### User
```js
{
  uid: String,              // Firebase UID (primary key)
  username: String,         // unique, set during onboarding
  email: String,
  profilePic: String,       // base64 or URL
  height: Number,           // cm
  weight: Number,           // kg
  gender: String,           // 'male' | 'female' | 'other'
  phone: String,
  xp: Number,               // default 0
  streak: Number,           // consecutive active days
  lastActiveDate: String,   // 'YYYY-MM-DD'
  activeDays: [String],     // all days with activity
  longestRun: Number,       // km
  bestPace: Number,         // min/km (lower = better)
  totalDistricts: Number,   // districts where user is Lord
  onboardingComplete: Boolean,
  friends: [String],        // array of UIDs
  friendRequests: [String], // incoming request UIDs
  sentRequests: [String],   // outgoing request UIDs
  completedQuests: [String] // quest IDs
}
```

### Run
```js
{
  uid: String,
  date: String,             // 'YYYY-MM-DD'
  distance: Number,         // km
  duration: Number,         // seconds
  avgPace: Number,          // min/km
  steps: Number,
  districts: [{
    name: String,
    distance: Number        // km covered in this district
  }],
  startTime: Date,
  endTime: Date
}
```

### District
```js
{
  name: String,             // unique district name
  leaderboard: [{
    uid: String,
    username: String,
    profilePic: String,
    totalDistance: Number   // km (sorted descending)
  }],
  lord: {
    uid: String,
    username: String,
    profilePic: String
  }
}
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Set **Root Directory** to `frontend`
4. Add all `VITE_*` environment variables in the Vercel dashboard
5. Deploy — Vercel auto-detects Vite

```bash
# Or deploy via CLI
npm i -g vercel
cd frontend
vercel
```

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → Connect your repo
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `backend/.env` in the Render dashboard
6. Add your `serviceAccountKey.json` contents as an env variable or use Render's secret files

### Database → MongoDB Atlas

Your cluster is already set up at:
```
cluster0.qbigyod.mongodb.net
```

Make sure to whitelist `0.0.0.0/0` in Atlas Network Access for Render's dynamic IPs.

---

## 🔒 Security Best Practices

- **Never commit `.env` files** — they are in `.gitignore`
- **Never commit `serviceAccountKey.json`** — treat it like a password
- All API routes are protected with `verifyToken` middleware
- Firebase tokens expire after 1 hour — the Axios interceptor auto-refreshes them
- CORS is restricted to your frontend URL only
- Helmet.js sets secure HTTP headers on all responses

---

## 🗺️ How District Detection Works

1. User starts a run — GPS coordinates stream in every second
2. Each coordinate is checked against 23 polygon boundaries using the **ray casting algorithm**
3. If the point is inside a polygon, that district gets the incremental distance
4. On run save, each district's leaderboard is updated in MongoDB
5. If the user now has the highest total distance in a district, they become **Lord**
6. The map highlights their owned districts with a glowing border

```
GPS point → point-in-polygon check → district name → add distance → update leaderboard → assign Lord
```

---

## 🎯 Hackathon Evaluation Coverage

| Criterion | Implementation |
|-----------|---------------|
| **Problem Statement** | Fitness consistency through gamification (quests, streaks, territory) |
| **Technical Implementation** | Full-stack: React + Node/Express + MongoDB + Firebase Auth + Leaflet Maps |
| **UI/UX Design** | Dual theme system, Bebas Neue typography, animated transitions, responsive layout |
| **Code Quality** | MVC architecture, separated contexts/services/controllers, reusable components |
| **Deployment** | Vercel (frontend) + Render (backend) + MongoDB Atlas |
| **Documentation** | This README + inline code comments + `.env.example` files |

---

## 👥 Team

Built at **HackNite 2026** — Zense Annual Hackathon for Freshers
Theme: **SinCity [Las Vegas]**
Track: **Web Development**

---

## 📄 License

MIT — do whatever you want, just don't be soft about it.

---

> *"The city doesn't sleep. Neither should your streak."*
> — SinCity Stride
