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
    const fetchJobDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/current/opportunities/details/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("Error fetching job details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!job) return <div className="text-center p-20 font-bold text-gray-500">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center text-gray-500 font-bold hover:text-blue-600 transition-colors"
      >
        ← Back to Opportunities
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-900 rounded-[24px] flex items-center justify-center text-3xl text-white font-bold">
              {job.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{job.title}</h1>
              <p className="text-blue-600 font-black text-lg">{job.company}</p>
            </div>
          </div>
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
            Active Opening
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-50 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Location</p>
            <p className="font-bold text-gray-900">{job.location || 'Remote'}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Type</p>
            <p className="font-bold text-gray-900">{job.type || 'Full-time'}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Salary</p>
            <p className="font-bold text-gray-900">{job.salary || 'Competitive'}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-4">Role Description</h3>
            <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900 mb-4">Requirements</h3>
            <ul className="space-y-3">
              {job.requirements?.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-600 font-medium">
                  <span className="text-blue-600 mt-1">✔</span> {req}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button className="w-full mt-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all transform hover:-translate-y-1">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobDetailsPage;