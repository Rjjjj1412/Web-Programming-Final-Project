import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";

//Get customer profile by ID
export const getCustomerProfile = async (req, res) => {
  try {
    // If token expired OR not logged in
    if (!req.customer) {
      return res.status(401).json({ message: "Not logged in." });
    }

    const customerId = req.customer._id;

    // Find customer by ID
    const customer = await Customer.findById(customerId).select(
      "-password_hash"
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

//Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const {
      username,
      email,
      first_name,
      last_name,
      phone,
      address,
      old_password,
      new_password,
      confirm_password,
    } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (email && email.toLowerCase() !== customer.email.toLowerCase()) {
      const existingCustomer = await Customer.findOne({
        email: new RegExp(`^${email}$`, "i"),
      });
      if (existingCustomer) {
        return res.status(409).json({ message: "Email already in use." });
      }
    }

    if (username && username.toLowerCase() !== customer.username.toLowerCase()) {
      const existingCustomer = await Customer.findOne({
        username: new RegExp(`^${username}$`, "i"),
      });
      if (existingCustomer) {
        return res.status(409).json({ message: "Username already taken." });
      }
    }

    // Update normal fields
    if (username) customer.username = username;
    if (email) customer.email = email;
    if (first_name) customer.first_name = first_name;
    if (last_name) customer.last_name = last_name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;

    // Handle password change
    if (old_password || new_password || confirm_password) {
      if (!old_password || !new_password || !confirm_password) {
        return res
          .status(400)
          .json({ message: "All password fields are required" });
      }

      // Check old password
      const isMatch = await bcrypt.compare(
        old_password,
        customer.password_hash
      );
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Check new password confirmation
      if (new_password !== confirm_password) {
        return res
          .status(400)
          .json({ message: "New password and confirmation do not match" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      customer.password_hash = await bcrypt.hash(new_password, salt);
    }

    // Save updates
    await customer.save();

    const updatedCustomer = customer.toObject();
    delete updatedCustomer.password_hash;

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
