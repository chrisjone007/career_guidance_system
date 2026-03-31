import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../api/config';

const FieldDetailPage = () => {
  const printAreaRef = useRef();
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const [fieldData, setFieldData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/prospective/field/${fieldId}`)
      .then(res => {
        setFieldData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [fieldId]);

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Loading Program Details...</div>;
  if (!fieldData || fieldData.error) return <div className="p-20 text-center text-red-500 font-bold">Field not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mb-20" ref={printAreaRef}>
      
      {/* Top Navigation Bar - Hidden during Print */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
        <button 
          onClick={() => navigate(-1)} 
          className="text-blue-600 font-black flex items-center hover:translate-x-[-4px] transition-transform text-sm md:text-base"
        >
          ← Back to Exploration
        </button>

        <button 
          onClick={handlePrint}
          className="w-full md:w-auto bg-gray-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
        >
          <span>🖨️</span> Print Roadmap
        </button>
      </div>

      {/* Official Print Header - Only visible on Paper/PDF */}
      <div className="hidden print:block text-center border-b-2 border-gray-900 pb-6 mb-10">
        <h1 className="text-3xl font-black uppercase text-gray-900">Faculty of Computing</h1>
        <p className="text-md font-bold text-gray-600 uppercase tracking-widest">Academic Career Guidance Report</p>
        <p className="text-xs text-gray-400 mt-2">Document Generated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-[35px] md:rounded-[40px] shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border-none">
        
        {/* Header Section - Fixed for Mobile Wrap */}
        <div className="bg-blue-900 p-8 md:p-12 text-white print:bg-white print:text-blue-900 print:p-0 print:mb-8">
          <span className="text-blue-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] print:text-blue-600">
            Official Program Roadmap
          </span>
          <h1 className="text-3xl md:text-5xl font-black mt-2 leading-tight break-words">
            {fieldData.name}
          </h1>
        </div>

        <div className="p-6 md:p-12 print:p-0">
          <section className="mb-10 md:mb-12">
            <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-4 border-l-4 border-blue-600 pl-4">
              Program Overview
            </h3>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg italic">
              {fieldData.description}
            </p>
          </section>

          <section className="mb-10 md:mb-12">
            <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">
              Core Competencies & Skills
            </h3>
            {/* Change: 1 column on mobile, 2 columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {fieldData.skills.map((skill, i) => (
                <div key={i} className="flex items-center p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100 print:border-gray-300">
                  <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full mr-4 flex-shrink-0"></span>
                  <span className="font-bold text-gray-800 text-sm md:text-base leading-tight">{skill}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Box - Fixed Overlap for Mobile */}
          <div className="p-6 md:p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 no-print">
            <div className="text-center md:text-left">
              <p className="text-blue-900 font-black text-lg">Ready to see if this fits you?</p>
              <p className="text-blue-700 font-bold text-sm md:text-base leading-snug">
                Take our AI-driven career interest quiz for a personalized match.
              </p>
            </div>
            <button 
              onClick={() => navigate('/prospective/quiz')}
              className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              Start AI Quiz
            </button>
          </div>
          
          {/* Print Footer */}
          <div className="hidden print:block mt-20 text-center text-xs text-gray-400 border-t pt-8">
            <p>This document is part of the Computerized Career Guidance System Project.</p>
            <p>© 2026 Faculty of Computing Research Center</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetailPage;