import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './components/modules/shared/LandingPage';
import ProspectiveDashboard from './components/modules/prospective/ProspectiveDashboard';
import CurrentDashboard from './components/modules/current/CurrentDashboard';
import SkillsPage from './components/modules/current/SkillsPage';
import OpportunitiesPage from './components/modules/current/OpportunitiesPage';
import QuizPage from './components/modules/prospective/QuizPage';
import FieldDetailPage from './components/modules/prospective/FieldDetailPage';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

// This sub-component handles layout logic (hiding sidebar on Home)
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // 1. FIREBASE SESSION OBSERVER
    // Listens for auth changes and wipes local storage if logged out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("No active Firebase session. Clearing credentials...");
        localStorage.clear();
      }
    });

    // 2. IDLE TIMEOUT LOGIC
    let idleTimer;
    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 Minutes

    const handleLogout = () => {
      console.log("User idle. Logging out for security...");
      signOut(auth);
    };

    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    // Events to watch for activity
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Only start the watcher if the user is not on the home page (i.e., they are logged in)
    if (!isHomePage) {
      activityEvents.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer(); // Initialize timer
    }

    // Cleanup all listeners and timers
    return () => {
      unsubscribe();
      if (idleTimer) clearTimeout(idleTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [location.pathname, isHomePage]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {!isHomePage && <Sidebar />}

      <div className={`flex-1 ${!isHomePage ? 'md:ml-72' : ''} flex flex-col min-h-screen w-full`}>
        <header className="w-full py-6 md:py-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 tracking-tight">
            Faculty of Computing
          </h1>
          <p className="text-sm md:text-lg text-gray-500 mt-2 md:mt-3 font-medium px-2">
            Smart Career Guidance & Academic Planning System
          </p>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24 md:pb-20 w-full">
          {children}
        </main>

        <footer className="w-full py-6 md:py-10 border-t border-gray-200 text-center text-gray-400 text-[10px] md:text-sm mt-auto px-4">
          © 2026 Faculty of Computing Career Guidance System • Integrated with Gemini AI
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prospective" element={<ProspectiveDashboard />} />
          <Route path="/prospective/quiz" element={<QuizPage />} />
          <Route path="/prospective/field/:fieldId" element={<FieldDetailPage />} />

          <Route 
            path="/current" 
            element={
              <ProtectedRoute requiredRole="current">
                <CurrentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/current/skills" 
            element={
              <ProtectedRoute requiredRole="current">
                <SkillsPage />
              </ProtectedRoute>
            } 
          /> 
          <Route 
            path="/current/opportunities" 
            element={
              <ProtectedRoute requiredRole="current">
                <OpportunitiesPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;