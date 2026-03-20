import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Validate Email Format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const registerCustomer = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, address } =
      req.body;

    //Basic validation
    if (
      !username ||
      !email ||
      !password ||
      !first_name ||
      !last_name ||
      !phone ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required!." });
    }

    //Check if user exists
    const existingCustomer = await Customer.findOne({
      $or: [{ username }, { email }],
    });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists." });
    }

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create new customer
    const newCustomer = new Customer({
      username,
      email,
      password_hash: hashedPassword,
      first_name,
      last_name,
      phone,
      address,
    });
    await newCustomer.save();

    //Create JWT Token
    const token = jwt.sign(
      {
        customerId: newCustomer._id,
        username: newCustomer.username,
        email: newCustomer.email,
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true, // cannot be accessed by JS
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Customer registered successfully.",
      customer: {
        customerId: newCustomer._id,
        username: newCustomer.username,
        email: newCustomer.email,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name,
        phone: newCustomer.phone,
        address: newCustomer.address,
      },
      token: token,
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    //Basic validation
    if ((!username && !email) || !password) {
      return res
        .status(400)
        .json({ message: "Username or Email and Password are required." });
    }

    //Find customer by username or email
    const customer = await Customer.findOne({ $or: [{ username }, { email }] });
    if (!customer) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    //Compare password
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    //Create JWT Token
    const token = jwt.sign(
      {
        customerId: customer._id,
        username: customer.username,
        email: customer.email,
      },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true, // cannot be accessed by JS
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful.",
      customer: {
        customerId: customer._id,
        username: customer.username,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        address: customer.address,
      },
      token: token,
    });
  } catch (error) {
    console.error("Error logging in customer:", error);
    res.status(500).json({ message: "Server error." });
  }
};
