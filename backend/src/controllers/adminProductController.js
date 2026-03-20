import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

// Admin: Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      description,
      author,
      publisher,
      isbn,
      category_id,
      supplier_id,
      unit_price,
      cost_price,
      language,
      number_of_pages,
      publication_year,
      format,
      image_url,
      stock_quantity,
      reorder_level,
      max_stock_level,
    } = req.body;

    // Check for duplicate product name
    const existingProduct = await Product.findOne({ product_name });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists." });
    }

    const productData = {
      product_name,
      description,
      author,
      publisher,
      isbn: isbn || null,
      category_id: category_id || null,
      supplier_id: supplier_id || null,
      unit_price,
      cost_price,
      language,
      number_of_pages: number_of_pages || null,
      publication_year: publication_year || null,
      format,
      image_url: image_url || null,
      is_active: true,
    };

    // Create product
    const newProduct = await Product.create(productData);

    // Create inventory record
    await Inventory.create({
      product_id: newProduct._id,
      stock_quantity: stock_quantity || 0,
      reorder_level: reorder_level || 10,
      max_stock_level: max_stock_level || null,
      last_restocked: stock_quantity ? new Date() : null,
    });

    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all products with category, supplier, and inventory
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ created_at: -1 })
      .populate("category_id", "category_name genre")
      .populate(
        "supplier_id",
        "supplier_name contact_person email phone address"
      )
      .lean();

    // Attach inventory to each product
    const productsWithInventory = await Promise.all(
      products.map(async (product) => {
        const inventory = await Inventory.findOne({
          product_id: product._id,
        }).lean();
        return {
          ...product,
          inventory: inventory || {
            stock_quantity: 0,
            reorder_level: 0,
            max_stock_level: null,
            last_restocked: null,
          },
        };
      })
    );

    res.status(200).json(productsWithInventory);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get product by ID with category, supplier, and inventory
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Fetch product and populate category and supplier
    const product = await Product.findById(productId)
      .populate("category_id", "category_name genre")
      .populate(
        "supplier_id",
        "supplier_name contact_person email phone address"
      )
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fetch inventory for this product
    const inventory = await Inventory.findOne({
      product_id: product._id,
    }).lean();

    // Send combined response
    res.status(200).json({
      ...product,
      inventory: inventory || { quantity: 0, location: null }, // default inventory
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update product (including inventory)
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      stock_quantity,
      reorder_level,
      max_stock_level,
      ...productUpdates
    } = req.body;

    // Update product fields
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productUpdates,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update inventory if any inventory fields are provided
    if (
      stock_quantity !== undefined ||
      reorder_level !== undefined ||
      max_stock_level !== undefined
    ) {
      const inventoryUpdates = {};
      if (stock_quantity !== undefined) {
        inventoryUpdates.stock_quantity = stock_quantity;
        inventoryUpdates.last_restocked = new Date(); // update restock date
      }
      if (reorder_level !== undefined)
        inventoryUpdates.reorder_level = reorder_level;
      if (max_stock_level !== undefined)
        inventoryUpdates.max_stock_level = max_stock_level;

      await Inventory.findOneAndUpdate(
        { product_id: productId },
        inventoryUpdates,
        { upsert: true }
      );
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete product and inventory
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    // Delete inventory record
    await Inventory.findOneAndDelete({ product_id: productId });

    res
      .status(200)
      .json({ message: "Product and inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
