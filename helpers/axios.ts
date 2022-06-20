import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
  timeout: 5000,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
    'x-rapidapi-key': process.env.RAPID_API_KEY,
  },
});
