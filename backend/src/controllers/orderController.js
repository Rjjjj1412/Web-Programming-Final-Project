import OrderDetail from "../models/OrderDetail.js";
import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

//Place order and make payment
export const placeOrder = async (req, res) => {
  try {
    const customerId = req.customer._id;
    const { cart, shipping_address, payment_method } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    //Calculate total amount
    let totalAmount = 0;
    const orderDetailsData = [];

    for (const item of cart) {
      const product = await Product.findById(item.product_id).lean();
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product_id}` });
      }

      //Fetch inventory to check stock
      const inventory = await Inventory.findOne({ product_id: product._id });
      if (!inventory || inventory.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.product_name}`,
        });
      }

      const subtotal = product.unit_price * item.quantity;
      totalAmount += subtotal;

      orderDetailsData.push({
        product_id: product._id,
        quantity: item.quantity,
        unit_price: product.unit_price,
        subtotal: subtotal,
      });
    }

    // Determine payment status based on payment method
    const payment_status = payment_method === "cod" ? "Pending" : "Paid";

    // Create order
    const newOrder = await Order.create({
      customer_id: customerId,
      order_date: new Date(),
      shipping_address,
      total_amount: totalAmount,
      payment_method: payment_method || "Not Specified",
      payment_status: payment_status,
      order_status: "Waiting for confirmation", // Initial status
    });

    //Create order details
    for (const detail of orderDetailsData) {
      await OrderDetail.create({
        order_id: newOrder._id,
        ...detail,
      });
    }
    res.status(201).json({
      message: "Order placed successfully.",
      order_id: newOrder._id,
      total_amount: newOrder.total_amount,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//View order details by order ID
export const viewOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    //Validate order ID
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    //Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Fetch order details (products + quantities)
    const orderDetails = await OrderDetail.find({ order_id: orderId })
      .populate(
        "product_id",
        "product_name unit_price author image_url"
      ) // populate product info
      .lean();

    // Attach inventory info to each product
    const orderDetailsWithInventory = await Promise.all(
      orderDetails.map(async (detail) => {
        const inventory = await Inventory.findOne({
          product_id: detail.product_id._id,
        }).lean();
        return {
          ...detail,
          inventory: inventory || {
            stock_quantity: 0,
            reorder_level: 0,
            max_stock_level: 0,
            last_restocked: null,
          },
        };
      })
    );

    res.status(200).json({
      ...order._doc,
      orderDetails: orderDetailsWithInventory,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// View Order History for authenticated customer
export const viewOrderHistory = async (req, res) => {
  try {
    const customerId = req.customer._id; // comes from protectCustomer middleware

    // Fetch all orders for this customer, most recent first
    const orders = await Order.find({ customer_id: customerId })
      .sort({ order_date: -1 })
      .lean();

    // Fetch order details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderDetails = await OrderDetail.find({ order_id: order._id })
          .populate(
            "product_id",
            "product_name unit_price author image_url"
          ) // product info
          .lean();

        return {
          ...order,
          orderDetails,
        };
      })
    );

    res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
