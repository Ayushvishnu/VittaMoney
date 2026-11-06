
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================
// PRODUCT DETAILS
// GET /products/:id/
// ============================================

export const fetchProductDetails = async (id) => {
  const response = await axios.get(
    `${API_URL}products/${encodeURIComponent(id)}/`
  );

  return response;
};

// ============================================
// PRODUCT EXTRA DETAILS
// GET /product/:id/details/
// ============================================

export const fetchProductExtraDetails = async (id) => {
  const response = await axios.get(
    `${API_URL}product/${encodeURIComponent(id)}/details/`
  );

  return response;
};

// ============================================
// FUNDAMENTALS
// GET /product/:id/fundamentals/
// ============================================

export const fetchFundamentals = async (id) => {
  const response = await axios.get(
    `${API_URL}product/${encodeURIComponent(id)}/fundamentals/`
  );

  return response;
};

// ============================================
// GRAPH DATA
// GET /graph/:id/
// ============================================

export const fetchGraphData = async (id) => {
  const response = await axios.get(
    `${API_URL}graph/${encodeURIComponent(id)}/`
  );

  return response;
};








// ============================================
// SEND ENQUIRY
// ============================================

export const sendTransactionEnquiry = async (
  transactionData,
  token
) => {
  try {
    return await axios.post(
      `${API_URL}transactions/`,
      transactionData,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};


