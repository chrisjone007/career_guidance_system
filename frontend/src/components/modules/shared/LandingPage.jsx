import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../services/firebase'; 
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore"; 
import { signInAnonymously } from "firebase/auth"; 

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotId, setShowForgotId] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [foundId, setFoundId] = useState(null);
  
  // NEW: State for departments fetched from your FastAPI backend
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const API_BASE_URL = "https://career-guidance-system-m14x.onrender.com";

  // 1. AUTO-REDIRECT & FETCH DEPARTMENTS
  useEffect(() => {
    // Session Check: If already logged in, redirect immediately
    const role = localStorage.getItem('userRole');
    if (role === 'current') navigate('/current');
    if (role === 'prospective') navigate('/prospective');

    const fetchDepts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setAvailableDepartments(data);
      } catch (err) {
        console.error("Backend fetch error:", err);
        // Fallback: If backend is down, dropdown stays empty but alert will warn the user
      }
    };
    fetchDepts();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const inputId = studentId.toUpperCase().trim();
    
    try {
      // Check Firebase Firestore for the student ID
      const studentRef = doc(db, "students", inputId);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const user = studentSnap.data();
        
        // Ensure Firebase session persists
        await signInAnonymously(auth);

        // Save local session data
        localStorage.setItem('userRole', 'current');
        localStorage.setItem('studentId', user.id);
        localStorage.setItem('studentName', user.name);
        localStorage.setItem('studentFieldId', user.field);
        
        setTimeout(() => {
          navigate('/current');
        }, 500);

      } else {
        alert("Matric Number not found. Please register first!");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Error connecting to database. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const inputId = studentId.toUpperCase().trim();
    const cleanName = studentName.trim();

    // 2. DYNAMIC PREFIX VALIDATION
    // This checks if the input starts with any prefix in our backend (CSC, CYB, SWE, etc.)
    const isValidPrefix = availableDepartments.some(dept => 
        inputId.startsWith(dept.code_prefix + "/")
    );

    if (!isValidPrefix) {
      const allowedPrefixes = availableDepartments.length > 0 
        ? availableDepartments.map(d => d.code_prefix).join(", ") 
        : "CSC, CYB"; // Basic fallback if fetch failed
      alert(`Invalid Matric Number! Must start with one of: ${allowedPrefixes}/`);
      return;
    }

    if (inputId.length < 8) {
      alert("Please enter a complete Matric Number.");
      return;
    }

    setLoading(true);

    try {
      // Save to Firebase Cloud Firestore
      const studentRef = doc(db, "students", inputId);
      await setDoc(studentRef, {
        id: inputId,
        name: cleanName, 
        searchName: cleanName.toLowerCase(), // Needed for the "Forgot ID" search
        field: selectedField,
        createdAt: serverTimestamp()
      });

      // Save local session
      localStorage.setItem('studentId', inputId);
      localStorage.setItem('studentName', cleanName);
      localStorage.setItem('studentFieldId', selectedField);

      alert("Registration Successful! You can now login.");
      setIsLoginView(true);
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindId = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFoundId(null);
    const searchInput = searchName.toLowerCase().trim();

    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("searchName", "==", searchInput));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setFoundId(userData.id);
      } else {
        alert("Could not find a student with that name.");
      }
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-900">FACULTY PORTAL</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Cloud Secure Access</p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex gap-4 mb-8 bg-gray-100 p-2 rounded-2xl">
          <button 
            type="button"
            onClick={() => setIsLoginView(true)} 
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLoginView ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => setIsLoginView(false)} 
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLoginView ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
          >
            Register
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={isLoginView ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Matric Number</label>
            <input 
              type="text" placeholder="e.g. CYB/2026/0001" required
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 font-bold outline-none transition-all"
              value={studentId} onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          {!isLoginView && (
            <>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Full Name</label>
                <input 
                  type="text" placeholder="Enter Full Name" required
                  className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 font-bold outline-none"
                  value={studentName} onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Department</label>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 font-bold outline-none appearance-none cursor-pointer"
                  value={selectedField} onChange={(e) => setSelectedField(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {availableDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.dept_name} ({dept.code_prefix})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button 
            disabled={loading} 
            className={`w-full text-white py-5 rounded-2xl font-black text-lg shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
          >
            {loading ? "Verifying..." : isLoginView ? "Access Dashboard" : "Create Account"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 pt-6 border-t text-center space-y-4">
           <button 
            type="button"
            onClick={() => setShowForgotId(true)}
            className="text-[11px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-tight block w-full"
          >
            Forgot Matric Number?
          </button>
          <button 
            onClick={() => { localStorage.setItem('userRole', 'prospective'); navigate('/prospective'); }}
            className="text-blue-600 font-bold hover:underline text-sm block w-full"
          >
            Enter as a prospective student →
          </button>
        </div>
      </div>

      {/* RECOVERY MODAL */}
      {showForgotId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-black text-gray-900 mb-2">Recover ID</h3>
            <p className="text-gray-500 text-sm mb-6">Enter your full registered name.</p>
            
            {!foundId ? (
              <form onSubmit={handleFindId} className="space-y-4">
                <input 
                  type="text" placeholder="Full name"
                  className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-blue-600 font-bold outline-none"
                  value={searchName} onChange={(e) => setSearchName(e.target.value)} required
                />
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">
                  {loading ? "Searching..." : "Find My ID"}
                </button>
              </form>
            ) : (
              <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-100">
                <p className="text-green-600 text-[10px] font-black uppercase mb-1">ID Found</p>
                <p className="text-2xl font-black text-gray-900">{foundId}</p>
                <button 
                  onClick={() => { setStudentId(foundId); setShowForgotId(false); setFoundId(null); }} 
                  className="mt-4 text-sm font-bold text-blue-600 underline"
                >
                  Use this ID to Login
                </button>
              </div>
            )}
            
            <button 
              onClick={() => { setShowForgotId(false); setFoundId(null); }} 
              className="w-full mt-4 text-gray-400 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;