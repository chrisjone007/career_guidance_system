import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../api/config';
import { useNavigate } from 'react-router-dom';

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch all fields for the dropdown
    const fetchInitialData = async () => {
      try {
        const fieldsRes = await axios.get(`${API_BASE_URL}/prospective/fields`);
        setFields(fieldsRes.data);

        // 2. AUTO-FILTER LOGIC: Check who is logged in
        const savedFieldId = localStorage.getItem('studentFieldId');
        
        if (savedFieldId) {
          setSelectedField(savedFieldId);
          // 3. Automatically fetch jobs for THEIR department
          const jobsRes = await axios.get(`${API_BASE_URL}/current/opportunities/${savedFieldId}`);
          setJobs(jobsRes.data);
        }
      } catch (err) {
        console.error("Error loading opportunities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleFieldChange = (e) => {
    const id = e.target.value;
    setSelectedField(id);
    if (id) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/current/opportunities/${id}`)
        .then(res => {
          setJobs(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setJobs([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Career Opportunities</h1>
        <p className="text-gray-500 font-medium">Internships and roles tailored to your specialization.</p>
      </header>

      {/* Filter Section - Now pre-selected */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-3">
          {selectedField ? "Showing Results For Your Path" : "Filter by Your Path"}
        </label>
        <select 
          value={selectedField}
          onChange={handleFieldChange}
          className="w-full md:w-1/3 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
        >
          <option value="">Select your field...</option>
          {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold">Loading your opportunities...</p>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between group gap-6">
              <div className="flex items-center space-x-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  💼
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                  <p className="text-gray-500 font-bold">{job.company} • <span className="text-blue-600">{job.location || 'Remote'}</span></p>
                </div>
              </div>
              <button onClick={() => navigate(`/current/opportunities/${job.id}`)} className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-600 transition-colors">
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No active opportunities found for this field yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;