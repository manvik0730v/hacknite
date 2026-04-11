import axios from 'axios';
import { auth } from './firebase';

const API = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

// Automatically attach Firebase token to every request
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;