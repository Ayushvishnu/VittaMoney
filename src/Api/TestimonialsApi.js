
import axios from "axios";

const api_path_index = import.meta.env.VITE_API_INDEX;

// ==========================================
// GET TESTIMONIALS API
// ==========================================

export const fetchTestimonials = async () => {
  try {
    const response = await axios.get(
      `${api_path_index}testimonials/`
    );

    return response.data;

  } catch (error) {
    console.error("Testimonials API Error:", error);
    throw error;
  }
};
