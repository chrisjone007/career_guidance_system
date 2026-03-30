import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from '../../../services/firebase'; 
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore";
import API_BASE_URL from '../../../api/config';
const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [completedSkills, setCompletedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCert, setShowCert] = useState(false);

  const studentId = localStorage.getItem('studentId');
  const fieldId = localStorage.getItem('studentFieldId') || "1";

  const fieldNames = { 
    "1": "Software Engineering", 
    "2": "Data Science", 
    "3": "Cybersecurity", 
    "4": "AI & Robotics", 
    "5": "Cloud Computing" 
  };

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        // 1. Fetch required skills from your Backend API
        const apiRes = await axios.get(`${API_BASE_URL}/current/skills/${fieldId}`);
        setSkills(apiRes.data.required_skills);

        // 2. Fetch saved progress from Firebase Cloud
        if (studentId) {
          const trackRef = doc(db, "skills_tracking", studentId);
          const trackSnap = await getDoc(trackRef);

          if (trackSnap.exists()) {
            setCompletedSkills(trackSnap.data().completed || []);
          } else {
            // Initialize the cloud doc if it doesn't exist
            await setDoc(trackRef, { completed: [], lastUpdated: new Date() });
          }
        }
      } catch (err) {
        console.error("Cloud Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsData();
  }, [fieldId, studentId]);

  const toggleSkill = async (skill) => {
    if (!studentId) return;

    const isCompleted = completedSkills.includes(skill);
    const trackRef = doc(db, "skills_tracking", studentId);

    // Update Local State for speed (Optimistic UI)
    const updated = isCompleted 
      ? completedSkills.filter(s => s !== skill) 
      : [...completedSkills, skill];
    setCompletedSkills(updated);

    try {
      // Update Cloud Firestore
      await updateDoc(trackRef, {
        completed: isCompleted ? arrayRemove(skill) : arrayUnion(skill),
        lastUpdated: new Date()
      });

      // Show certificate if 100% complete
      if (updated.length === skills.length && skills.length > 0) {
        setShowCert(true);
      }
    } catch (err) {
      alert("Failed to sync with cloud. Check internet connection.");
    }
  };

  const progress = skills.length > 0 ? Math.round((completedSkills.length / skills.length) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4">
      {/* CLOUD STATUS INDICATOR */}
      <div className="flex justify-end">
        <span className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Cloud Synced
        </span>
      </div>

      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Technical Readiness</h2>
            <p className="text-gray-400 font-medium text-sm">Skills for {fieldNames[fieldId]}</p>
          </div>
          <span className="text-5xl font-black text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid gap-4">
        {skills.map((skill, i) => (
          <div 
            key={i} 
            onClick={() => toggleSkill(skill)} 
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
              completedSkills.includes(skill) 
                ? 'bg-blue-50 border-blue-600' 
                : 'bg-white border-gray-100 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                completedSkills.includes(skill) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}>
                {completedSkills.includes(skill) && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`font-bold ${completedSkills.includes(skill) ? 'text-blue-900' : 'text-gray-600'}`}>
                {skill}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CERTIFICATE */}
      {showCert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[40px] p-12 text-center max-w-xl w-full border-8 border-blue-50 shadow-2xl relative">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-4xl font-black mb-4 italic text-gray-900 underline decoration-blue-100">Certificate of Readiness</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              This officially certifies that <br/>
              <span className="text-blue-600 font-black text-2xl uppercase">{localStorage.getItem('studentName')}</span> <br/>
              has mastered all technical competencies for <span className="font-bold">{fieldNames[fieldId]}</span>.
            </p>
            <button 
              onClick={() => setShowCert(false)} 
              className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
            >
              Close and Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;