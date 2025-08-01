import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://gramin-stay-v2-backend.onrender.com/api' // Render backend in production
  : '/api';                                           // Local proxy during development

export default axios.create({
  baseURL,
  withCredentials: true,
});
