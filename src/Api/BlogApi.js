
import axios from "axios";

const INDEX_API = import.meta.env.VITE_API_INDEX;

// ==========================================
// GET ALL BLOGS
// ==========================================

export const getBlogs = async () => {
  try {
    const response = await axios.get(
      `${INDEX_API}blogs/`
    );

    return response.data;
  } catch (error) {
    console.error("Blogs API Error:", error);
    throw error;
  }
};

// ==========================================
// GET SINGLE BLOG BY UUID
// ==========================================

export const getBlogDetails = async (id) => {
  try {
    const response = await axios.get(
      `${INDEX_API}blogs/${id}/`
    );

    return response.data;
  } catch (error) {
    console.error("Blog Details API Error:", error);
    throw error;
  }
};
