import axios, { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
    // baseURL: "https://family-relation-react-867e.vercel.app/api",
    baseURL: "http://localhost:5000/api",
});

export default instance;
