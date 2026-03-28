import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../api/config';
const OpportunitiesPage = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/prospective/fields`).then(res => setFields(res.data));
  }, []);

  const handleFieldChange = (e) => {
    const id = e.target.value;
    setSelectedField(id);
    if (id) {
      axios.get(`${API_BASE_URL}/current/opportunities/${id}`)
        .then(res => setJobs(res.data));
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Career Opportunities</h1>
        <p className="text-gray-500 font-medium">Internships and roles tailored to your specialization.</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Filter by Your Path</label>
        <select 
          onChange={handleFieldChange}
          className="w-full md:w-1/3 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-700 transition-all"
        >
          <option value="">Select your field...</option>
          {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="grid gap-6">
        {jobs.length > 0 ? jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                💼
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                <p className="text-gray-500 font-bold">{job.company} • <span className="text-blue-600">{job.location}</span></p>
              </div>
            </div>
            <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
              View Details
            </button>
          </div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">Select a field to see available opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;