import mongoose from "mongoose";
import bcrypt from "bcrypt";
import AdminUser from "./src/models/AdminUser.js"; // adjust path if needed

const MONGO_URI = ""; // replace with your MongoDB connection string
const saltRounds = 10;

// Plaintext admin users
const users = [
  {
    username: "adminuser",
    email: "admin@example.com",
    password: "admin123",
    full_name: "System Administrator",
    role: "admin",
    is_active: true,
    created_at: new Date("2025-11-26T00:00:00.000Z"),
    last_login: null,
  },
  {
    username: "manageruser",
    email: "manager@example.com",
    password: "manager123",
    full_name: "Store Manager",
    role: "manager",
    is_active: true,
    created_at: new Date("2025-11-26T00:00:00.000Z"),
    last_login: null,
  },
];

const seedAdminUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, saltRounds);
      const newUser = new AdminUser({
        ...user,
        password_hash,
        password: undefined, // remove plain password
      });
      await newUser.save();
      console.log(`Inserted user: ${user.username}`);
    }

    console.log("All admin users seeded successfully!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding admin users:", error);
    await mongoose.disconnect();
  }
};

seedAdminUsers();
