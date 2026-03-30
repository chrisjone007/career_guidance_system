import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const studentId = localStorage.getItem('studentId');

  const homePath = userRole === 'current' ? '/current' : '/prospective';

  const menuItems = [
    { id: 'dash', name: 'Dashboard', path: homePath, icon: '🏠', roles: ['prospective', 'current'] },
    { id: 'quiz', name: 'Career Quiz', path: '/prospective/quiz', icon: '📝', roles: ['prospective'] },
    { id: 'explore', name: 'Explore Fields', path: '/prospective', icon: '🔍', roles: ['prospective'] },
    { id: 'skills', name: 'Skill Analysis', path: '/current/skills', icon: '🎯', roles: ['current'] },
    { id: 'jobs', name: 'Job Readiness', path: '/current', icon: '📈', roles: ['current'] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      {/* Hidden on mobile, visible from medium screens (768px) up */}
      <aside className="hidden md:flex w-72 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex-col z-40">
        <div className="p-8 border-b">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black mb-2">C</div>
          <h2 className="text-lg font-black text-gray-900 leading-tight">Career Guidance</h2>
        </div>

        <div className="p-4 m-4 bg-blue-50 rounded-2xl">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Access</p>
          <p className="text-blue-900 font-bold truncate">{userRole === 'current' ? studentId : 'Guest User'}</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <button 
              key={item.id} 
              onClick={() => navigate(item.path)} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 transition-all">
            <span>🚪</span><span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      {/* Visible on mobile, hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => navigate(homePath)} 
          className={`flex flex-col items-center gap-1 ${location.pathname === homePath ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {userRole === 'current' ? (
          <button 
            onClick={() => navigate('/current/skills')} 
            className={`flex flex-col items-center gap-1 ${location.pathname === '/current/skills' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <span className="text-xl">🎯</span>
            <span className="text-[10px] font-bold">Skills</span>
          </button>
        ) : (
          <button 
            onClick={() => navigate('/prospective/quiz')} 
            className={`flex flex-col items-center gap-1 ${location.pathname === '/prospective/quiz' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <span className="text-xl">📝</span>
            <span className="text-[10px] font-bold">Quiz</span>
          </button>
        )}

        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center gap-1 text-red-400"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;