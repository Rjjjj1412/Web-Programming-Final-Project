import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Admin: Create a new category
export const createCategory = async (req, res) => {
  try {
    const { category_name, description, genre } = req.body;

    const newCategory = await Category.create({
      category_name,
      description,
      is_active: true,
      genre,
    });

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ created_at: -1 }).lean();

    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category_id: category._id,
        });
        return { ...category, productCount };
      })
    );

    res.status(200).json(categoriesWithProductCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update category by ID
export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updates = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete category by ID
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Check if category name exists
export const checkCategoryName = async (req, res) => {
  try {
    const { name } = req.params;

    const category = await Category.findOne({
      category_name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    res.status(200).json({ exists: !!category });
  } catch (error) {
    console.error("Error checking category name:", error);
    res.status(500).json({ message: "Server error" });
  }
};
