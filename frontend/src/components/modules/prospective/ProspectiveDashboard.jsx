import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../api/config';
const ProspectiveDashboard = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetching the fields we defined in database.py
    axios.get(`${API_BASE_URL}/prospective/fields`)
      .then(res => {
        setFields(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching fields:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Loading Computing Fields...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900">Explore Computing Fields</h1>
        <p className="text-gray-500 font-medium mt-2">
          Discover the different specializations within the Faculty of Computing.
        </p>
      </header>

      {/* Grid of Career Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fields.map((field) => (
          <div 
            key={field.id}
            className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col"
            onClick={() => navigate(`/prospective/field/${field.id}`)}
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              🚀
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">{field.name}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 flex-1">
              {field.description.substring(0, 100)}...
            </p>
            <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">View Roadmap</span>
              <span className="text-gray-300 group-hover:text-blue-600 transition-colors">→</span>
            </div>
          </div>
        ))}

        {/* AI Quiz CTA Card */}
        <div 
          className="bg-blue-600 p-8 rounded-[32px] shadow-lg shadow-blue-100 flex flex-col justify-center items-center text-center text-white cursor-pointer hover:bg-blue-700 transition-all"
          onClick={() => navigate('/prospective/quiz')}
        >
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">Not sure which to pick?</h3>
          <p className="text-blue-100 text-sm font-medium mb-6">
            Take our AI-powered interest quiz to find your perfect match.
          </p>
          <span className="bg-white text-blue-600 px-6 py-2 rounded-full font-black text-xs uppercase">
            Start AI Quiz
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProspectiveDashboard;