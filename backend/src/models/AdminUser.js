import mongoose from "mongoose";
const AdminUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, maxlength: 50 },
  email: { type: String, unique: true, maxlength: 100 },
  password_hash: { type: String, maxlength: 255 },

  full_name: { type: String, maxlength: 100 },

  role: {
    type: String,
    enum: ["admin", "manager"],
    default: "admin",
  },

  is_active: { type: Boolean, default: true },

  created_at: { type: Date, default: Date.now },
  last_login: { type: Date },
});

export default mongoose.model("AdminUser", AdminUserSchema);
