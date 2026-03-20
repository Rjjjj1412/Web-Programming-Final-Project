import Category from "../models/Category.js";

// Get all categories grouped by genre
export const getCategoriesByGenre = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).lean();

    const grouped = categories.reduce((acc, cat) => {
      const genre = cat.genre;
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push({
        id: cat._id,
        category_name: cat.category_name,
        description: cat.description,
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      genres: grouped,
    });
  } catch (error) {
    console.error("Error fetching categories by genre:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Categories by IDs
export const getCategoriesByIds = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of category IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category IDs." });
    }
    const categories = await Category.find({
      _id: { $in: ids },
      is_active: true,
    }).lean();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories by IDs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
