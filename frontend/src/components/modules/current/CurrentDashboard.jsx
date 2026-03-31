import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../services/firebase'; // Added for Firebase sync
import { doc, getDoc } from "firebase/firestore";
import API_BASE_URL from '../../../api/config';

const CurrentDashboard = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [completedSkillsCount, setCompletedSkillsCount] = useState(0); // Sync this with Firebase
  const [loading, setLoading] = useState(true);
  
  const studentName = localStorage.getItem('studentName') || "Student";
  const studentId = localStorage.getItem('studentId') || "CSC/000";
  const fieldId = localStorage.getItem('studentFieldId') || "1";

  const fieldNames = {
    "1": "Software Engineering",
    "2": "Data Science",
    "3": "Cybersecurity",
    "4": "AI & Robotics",
    "5": "Cloud Computing"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Job Opportunities
        const jobRes = await axios.get(`${API_BASE_URL}/current/opportunities/${fieldId}`);
        setOpportunities(jobRes.data);

        // 2. Fetch Skills Progress from Firebase (instead of just local storage)
        if (studentId) {
          const trackRef = doc(db, "skills_tracking", studentId);
          const trackSnap = await getDoc(trackRef);
          if (trackSnap.exists()) {
            const completed = trackSnap.data().completed || [];
            setCompletedSkillsCount(completed.length);
          }
        }
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fieldId, studentId]);

  return (
    /* Added px-4 and pb-24 for mobile responsiveness */
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-4 pb-24 md:pb-10">
      
      {/* WELCOME HEADER: Responsive padding and text sizes */}
      <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 w-2 h-2 rounded-full animate-pulse"></span>
            <p className="text-blue-600 font-black uppercase tracking-widest text-[9px] md:text-[10px]">Active Session</p>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
            Welcome back, <br className="hidden md:block"/>
            <span className="text-blue-900">{studentName}!</span>
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
              {studentId}
            </span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
              {fieldNames[fieldId]}
            </span>
          </div>
        </div>
        
        {/* Quick Stats Grid: Fixed mobile sizing */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full md:w-auto">
          <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center flex-1">
            <p className="text-2xl md:text-3xl font-black text-gray-900">{opportunities.length}</p>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Jobs Found</p>
          </div>
          <div 
            onClick={() => navigate('/current/skills')}
            className="bg-blue-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-center flex-1 text-white cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <p className="text-2xl md:text-3xl font-black">{completedSkillsCount}</p>
            <p className="text-[9px] md:text-[10px] font-black text-blue-200 uppercase">Skills Mastered</p>
          </div>
        </div>
      </div>

      {/* JOB BOARD SECTION */}
      <section>
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-xl md:text-2xl font-black text-gray-900">Recommended Jobs</h3>
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] md:text-sm font-bold text-blue-600"
          >
            Refresh Board
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 md:p-20 rounded-[30px] md:rounded-[40px] text-center border border-gray-100">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-gray-400 text-sm">Finding openings...</p>
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {opportunities.map((job) => (
              <div 
                key={job.id} 
                className="bg-white p-6 md:p-8 rounded-[25px] md:rounded-[35px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold">
                      {job.company.charAt(0)}
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[9px] font-black uppercase">
                      New
                    </span>
                  </div>
                  
                  <h4 className="text-lg md:text-xl font-black text-gray-900 mb-1">
                    {job.title}
                  </h4>
                  <p className="text-blue-600 font-bold text-xs md:text-sm mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[9px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-md">
                      📍 {job.location || 'Remote'}
                    </span>
                  </div>

                  <button onClick={() => navigate('/current/opportunities')} className="w-full py-3 md:py-4 bg-gray-900 text-white rounded-xl md:rounded-2xl font-black text-sm hover:bg-blue-600 transition-all">
                    View Requirements
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 md:p-20 rounded-[30px] text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No active openings found.</p>
          </div>
        )}
      </section>

      {/* FOOTER TIP: Responsive design */}
      <div className="bg-blue-900 p-6 md:p-8 rounded-[30px] md:rounded-[35px] text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h4 className="text-lg md:text-xl font-black mb-1">Boost your visibility 🚀</h4>
          <p className="text-blue-200 text-xs md:text-sm font-medium">Completing your Skill Analysis helps recruiters find you.</p>
        </div>
        <button 
          onClick={() => navigate('/current/skills')}
          className="w-full md:w-auto bg-white text-blue-900 px-8 py-3 rounded-xl font-black text-sm"
        >
          Update Skills
        </button>
      </div>
    </div>
  );
};

export default CurrentDashboard;