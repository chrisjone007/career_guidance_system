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

  const studentName = localStorage.getItem('studentName') || "Prospective Student";

  const questions = [
    { 
      id: 1,
      q: "What kind of tasks do you find most interesting?", 
      options: [
        { text: "Designing complex logic & core algorithms", weight: { "1": 5 } },
        { text: "Defending systems from digital threats", weight: { "2": 5 } },
        { text: "Building visible apps & websites", weight: { "3": 5 } },
        { text: "Finding hidden patterns in large data", weight: { "4": 5 } }
      ] 
    },
    // ... (Repeat this pattern for the other 5 questions)
  ];

  const handleAnswer = (option) => {
    // CRITICAL FIX: Send only the text string to the AI backend
    const updatedAnswers = [...answers, option.text]; 
    
    if (step < questions.length - 1) {
      setAnswers(updatedAnswers);
      setStep(step + 1);
    } else {
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/prospective/quiz`, {
        name: studentName, 
        answers: finalAnswers
      });
      setResult(res.data.data); 
    } catch (err) {
      console.error("Submission Error:", err);
      alert("AI Service is currently offline. Check your backend logs.");
      setLoading(false); // Unsticks the UI on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-600"></div>
      <p className="mt-4 font-black text-blue-900">AI is analyzing your path...</p>
    </div>
  );

  if (result) return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-[40px] shadow-2xl">
      <h2 className="text-3xl font-black mb-6">Your Result</h2>
      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
        <p className="text-blue-900 font-bold text-lg italic">{result}</p>
      </div>
      <button onClick={() => navigate('/prospective')} className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black">
        Finish
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-10 bg-white rounded-[40px] shadow-2xl">
      <h2 className="text-2xl font-black mb-8">{questions[step].q}</h2>
      <div className="grid gap-4">
        {questions[step].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            className="w-full text-left p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all font-bold"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;