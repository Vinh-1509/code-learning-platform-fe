import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: { 'Content-Type': 'application/json' },
});



api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) 
    return Promise.reject(error);
  }
);

export default api;