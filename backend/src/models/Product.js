import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  product_name: { type: String, required: true, maxlength: 200 }, // Book title
  description: { type: String },
  author: { type: String, required: true, maxlength: 100 },
  publisher: { type: String, maxlength: 100 },
  isbn: { type: String, unique: true, sparse: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  unit_price: { type: Number, required: true }, // Decimal(10,2)
  cost_price: { type: Number, required: true }, // Decimal(10,2)
  language: { type: String, maxlength: 50 },
  number_of_pages: { type: Number },
  publication_year: { type: Number },
  format: {
    type: String,
    enum: ["Hardcover", "Paperback", "eBook"],
    default: "Paperback",
  },
  image_url: { type: String, default: null },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

ProductSchema.pre("save", function () {
  this.updated_at = new Date();
});

export default mongoose.model("Product", ProductSchema);
