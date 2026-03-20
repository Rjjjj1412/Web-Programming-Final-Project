// seedProducts.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";
import Supplier from "./src/models/Supplier.js";

const MONGO_URI = ""; // replace with your MongoDB URI
const GOOGLE_BOOKS_API_KEY = "GOOGLE API KEY"; // replace with your Google Books API key

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public/images exists
const imagesDir = path.join(__dirname, "public/images");
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Placeholder image (make sure placeholder.jpg exists)
const PLACEHOLDER_IMAGE = `http://localhost:5000/public/images/placeholder.jpg`;

// Helper: sanitize strings according to schema max length
const sanitizeString = (str, maxLength) =>
  str ? str.substring(0, maxLength) : "";

// Helper: download image and save locally
const downloadImage = async (url, filenameBase) => {
  try {
    if (!url) throw new Error("No image URL");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Image download failed");
    const buffer = await res.arrayBuffer();
    let ext = path.extname(url).split("?")[0] || ".jpg";
    if (!ext.match(/\.(jpg|jpeg|png|webp)$/i)) ext = ".jpg";
    const filename = filenameBase.toLowerCase().replace(/\s+/g, "_") + ext;
    const filepath = path.join(imagesDir, filename);
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return `${process.env.BACKEND_URL || "http://localhost:5000"}/images/${filename}`;
  } catch (err) {
    console.error("Error downloading image:", err);
    return PLACEHOLDER_IMAGE;
  }
};

// Helper: fetch books from Google Books API
const fetchBooks = async (query, maxResults = 20) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query,
  )}&maxResults=${maxResults}&key=${GOOGLE_BOOKS_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return [];

    return data.items.map((item) => {
      const info = item.volumeInfo;
      // Prefer higher quality images
      const imageUrl =
        info.imageLinks?.extraLarge ||
        info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.small ||
        info.imageLinks?.thumbnail ||
        null;

      return {
        product_name: sanitizeString(info.title, 200) || "Unknown Title",
        description: sanitizeString(info.description, 500) || "No Description",
        author: sanitizeString(
          info.authors ? info.authors.join(", ") : "Unknown Author",
          100,
        ),
        publisher: sanitizeString(info.publisher || "Unknown Publisher", 100),
        isbn:
          info.industryIdentifiers && info.industryIdentifiers[0]
            ? info.industryIdentifiers[0].identifier
            : `978-1-0000-${Math.floor(Math.random() * 10000)}`,
        language: info.language || "English",
        number_of_pages: info.pageCount || 200,
        publication_year: info.publishedDate
          ? parseInt(info.publishedDate.substring(0, 4))
          : 2023,
        image_url: imageUrl,
      };
    });
  } catch (err) {
    console.error("Error fetching books:", err);
    return [];
  }
};

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const categories = await Category.find({}).lean();
    const suppliers = await Supplier.find({}).lean();

    let allProducts = [];

    for (const cat of categories) {
      console.log(`Fetching books for category: ${cat.category_name}`);
      const books = await fetchBooks(cat.category_name, 20);
      console.log(`Fetched ${books.length} books for ${cat.category_name}`);

      const productsWithIds = await Promise.all(
        books.map(async (b) => {
          const supplier =
            suppliers[Math.floor(Math.random() * suppliers.length)];

          // Download image with fallback
          const image_url = await downloadImage(b.image_url, b.product_name);

          const unit_price = parseFloat((Math.random() * 40 + 10).toFixed(2));
          const cost_price = parseFloat((unit_price * 0.6).toFixed(2));

          return {
            product_name: b.product_name,
            description: b.description || "No Description",
            author: b.author,
            publisher: b.publisher,
            isbn: b.isbn,
            category_id: cat._id,
            supplier_id: supplier._id,
            unit_price,
            cost_price,
            language: b.language,
            number_of_pages: b.number_of_pages,
            publication_year: b.publication_year,
            format: "Paperback",
            image_url: image_url || PLACEHOLDER_IMAGE,
            is_active: true,
          };
        }),
      );

      allProducts = allProducts.concat(productsWithIds);
    }

    console.log(`Inserting ${allProducts.length} products into DB...`);
    await Product.insertMany(allProducts);
    console.log("Products seeded successfully!");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

seedProducts();
