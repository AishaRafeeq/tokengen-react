import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', 
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  
  const publicEndpoints = [
    'users/categories/', 
              
  ];

  const isPublic = publicEndpoints.some((ep) => config.url.includes(ep));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

