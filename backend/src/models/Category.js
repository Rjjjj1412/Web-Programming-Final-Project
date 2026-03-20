import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  category_name: { type: String, unique: true, required: true, maxlength: 100 },
  description: { type: String },
  is_active: { type: Boolean, default: true },
  genre: { type: String, enum: ["Fiction", "Non-Fiction"], required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

CategorySchema.pre("save", function () {
  this.updated_at = new Date();
});

export default mongoose.model("Category", CategorySchema);
