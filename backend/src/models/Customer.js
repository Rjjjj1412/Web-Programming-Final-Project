import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, maxlength: 50 },
  email: { type: String, unique: true, required: true, maxlength: 100 },
  password_hash: { type: String, required: true, maxlength: 255 },
  first_name: { type: String, maxlength: 50 },
  last_name: { type: String, maxlength: 50 },
  phone: { type: String, maxlength: 20 },
  address: { type: String },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

CustomerSchema.pre("save", function () {
  this.updated_at = new Date();
});

export default mongoose.model("Customer", CustomerSchema);
