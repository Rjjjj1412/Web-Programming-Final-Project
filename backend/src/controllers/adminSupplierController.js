import Supplier from "../models/Supplier.js";

// Admin: Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_person, email, phone, address } = req.body;

    // Check for duplicate supplier name
    const existingSupplier = await Supplier.findOne({ supplier_name: { $regex: new RegExp(`^${supplier_name}$`, 'i') } });
    if (existingSupplier) {
      return res.status(400).json({ message: "Supplier name already exists." });
    }

    const newSupplier = await Supplier.create({
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      is_active: true,
    });

    res.status(201).json({
      message: "Supplier created successfully",
      supplier: newSupplier,
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ created_at: -1 }).lean();
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json(supplier);
  } catch (error) {
    console.error("Error fetching supplier:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update supplier by ID
export const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const { supplier_name, ...updates } = req.body;

    // Check for duplicate supplier name if name is being updated
    if (supplier_name) {
      const existingSupplier = await Supplier.findOne({
        supplier_name: { $regex: new RegExp(`^${supplier_name}$`, 'i') },
        _id: { $ne: supplierId },
      });
      if (existingSupplier) {
        return res.status(400).json({ message: "Supplier name already exists." });
      }
      updates.supplier_name = supplier_name;
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      updates,
      { new: true }
    );
    if (!updatedSupplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete supplier by ID
export const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
    if (!deletedSupplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Check if supplier name exists
export const checkSupplierName = async (req, res) => {
  try {
    const { name } = req.params;
    const supplier = await Supplier.findOne({ supplier_name: { $regex: new RegExp(`^${name}$`, 'i') } });
    res.status(200).json({ exists: !!supplier });
  } catch (error) {
    console.error("Error checking supplier name:", error);
    res.status(500).json({ message: "Server error" });
  }
};
