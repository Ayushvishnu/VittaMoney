

import axios from "axios";

const api_path_accounts = import.meta.env.VITE_API_PATH_ACCOUNTS;

export const requestOtp = (data) => {
  return axios.post(`${api_path_accounts}request-otp/`, data);
};

export const resetPassword = (data) => {
  return axios.post(`${api_path_accounts}reset-password/`, data);
};


export const verifyOtp = (data) => {
  return axios.post(
    `${api_path_accounts}verify-otp/`,
    data
  );
};