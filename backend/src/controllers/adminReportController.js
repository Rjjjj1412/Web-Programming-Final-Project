import Order from "../models/Order.js";
import OrderDetail from "../models/OrderDetail.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";

// --- Existing generateSalesReport --- //
export const generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, product_id, category_id } = req.query;

    const orderFilter = {
      order_status: "Delivered",
      payment_status: "Paid",
    };

    if (startDate || endDate) {
      orderFilter.order_date = {};
      if (startDate) orderFilter.order_date.$gte = new Date(startDate);
      if (endDate) orderFilter.order_date.$lte = new Date(endDate);
    }

    const orders = await Order.find(orderFilter).lean();

    const reportData = await Promise.all(
      orders.map(async (order) => {
        let detailsQuery = { order_id: order._id };
        let details = await OrderDetail.find(detailsQuery)
          .populate({
            path: "product_id",
            select: "product_name author unit_price category_id stock quantity",
          })
          .lean();

        if (product_id) {
          details = details.filter(
            (item) => item.product_id._id.toString() === product_id
          );
        }

        if (category_id) {
          details = details.filter(
            (item) =>
              item.product_id.category_id &&
              item.product_id.category_id.toString() === category_id
          );
        }

        return details.map((item) => ({
          order_id: order._id,
          order_date: order.order_date,
          product_name: item.product_id.product_name,
          author: item.product_id.author,
          category_id: item.product_id.category_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }));
      })
    );

    const flattenedReport = reportData.flat();

    const totalRevenue = flattenedReport.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );
    const totalOrders = new Set(
      flattenedReport.map((item) => item.order_id.toString())
    ).size;

    res.status(200).json({
      totalRevenue,
      totalOrders,
      sales: flattenedReport,
    });
  } catch (error) {
    console.error("Error generating filtered sales report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Low stock items ---
export const getLowStockItems = async (req, res) => {
  try {
    // Use aggregation to compare stock_quantity against reorder_level dynamically
    const lowStockItems = await Inventory.aggregate([
      {
        $addFields: {
          isLowStock: { $lte: ["$stock_quantity", "$reorder_level"] },
        },
      },
      {
        $match: { isLowStock: true },
      },
      {
        $lookup: {
          from: "products", // MongoDB collection name
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 1,
          stock_quantity: 1,
          reorder_level: 1,
          last_restocked: 1,
          product_id: "$product._id",
          product_name: "$product.product_name",
          author: "$product.author",
          category_id: "$product.category_id",
        },
      },
    ]);

    res.status(200).json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Revenue by category ---
export const getRevenueByCategory = async (req, res) => {
  try {
    const orders = await Order.find({
      order_status: "Delivered",
      payment_status: "Paid",
    }).lean();

    const orderDetails = await OrderDetail.find({
      order_id: { $in: orders.map((o) => o._id) },
    })
      .populate({
        path: "product_id",
        select: "category_id",
        populate: { path: "category_id", select: "category_name" }, // <-- populate category_name
      })
      .lean();

    const revenueMap = {};
    orderDetails.forEach((item) => {
      // If product has a category, use its name; otherwise fallback to 'Uncategorized'
      const catName =
        item.product_id.category_id?.category_name || "Uncategorized";
      revenueMap[catName] = (revenueMap[catName] || 0) + item.subtotal;
    });

    const revenueByCategory = Object.entries(revenueMap).map(
      ([category, revenue]) => ({
        category,
        revenue,
      })
    );

    res.status(200).json(revenueByCategory);
  } catch (error) {
    console.error("Error fetching revenue by category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Top selling products ---
export const getTopSellingProducts = async (req, res) => {
  try {
    const orders = await Order.find({
      order_status: "Delivered",
      payment_status: "Paid",
    }).lean();
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orders.map((o) => o._id) },
    })
      .populate({ path: "product_id", select: "product_name" })
      .lean();

    const productMap = {};
    orderDetails.forEach((item) => {
      const name = item.product_id.product_name;
      productMap[name] = (productMap[name] || 0) + item.quantity;
    });

    const topSellingProducts = Object.entries(productMap)
      .map(([productName, totalQuantity]) => ({ productName, totalQuantity }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    res.status(200).json(topSellingProducts);
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Orders summary ---
export const getOrdersSummary = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({
      order_status: "Delivered",
      payment_status: "Paid",
    });
    res.status(200).json({ totalOrders });
  } catch (error) {
    console.error("Error fetching orders summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};
