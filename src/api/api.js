import axios from "axios";
import { BACKEND_API_BASE_URL } from "../utils/env";

const api = axios.create({
    baseURL: BACKEND_API_BASE_URL,
    withCredentials: true,
});

export default api;