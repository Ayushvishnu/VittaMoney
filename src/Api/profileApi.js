import axios from "axios";

const api_path_accounts =
  import.meta.env.VITE_API_PATH_ACCOUNTS;

const api_transaction_url =
  import.meta.env.VITE_API_URL;

export const getProfile = async (profileId) => {
  const token = localStorage.getItem("token");

  return axios.get(
    `${api_path_accounts}profiles/${profileId}/`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
};

export const getTransactions = async () => {
  const token = localStorage.getItem("token");

  return axios.get(
    `${api_transaction_url}transactions/`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
};