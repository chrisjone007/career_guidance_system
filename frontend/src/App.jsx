import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/modules/shared/LandingPage';
import ProspectiveDashboard from './components/modules/prospective/ProspectiveDashboard';
import CurrentDashboard from './components/modules/current/CurrentDashboard';
import SkillsPage from './components/modules/current/SkillsPage';
import OpportunitiesPage from './components/modules/current/OpportunitiesPage';
import QuizPage from './components/modules/prospective/QuizPage';
import FieldDetailPage from './components/modules/prospective/FieldDetailPage';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// This sub-component handles layout logic (hiding sidebar on Home)
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {/* 1. Only show Sidebar if NOT on the Landing Page */}
      {!isHomePage && <Sidebar />}

      {/* 2. Content Wrapper - Adjust margin if sidebar is hidden */}
      <div className={`flex-1 ${!isHomePage ? 'ml-72' : ''} flex flex-col min-h-screen`}>
        
        {/* Header - Stays consistent */}
        <header className="w-full py-10 text-center">
          <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">
            Faculty of Computing
          </h1>
          <p className="text-lg text-gray-500 mt-3 font-medium">
            Smart Career Guidance & Academic Planning System
          </p>
        </header>

        {/* Main Routes Content */}
        <main className="max-w-7xl mx-auto px-8 pb-20 w-full">
          {children}
        </main>

        <footer className="w-full py-10 border-t border-gray-200 text-center text-gray-400 text-sm mt-auto">
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
          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Prospective Routes - Open to anyone who chooses 'Prospective' */}
          <Route path="/prospective" element={<ProspectiveDashboard />} />
          <Route path="/prospective/quiz" element={<QuizPage />} />
          <Route path="/prospective/field/:fieldId" element={<FieldDetailPage />} />

          {/* Locked Current Student Routes - Requires 'current' role */}
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