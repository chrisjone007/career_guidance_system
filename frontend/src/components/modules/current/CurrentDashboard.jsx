import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../api/config';
const CurrentDashboard = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Pull personalized data from Login
  const studentName = localStorage.getItem('studentName') || "Student";
  const studentId = localStorage.getItem('studentId') || "CSC/000";
  const fieldId = localStorage.getItem('studentFieldId') || "1";

  // 2. Department Mapping
  const fieldNames = {
    "1": "Software Engineering",
    "2": "Data Science",
    "3": "Cybersecurity",
    "4": "AI & Robotics",
    "5": "Cloud Computing"
  };

  // 3. Get Skills Progress for the Stat Card
  const STORAGE_KEY = `skills_${studentId}_${fieldId}`;
  const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/current/opportunities/${fieldId}`)
      .then(res => {
        setOpportunities(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [fieldId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* WELCOME HEADER */}
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 w-2 h-2 rounded-full animate-pulse"></span>
            <p className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Active Session</p>
          </div>
          <h2 className="text-4xl font-black text-gray-900 leading-tight">
            Welcome back, <br />
            <span className="text-blue-900">{studentName}!</span>
          </h2>
          <div className="flex gap-3 mt-4">
            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-tighter">
              {studentId}
            </span>
            <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-tighter">
              {fieldNames[fieldId]}
            </span>
          </div>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-gray-50 p-6 rounded-3xl text-center min-w-[140px]">
            <p className="text-3xl font-black text-gray-900">{opportunities.length}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase">Jobs Found</p>
          </div>
          <div 
            onClick={() => navigate('/current/skills')}
            className="bg-blue-600 p-6 rounded-3xl text-center min-w-[140px] text-white cursor-pointer hover:bg-blue-700 transition-all"
          >
            <p className="text-3xl font-black">{savedProgress.length}</p>
            <p className="text-[10px] font-black text-blue-200 uppercase">Skills Mastered</p>
          </div>
        </div>
      </div>

      {/* JOB BOARD SECTION */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-2xl font-black text-gray-900">Recommended Opportunities</h3>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-bold text-blue-600 hover:text-blue-800"
          >
            Refresh Board
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-20 rounded-[40px] text-center border border-gray-100">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-gray-400">Fetching latest openings for {fieldNames[fieldId]}...</p>
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map((job) => (
              <div 
                key={job.id} 
                className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold">
                      {job.company.charAt(0)}
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      New Posting
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-blue-600 font-bold text-sm mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-md uppercase">
                      📍 {job.location || 'Remote'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-md uppercase">
                      💼 Full-Time
                    </span>
                  </div>

                  <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">
                    View Requirements
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">No active openings found for {fieldNames[fieldId]}.</p>
            <p className="text-gray-300 text-sm mt-2">Check back later or update your skills to see more.</p>
          </div>
        )}
      </section>

      {/* FOOTER TIP */}
      <div className="bg-blue-900 p-8 rounded-[35px] text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h4 className="text-xl font-black mb-1">Boost your visibility 🚀</h4>
          <p className="text-blue-200 text-sm font-medium">Completing your Skill Analysis makes you 3x more likely to be noticed by recruiters.</p>
        </div>
        <button 
          onClick={() => navigate('/current/skills')}
          className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black hover:bg-blue-50 transition-all whitespace-nowrap"
        >
          Update Skills
        </button>
      </div>
    </div>
  );
};

export default CurrentDashboard;