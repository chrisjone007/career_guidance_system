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
  "1": "Computer Science", 
  "2": "Cybersecurity", 
  "3": "Software Engineering", 
  "4": "Data Science" 
};

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const apiRes = await axios.get(`${API_BASE_URL}/current/skills/${fieldId}`);
        setSkills(apiRes.data.required_skills);

        if (studentId) {
          const trackRef = doc(db, "skills_tracking", studentId);
          const trackSnap = await getDoc(trackRef);

          if (trackSnap.exists()) {
            setCompletedSkills(trackSnap.data().completed || []);
          } else {
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

    const updated = isCompleted 
      ? completedSkills.filter(s => s !== skill) 
      : [...completedSkills, skill];
    setCompletedSkills(updated);

    try {
      await updateDoc(trackRef, {
        completed: isCompleted ? arrayRemove(skill) : arrayUnion(skill),
        lastUpdated: new Date()
      });

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
    /* Added responsive padding px-4 for mobile, max-w-4xl for desktop */
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 px-4 pb-24 md:pb-10">
      
      {/* CLOUD STATUS INDICATOR */}
      <div className="flex justify-end mt-4">
        <span className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Cloud Synced
        </span>
      </div>

      {/* HEADER CARD: Made padding and font sizes responsive */}
      <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Technical Readiness</h2>
            <p className="text-gray-400 font-medium text-xs md:text-sm">Skills for {fieldNames[fieldId]}</p>
          </div>
          <span className="text-4xl md:text-5xl font-black text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-3 md:h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* SKILLS LIST: Adjusted padding for mobile tap targets */}
      <div className="grid gap-3 md:gap-4">
        {skills.map((skill, i) => (
          <div 
            key={i} 
            onClick={() => toggleSkill(skill)} 
            className={`p-4 md:p-6 rounded-xl md:rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${
              completedSkills.includes(skill) 
                ? 'bg-blue-50 border-blue-600' 
                : 'bg-white border-gray-100 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                completedSkills.includes(skill) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              }`}>
                {completedSkills.includes(skill) && <span className="text-white text-[10px] md:text-xs">✓</span>}
              </div>
              <span className={`text-sm md:text-base font-bold ${completedSkills.includes(skill) ? 'text-blue-900' : 'text-gray-600'}`}>
                {skill}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CERTIFICATE: Massive changes for mobile screen fit */}
      {showCert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-12 text-center max-w-xl w-full border-4 md:border-8 border-blue-50 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="text-4xl md:text-6xl mb-4 md:mb-6">🏆</div>
            <h1 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 italic text-gray-900 underline decoration-blue-100">
              Certificate of Readiness
            </h1>
            <p className="text-sm md:text-lg text-gray-500 mb-6 md:mb-8 leading-relaxed">
              This officially certifies that <br/>
              <span className="text-blue-600 font-black text-xl md:text-2xl uppercase">
                {localStorage.getItem('studentName') || 'The Student'}
              </span> <br/>
              has mastered all technical competencies for <span className="font-bold">{fieldNames[fieldId]}</span>.
            </p>
            <button 
              onClick={() => setShowCert(false)} 
              className="w-full md:w-auto bg-blue-600 text-white px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
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