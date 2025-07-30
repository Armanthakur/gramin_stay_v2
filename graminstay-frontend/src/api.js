import axios from 'axios';

export default axios.create({
  baseURL: `https://graminstay.com/api`,
  withCredentials: true,
});
