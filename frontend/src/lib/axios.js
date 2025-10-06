import axios from "axios";
const SERVER_URL = import.meta.env.VITE_API_BASE_URL

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : SERVER_URL,
  withCredentials: true,
});
