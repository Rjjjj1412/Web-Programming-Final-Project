import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader, Star, TrendingUp, Zap } from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const BookCard = ({ book }) => (
  <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
    <Link to={`/product/${book._id}`}>
      <img
        src={book.image_url}
        alt={book.product_name}
        className="w-full h-48 object-cover rounded-md mb-3 bg-gray-200"
      />
      <h3 className="font-semibold text-lg text-[#1F3B6D] mb-1 truncate">
        {book.product_name}
      </h3>
      <p className="text-gray-500 text-sm mb-2">{book.author}</p>
      <p className="text-[#4A90E2] mb-2">${book.unit_price.toFixed(2)}</p>
    </Link>
  </div>
);

const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const [featuredRes, bestsellersRes, newArrivalsRes] = await Promise.all(
          [
            axios.get(
              `${BASE_URL}/api/products?sort_by=publication_year&order=desc&limit=5`,
            ),
            axios.get(
              `${BASE_URL}/api/products?sort_by=unit_price&order=desc&limit=5`,
            ),
            axios.get(
              `${BASE_URL}/api/products?sort_by=created_at&order=desc&limit=5`,
            ),
          ],
        );

        setFeaturedBooks(featuredRes.data.items || []);
        setBestsellers(bestsellersRes.data.items || []);
        setNewArrivals(newArrivalsRes.data.items || []);
      } catch (err) {
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const renderBookSection = (title, books, Icon) => (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <Icon className="w-8 h-8 text-[#4A90E2] mr-3" />
        <h2 className="text-3xl font-bold text-[#1F3B6D]">{title}</h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin w-8 h-8 text-[#1F3B6D]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-full flex flex-col p-6">
      <header className="text-center my-12">
        <h1 className="text-5xl font-extrabold text-[#1F3B6D] mb-4">
          Your Next Adventure Awaits
        </h1>
        <p className="text-lg text-[#757575] max-w-2xl mx-auto">
          Explore our curated collection of books, from timeless classics to the
          latest bestsellers.
        </p>
        <Link to="/browse">
          <button className="mt-6 bg-[#4A90E2] text-white py-3 px-8 rounded-full text-lg font-semibold hover:bg-[#3A7BC8] transition-transform duration-300 transform hover:scale-105">
            Browse All Books
          </button>
        </Link>
      </header>

      <div className="container mx-auto">
        {renderBookSection("Featured Books", featuredBooks, Star)}
        {renderBookSection("Bestsellers", bestsellers, TrendingUp)}
        {renderBookSection("New Arrivals", newArrivals, Zap)}
      </div>
    </div>
  );
};

export default HomePage;
