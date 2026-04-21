import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../api/config';
const QuizPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Retrieve current user info for a personalized AI experience
  const studentName = localStorage.getItem('studentName') || "Prospective Student";

  const questions = [
    { 
      id: 1,
      q: "What kind of tasks do you find most interesting?", 
      options: [
        { text: "Designing complex logic & core algorithms", weight: { "1": 5 } }, // CSC
        { text: "Defending systems from digital threats", weight: { "2": 5 } },   // CYB
        { text: "Building visible apps & websites", weight: { "3": 5 } },         // SEN
        { text: "Finding hidden patterns in large data", weight: { "4": 5 } }     // DSA
      ] 
    },
    { 
      id: 2,
      q: "Which of these sounds like a dream job environment?", 
      options: [
        { text: "A high-performance engineering firm", weight: { "1": 5 } },      // CSC
        { text: "A secure network operations center", weight: { "2": 5 } },       // CYB
        { text: "A creative software design studio", weight: { "3": 5 } },       // SEN
        { text: "A research lab with massive datasets", weight: { "4": 5 } }      // DSA
      ] 
    },
    { 
      id: 3,
      q: "How do you feel about working with mathematics?", 
      options: [
        { text: "Math is my strongest suit (Discrete/Calculus)", weight: { "1": 5 } }, // CSC
        { text: "I prefer focusing on rules and protocols", weight: { "2": 5 } },      // CYB
        { text: "I prefer basic logic and user-centered design", weight: { "3": 5 } }, // SEN
        { text: "I love statistics and probability", weight: { "4": 5 } }              // DSA
      ] 
    },
    { 
      id: 4,
      q: "What is your favorite way to solve a problem?", 
      options: [
        { text: "Writing highly efficient, optimized code", weight: { "1": 5 } }, // CSC
        { text: "Identifying a system's vulnerability", weight: { "2": 5 } },      // CYB
        { text: "Visualizing a smooth user interface", weight: { "3": 5 } },       // SEN
        { text: "Creating a predictive machine learning model", weight: { "4": 5 } } // DSA
      ] 
    },
    { 
      id: 5,
      q: "Which technology sounds most exciting to you?", 
      options: [
        { text: "Compilers & Operating Systems", weight: { "1": 5 } }, // CSC
        { text: "Firewalls & Advanced Encryption", weight: { "2": 5 } }, // CYB
        { text: "React, Next.js & Mobile Frameworks", weight: { "3": 5 } }, // SEN
        { text: "AI & Neural Networks", weight: { "4": 5 } } // DSA
      ] 
    },
    { 
      id: 6,
      q: "If you were managing city traffic data, what would you do first?", 
      options: [
        { text: "Optimize the database for faster data retrieval.", weight: { "1": 5 } }, // CSC
        { text: "Protect the traffic signals from being hacked.", weight: { "2": 5 } },   // CYB
        { text: "Build an app for drivers to see traffic live.", weight: { "3": 5 } },    // SEN
        { text: "Predict where jams will happen next week.", weight: { "4": 5 } }        // DSA
      ] 
    }
];

  const calculateProgress = () => {
    return Math.round((step / questions.length) * 100);
  };

  const handleAnswer = (option) => {
    const updatedAnswers = [...answers, option];
    
    if (step < questions.length - 1) {
      setAnswers(updatedAnswers);
      setStep(step + 1);
    } else {
      // Last question answered - trigger submission
      submitQuiz(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      const updatedAnswers = [...answers];
      updatedAnswers.pop();
      setAnswers(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      // This MUST match the 'QuizSubmission' class in your main.py
      const res = await axios.post(`${API_BASE_URL}/prospective/quiz`, {
        name: studentName, 
        answers: finalAnswers
      });
      
      setResult(res.data.data); 
    } catch (err) {
      console.error("Submission Error:", err);
      alert("AI Service is currently offline. Please ensure your Python backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-6">
      <div className="relative">
         <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-blue-600"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">🤖</div>
      </div>
      <div className="text-center">
        <p className="text-2xl font-black text-blue-900 animate-pulse">Analyzing Your DNA...</p>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Connecting to Gemini Pro 1.5</p>
      </div>
    </div>
  );

  if (result) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Career Roadmap</h2>
           <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase">Verified Result</span>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[32px] border border-blue-100 shadow-inner">
          <p className="text-blue-900 whitespace-pre-wrap leading-relaxed font-bold text-lg italic">
            "{result}"
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <button onClick={restartQuiz} className="bg-gray-100 text-gray-700 py-5 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase text-xs tracking-widest">
            Retake Quiz
          </button>
          <button onClick={() => navigate('/prospective')} className="bg-blue-100 text-blue-700 py-5 rounded-2xl font-black hover:bg-blue-200 transition-all uppercase text-xs tracking-widest">
            Explore Faculty
          </button>
          <button onClick={() => window.print()} className="col-span-2 bg-blue-600 text-white py-6 rounded-3xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1">
            Print Professional Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-[40px] shadow-2xl border border-gray-50 relative overflow-hidden">
      {/* Visual Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
      </div>

      <div className="flex items-center justify-between mb-10 mt-2">
        {step > 0 ? (
          <button onClick={handleBack} className="text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest flex items-center transition-all">
            <span className="mr-2 text-lg">←</span> Previous
          </button>
        ) : <div />}
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-1 rounded-full">
           Step {step + 1} of {questions.length}
        </span>
      </div>

      <h2 className="text-3xl font-black text-gray-900 mb-10 leading-[1.1] tracking-tight">
        {questions[step].q}
      </h2>
      
      <div className="grid gap-4">
        {questions[step].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="w-full text-left p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50/50 hover:shadow-xl hover:shadow-blue-50 transition-all font-bold text-gray-700 group flex items-center justify-between"
          >
            <span className="flex items-center gap-4">
               <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 {String.fromCharCode(65 + i)}
               </span>
               {opt}
            </span>
            <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition-all translate-x-4 group-hover:translate-x-0">
              ➜
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;