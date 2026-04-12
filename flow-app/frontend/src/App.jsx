import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import QuestPage from './pages/QuestPage';
import MapPage from './pages/MapPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';

function AppRoutes() {
  const { user, isNewUser } = useAuth();

  if (!user) return (
    <Routes>
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );

  if (isNewUser) return (
    <Routes>
      <Route path="*" element={<OnboardingPage />} />
    </Routes>
  );

  return (
    <>
      <Routes>
        <Route path="/home"    element={<HomePage />} />
        <Route path="/quests"  element={<QuestPage />} />
        <Route path="/map"     element={<MapPage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*"        element={<Navigate to="/home" />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
