import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  supplier_name: { type: String, required: true, maxlength: 100 },
  contact_person: { type: String, maxlength: 100 },
  email: { type: String, maxlength: 100 },
  phone: { type: String, maxlength: 20 },
  address: { type: String },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Supplier", SupplierSchema);
