import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

// Admin: Create inventory record
export const createInventory = async (req, res) => {
  try {
    const { product_id, stock_quantity, reorder_level, max_stock_level } =
      req.body;

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Create inventory
    const newInventory = await Inventory.create({
      product_id,
      stock_quantity: stock_quantity || 0,
      reorder_level: reorder_level || 10,
      max_stock_level: max_stock_level || null,
      last_restocked: stock_quantity ? new Date() : null,
    });

    res.status(201).json({
      message: "Inventory created successfully",
      inventory: newInventory,
    });
  } catch (error) {
    console.error("Error creating inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all inventory records with product details
export const getAllInventory = async (req, res) => {
  try {
    const inventoryList = await Inventory.find()
      .sort({ created_at: -1 })
      .populate("product_id", "product_name author unit_price image_url")
      .lean();

    res.status(200).json(inventoryList);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Admin: Get inventory by ID with product details
export const getInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.id;

    const inventory = await Inventory.findById(inventoryId)
      .populate("product_id", "product_name author unit_price image_url")
      .lean();
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.status(200).json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update inventory by ID
export const updateInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;
    const { stock_quantity, reorder_level, max_stock_level } = req.body;

    const updates = {};
    if (stock_quantity !== undefined) {
      updates.stock_quantity = stock_quantity;
      updates.last_restocked = new Date();
    }
    if (reorder_level !== undefined) updates.reorder_level = reorder_level;
    if (max_stock_level !== undefined)
      updates.max_stock_level = max_stock_level;

    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      updates,
      { new: true }
    );
    if (!updatedInventory)
      return res.status(404).json({ message: "Inventory record not found" });

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete inventory by ID
export const deleteInventory = async (req, res) => {
  try {
    const inventoryId = req.params.id;

    const deletedInventory = await Inventory.findByIdAndDelete(inventoryId);
    if (!deletedInventory)
      return res.status(404).json({ message: "Inventory record not found" });

    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({ message: "Server error" });
  }
};
