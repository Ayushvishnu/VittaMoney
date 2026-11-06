import axios from "axios";

const api_path_accounts = import.meta.env.VITE_API_PATH_ACCOUNTS;

export const loginUser = (data) => {
  return axios.post(`${api_path_accounts}login/`, data);
};

export const registerUser = (data) => {
  return axios.post(`${api_path_accounts}register/`, data);
};