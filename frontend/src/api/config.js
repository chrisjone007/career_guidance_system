const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://127.0.0.1:8000/api' 
    : 'https://career-guidance-system-backend-ht7x.onrender.com'; 

export default API_BASE_URL;