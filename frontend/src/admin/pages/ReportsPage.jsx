import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  getTotalSales,
  getLowStockItems,
  getRevenueByCategory,
  getTopSellingProducts,
  getOrdersSummary,
} from "../services/reportsApi";
import { ArrowLeft } from "lucide-react";

const ReportsPage = () => {
  const navigate = useNavigate(); // <-- useNavigate hook
  const [totalSales, setTotalSales] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState(null);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const sales = await getTotalSales();
        setTotalSales({
          ...sales,
          salesByDate: aggregateSalesByDate(sales.sales),
        });
        setLowStockItems(await getLowStockItems());
        setRevenueByCategory(await getRevenueByCategory());
        setTopSellingProducts(await getTopSellingProducts());
        setOrdersSummary(await getOrdersSummary());
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };
    fetchAllReports();
  }, []);

  const aggregateSalesByDate = (sales) => {
    const map = {};
    sales.forEach((item) => {
      const date = new Date(item.order_date).toISOString().split("T")[0];
      if (!map[date]) map[date] = 0;
      map[date] += item.subtotal;
    });
    return Object.entries(map).map(([date, dailyRevenue]) => ({
      date,
      dailyRevenue,
    }));
  };

  const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back Button using useNavigate */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-[#0F1E3D] text-white rounded-lg hover:bg-[#0F3B60] transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-10">
          Generate Reports
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              ${totalSales ? totalSales.totalRevenue.toFixed(2) : "0.00"}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">
              {ordersSummary ? ordersSummary.totalOrders : 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg">Items Nearing Low Stock</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {lowStockItems.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-4">Top 5 Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topSellingProducts}
                  dataKey="totalQuantity"
                  nameKey="productName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {topSellingProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md xl:col-span-2">
            <h3 className="font-bold text-lg mb-4">Sales Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={totalSales?.salesByDate || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dailyRevenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
