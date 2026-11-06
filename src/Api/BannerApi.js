import axios from "axios";

const api_path_index = import.meta.env.VITE_API_INDEX;

export const fetchBanner = async () => {
    const response = await axios.get(
        `${api_path_index}banner/`
    );
    return response.data;
};