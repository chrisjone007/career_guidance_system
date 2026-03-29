// src/api/config.js

// During development, use localhost. After deployment, use Render.
const API_BASE_URL = import.meta.env.MODE === 'development' 
    ? 'http://localhost:5173/' 
    : 'https://faculty-api-pdud.onrender.com';

export default API_BASE_URL;