import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  order_date: { type: Date, default: Date.now },
  order_status: {
    type: String,
    enum: [
      "Waiting for confirmation",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    default: "Waiting for confirmation",
  },
  total_amount: { type: Number, required: true }, //Decimal(12,2)
  payment_status: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },
  payment_method: { type: String, maxlength: 50 },
  shipping_address: { type: String },
  stock_adjusted: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now },
});
OrderSchema.pre("save", function () {
  this.updated_at = new Date();
});

export default mongoose.model("Order", OrderSchema);
