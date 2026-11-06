
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getUnlistedProducts = async () => {
  const response = await axios.get(`${API_URL}products/`);

  console.log("Unlisted Products API:", response.data.data);

  const products = response.data?.data || [];

  return Array.isArray(products)
    ? products.filter(
        (product) => product?.variant_name === "Unlisted"
      )
    : [];
};
