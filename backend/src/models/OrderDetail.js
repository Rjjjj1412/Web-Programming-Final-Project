import mongoose from "mongoose";

const OrderDetailSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true }, //Decimal(10,2)
  subtotal: { type: Number, required: true }, //Decimal(12,2)
});

export default mongoose.model("OrderDetail", OrderDetailSchema);
