
import axios from "axios";

const api_index = import.meta.env.VITE_API_INDEX;

export const fetchHomeData = async () => {
  const response = await axios.get(
    `${api_index}common-data/`
  );

  return response.data;
};
