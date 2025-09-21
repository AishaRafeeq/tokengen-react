import axios from 'axios';

const API = axios.create({
  baseURL: 'https://tokengeneration-f665.onrender.com/api/', // change to your backend URL if deployed
});

// Add request interceptor to include JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  // Public endpoints (don’t require JWT)
  const publicEndpoints = [
    'users/categories/', // category list
              // sidebar menu
  ];

  const isPublic = publicEndpoints.some((ep) => config.url.includes(ep));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

