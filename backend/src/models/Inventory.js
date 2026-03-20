import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    unique: true,
  },

  stock_quantity: { type: Number, default: 0 },
  reorder_level: { type: Number, default: 10 },
  max_stock_level: { type: Number },

  last_restocked: { type: Date },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

InventorySchema.pre("save", function () {
  this.updated_at = new Date();
});

export default mongoose.model("Inventory", InventorySchema);
