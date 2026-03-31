import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../api/config';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/current/opportunities/details/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!job) return (
    <div className="text-center p-20 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-400">Job Not Found</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold underline">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-700">
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 font-bold hover:text-blue-600 flex items-center gap-2">
        ← Back to Job Board
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center text-3xl text-white font-black">
              {job.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{job.title}</h1>
              <p className="text-blue-600 font-black text-lg">{job.company}</p>
            </div>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
            Verified Opening
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Location</p>
            <p className="font-bold text-gray-900">{job.location || 'Remote'}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Role Type</p>
            <p className="font-bold text-gray-900">{job.type || 'Internship'}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Est. Salary</p>
            <p className="font-bold text-gray-900">{job.salary || 'Competitive'}</p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Job Description
            </h3>
            <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-line">
              {job.description || "No description provided for this role."}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Technical Requirements
            </h3>
            <div className="flex flex-wrap gap-3">
              {job.requirements && job.requirements.length > 0 ? (
                job.requirements.map((req, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                    {req}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Contact recruiter for specific skill requirements.</p>
              )}
            </div>
          </div>
        </div>

        <button className="w-full mt-12 py-5 bg-gray-900 text-white rounded-[24px] font-black text-xl hover:bg-blue-600 shadow-xl transition-all transform hover:-translate-y-1">
          Apply for this Position
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPage;