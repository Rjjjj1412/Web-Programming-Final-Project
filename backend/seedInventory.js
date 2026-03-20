// seedInventory.js
import mongoose from "mongoose";
import Inventory from "./src/models/Inventory.js";
import Product from "./src/models/Product.js";

const MONGO_URI = ""; // replace with your MongoDB URI;

const seedInventory = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products.`);

    const inventories = [];

    for (const product of products) {
      // Check if inventory for this product already exists
      const existing = await Inventory.findOne({ product_id: product._id });
      if (existing) continue;

      const stock_quantity = Math.floor(Math.random() * 50); // 0-49 units
      const reorder_level = Math.floor(Math.random() * 20) + 5; // 5-24
      const max_stock_level = Math.floor(Math.random() * 100) + 50; // 50-149
      const last_restocked = new Date();

      inventories.push({
        product_id: product._id,
        stock_quantity,
        reorder_level,
        max_stock_level,
        last_restocked,
      });
    }

    if (inventories.length > 0) {
      await Inventory.insertMany(inventories);
      console.log(`Inserted ${inventories.length} inventory records.`);
    } else {
      console.log("No new inventory records to insert.");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Seeding inventory error:", err);
  }
};

seedInventory();
