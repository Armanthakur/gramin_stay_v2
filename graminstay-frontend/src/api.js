import axios from 'axios';

export default axios.create({
  baseURL: `https://gramin-stay-v2-backend.onrender.com/api`,
  withCredentials: true,
});
