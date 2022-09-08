import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://api-basketball.p.rapidapi.com',
  timeout: 5000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': process.env.BASKETBALL_RAPID_API_KEY,
  },
});
