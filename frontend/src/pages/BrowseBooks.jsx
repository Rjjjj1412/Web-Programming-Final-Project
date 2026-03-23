import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Fragment,
} from "react";
import axios from "axios";
import {
  Loader,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
} from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PAGE_SIZE = 9;

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// PriceRangeSlider component
const PriceRangeSlider = ({ min, max, onChange, initialMin, initialMax }) => {
  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);

  useEffect(() => {
    setMinVal(initialMin);
    setMaxVal(initialMax);
  }, [initialMin, initialMax]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - 1);
    setMinVal(value);
    onChange({ min: value, max: maxVal });
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minVal + 1);
    setMaxVal(value);
    onChange({ min: minVal, max: value });
  };

  return (
    <div className="relative w-full group hover:scale-[1.02] transition-transform duration-200">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={handleMinChange}
        className="absolute w-full h-2 bg-transparent appearance-none z-10"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={handleMaxChange}
        className="absolute w-full h-2 bg-transparent appearance-none z-20"
      />
      <div className="relative h-2">
        <div className="absolute w-full h-2 bg-[#E0E0E0] rounded-md"></div>
        <div
          className="absolute h-2 bg-[#0F1E3D] rounded-md transition-all duration-300"
          style={{
            left: `${(minVal / max) * 100}%`,
            right: `${100 - (maxVal / max) * 100}%`,
          }}
        ></div>
        <div
          className="absolute w-4 h-4 -mt-1 bg-white border-2 border-[#0F1E3D] rounded-full cursor-pointer transition-transform duration-200 group-hover:scale-125"
          style={{ left: `calc(${(minVal / max) * 100}% - 8px)` }}
        ></div>
        <div
          className="absolute w-4 h-4 -mt-1 bg-white border-2 border-[#0F1E3D] rounded-full cursor-pointer transition-transform duration-200 group-hover:scale-125"
          style={{ left: `calc(${(maxVal / max) * 100}% - 8px)` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-sm text-[#4A4A4A]">
        <span>${minVal}</span>
        <span>${maxVal}</span>
      </div>
    </div>
  );
};

const SORT_OPTIONS = [
  { id: "product_name", label: "Name" },
  { id: "unit_price", label: "Price" },
  { id: "publication_year", label: "Year" },
];

const ORDER_OPTIONS = [
  { id: "asc", label: "Asc" },
  { id: "desc", label: "Desc" },
];

const BrowseBooksPage = () => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  // read page from URL on init and whenever searchParams change
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [pageInput, setPageInput] = useState(urlPage);

  // other filters / state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "product_name",
  );
  const [order, setOrder] = useState(searchParams.get("order") || "asc");

  const [genres, setGenres] = useState([]);
  const [allCategories, setAllCategories] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(
    searchParams.get("genre") || "",
  );
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.getAll("category") || [],
  );
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get("price_min") || "0", 10),
    max: parseInt(searchParams.get("price_max") || "500", 10),
  });
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  // scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sync currentPage when URL changes (e.g. on full reload or manual URL edit)
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10) || 1;
    if (p !== currentPage) {
      setCurrentPage(p);
      setPageInput(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce search and reset page (user changed search => go to page 1)
  useEffect(() => {
    const isInitial = isInitialMount.current;
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (!isInitial) {
        // user-initiated search change => go to page 1
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Debounce price and reset page (user changed price => go to page 1)
  useEffect(() => {
    const isInitial = isInitialMount.current;
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
      if (!isInitial) {
        // user-initiated price change => go to page 1
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [priceRange]);

  // Reset page when filters change, but only when it's an actual filter selection
  // We avoid resetting when selectedGenre becomes "" from "All Genres" reload behavior
  useEffect(() => {
    if (!isInitialMount.current) {
      // Only reset page if a real filter is applied (genre not empty) or categories are selected
      if (selectedGenre !== "" || selectedCategories.length > 0) {
        setCurrentPage(1);
      }
    }
  }, [selectedGenre, selectedCategories]);

  // fetch genres/categories
  useEffect(() => {
    const fetchGenresAndCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories/by-genre`);
        if (res.data?.success) {
          setAllCategories(res.data.genres);
          setGenres(Object.keys(res.data.genres));
        }
      } catch (err) {
        console.error("Error fetching genres and categories", err);
      }
    };
    fetchGenresAndCategories();
  }, []);

  // update categories when genre changes
  useEffect(() => {
    if (selectedGenre && allCategories[selectedGenre])
      setCategories(allCategories[selectedGenre]);
    else setCategories([]);
    // If URL doesn't have categories param, clear selectedCategories (keeps URL-correct behaviour)
    if (!searchParams.has("category")) setSelectedCategories([]);
  }, [selectedGenre, allCategories, searchParams]);

  // central fetch - always uses currentPage; also persist page into URL (so reload keeps it)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearchQuery || undefined,
        genre: selectedGenre || undefined,
        category_id: selectedCategories.join(",") || undefined,
        price_min: debouncedPriceRange.min,
        price_max: debouncedPriceRange.max,
        sort_by: sortBy,
        order,
        page: currentPage,
        limit: PAGE_SIZE,
      };

      // Build URLSearchParams from current state and ALWAYS include page
      const newSearchParams = new URLSearchParams();
      if (debouncedSearchQuery)
        newSearchParams.set("search", debouncedSearchQuery);
      if (selectedGenre) newSearchParams.set("genre", selectedGenre);
      selectedCategories.forEach((c) => newSearchParams.append("category", c));
      if (debouncedPriceRange.min > 0)
        newSearchParams.set("price_min", debouncedPriceRange.min);
      if (debouncedPriceRange.max < 500)
        newSearchParams.set("price_max", debouncedPriceRange.max);
      newSearchParams.set("sortBy", sortBy);
      newSearchParams.set("order", order);
      // Persist page explicitly so reload keeps it
      newSearchParams.set("page", String(currentPage));

      // update URL (replace to avoid history spam)
      setSearchParams(newSearchParams, { replace: true });

      const res = await axios.get(`${BASE_URL}/api/products`, {
        params,
      });

      let items = [];
      let total = 0;

      if (
        res.data &&
        typeof res.data === "object" &&
        !Array.isArray(res.data)
      ) {
        if (Array.isArray(res.data.items)) {
          items = res.data.items;
          total = Number(
            res.data.totalCount ??
              res.data.total ??
              res.data.total_count ??
              items.length,
          );
        } else {
          items = Array.isArray(res.data) ? res.data : [];
          total = Number(res.headers["x-total-count"] ?? items.length);
        }
      } else if (Array.isArray(res.data)) {
        items = res.data;
        total = Number(res.headers["x-total-count"] ?? items.length);
      } else {
        items = [];
        total = 0;
      }

      setProducts(items);
      setTotalCount(total);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, [
    sortBy,
    order,
    debouncedSearchQuery,
    selectedGenre,
    selectedCategories,
    debouncedPriceRange,
    currentPage,
    setSearchParams,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // keep pageInput in sync with currentPage
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  // Scroll listener for scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const displayedProducts = products;

  const applyPage = (pageNum) => {
    const p = Math.min(
      Math.max(1, Math.floor(Number(pageNum) || 1)),
      totalPages,
    );
    if (p === currentPage) {
      // still persist to URL in case user manually edited URL
      const sp = new URLSearchParams(searchParams);
      sp.set("page", String(p));
      setSearchParams(sp, { replace: true });
      scrollToTop();
      return;
    }
    setCurrentPage(p);
    const sp = new URLSearchParams(searchParams);
    sp.set("page", String(p));
    setSearchParams(sp, { replace: true });
    scrollToTop();
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPage(pageInput);
    }
  };

  // handlers for prev/next
  const goPrev = () => applyPage(currentPage - 1);
  const goNext = () => applyPage(currentPage + 1);

  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Clear All should clear URL params without full reload
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedGenre("");
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 500 });
    setCurrentPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Pagination helper: generate pages with ellipses (E1)
  const getPageItems = (current, total) => {
    const pages = [];
    const delta = 2; // show two pages on each side
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);

    // always include first
    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("left-ellipsis");
    }

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < total) {
      if (right < total - 1) pages.push("right-ellipsis");
      pages.push(total);
    }

    return pages;
  };

  const pageItems = getPageItems(currentPage, totalPages);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#0F1E3D]">Browse Books</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#0F1E3D]">Filters</h2>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-sm text-[#4A90E2] hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Genre */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                Genre
              </label>
              <Listbox value={selectedGenre} onChange={setSelectedGenre}>
                {({ open }) => (
                  <div className="relative">
                    <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-[#9d9b9b] rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] transition-colors">
                      <span className="truncate text-sm text-[#0F1E3D]">
                        {selectedGenre || "All Genres"}
                      </span>
                      <ChevronDown
                        className={`ml-2 w-4 h-4 text-[#4A4A4A] transition-transform ${
                          open ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-50 mt-2 w-full bg-white border border-[#E6E8EB] rounded-lg shadow-lg max-h-56 overflow-auto focus:outline-none py-1">
                        <Listbox.Option key="all" value="">
                          {({ active, selected }) => (
                            <div
                              className={`px-3 py-2 text-sm cursor-pointer ${
                                active
                                  ? "bg-[#4A90E2] text-white"
                                  : "text-[#0F1E3D]"
                              } ${selected ? "font-semibold" : ""}`}
                            >
                              All Genres
                            </div>
                          )}
                        </Listbox.Option>
                        {genres.map((g) => (
                          <Listbox.Option key={g} value={g}>
                            {({ active, selected }) => (
                              <div
                                className={`px-3 py-2 text-sm cursor-pointer ${
                                  active
                                    ? "bg-[#4A90E2] text-white"
                                    : "text-[#0F1E3D]"
                                } ${selected ? "font-semibold" : ""}`}
                              >
                                {g}
                              </div>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                )}
              </Listbox>
            </div>

            {/* Category */}
            {categories.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                  Category
                </label>
                <div className="max-h-40 overflow-y-auto border border-[#E0E0E0] rounded-lg p-2 hover:shadow-inner transition-shadow duration-300 hover:scale-[1.02]">
                  {categories.map((c) => (
                    <div key={c.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={c.id}
                        value={c.id}
                        checked={selectedCategories.includes(c.id)}
                        onChange={() => handleCategoryChange(c.id)}
                        className="h-4 w-4 text-[#0F1E3D] focus:ring-[#0F3B60] border-gray-300 rounded"
                      />
                      <label
                        htmlFor={c.id}
                        className="ml-2 text-sm text-[#4A4A4A]"
                      >
                        {c.category_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
                Price Range
              </label>
              <PriceRangeSlider
                min={0}
                max={500}
                initialMin={priceRange.min}
                initialMax={priceRange.max}
                onChange={setPriceRange}
              />
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4">
          {/* Toolbar: search + sort + pagination (top-right) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center w-full sm:w-1/2">
              <Search className="w-5 h-5 text-[#4A4A4A] mr-2" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[#9d9b9b] focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] hover:border-[#0F3B60] transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex gap-2 items-center">
                <div className="w-40">
                  <Listbox value={sortBy} onChange={(val) => setSortBy(val)}>
                    {({ open }) => (
                      <div className="relative">
                        <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-[#9d9b9b] rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] transition-colors text-sm">
                          <span className="truncate">
                            {SORT_OPTIONS.find((s) => s.id === sortBy)?.label ??
                              "Sort By"}
                          </span>
                          <ChevronDown
                            className={`ml-2 w-4 h-4 text-[#4A4A4A] transition-transform ${
                              open ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-50 mt-2 w-full bg-white border border-[#E6E8EB] rounded-lg shadow-lg max-h-48 overflow-auto py-1">
                            {SORT_OPTIONS.map((opt) => (
                              <Listbox.Option key={opt.id} value={opt.id}>
                                {({ active, selected }) => (
                                  <div
                                    className={`px-3 py-2 text-sm cursor-pointer ${
                                      active
                                        ? "bg-[#4A90E2] text-white"
                                        : "text-[#0F1E3D]"
                                    } ${selected ? "font-semibold" : ""}`}
                                  >
                                    {opt.label}
                                  </div>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                </div>

                <div className="w-28">
                  <Listbox value={order} onChange={(val) => setOrder(val)}>
                    {({ open }) => (
                      <div className="relative">
                        <Listbox.Button className="w-full flex justify-between items-center px-3 py-2 border border-[#9d9b9b] rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] transition-colors text-sm">
                          <span>
                            {ORDER_OPTIONS.find((o) => o.id === order)?.label ??
                              "Order"}
                          </span>
                          <ChevronDown
                            className={`ml-2 w-4 h-4 text-[#4A4A4A] transition-transform ${
                              open ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-50 mt-2 w-full bg-white border border-[#E6E8EB] rounded-lg shadow-lg max-h-40 overflow-auto py-1">
                            {ORDER_OPTIONS.map((opt) => (
                              <Listbox.Option key={opt.id} value={opt.id}>
                                {({ active, selected }) => (
                                  <div
                                    className={`px-3 py-2 text-sm cursor-pointer ${
                                      active
                                        ? "bg-[#4A90E2] text-white"
                                        : "text-[#0F1E3D]"
                                    } ${selected ? "font-semibold" : ""}`}
                                  >
                                    {opt.label}
                                  </div>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    )}
                  </Listbox>
                </div>
              </div>

              {/* Modern pill pagination (E1) */}
              <div className="ml-2 flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentPage === 1 || totalPages === 0}
                  className={`px-3 py-1 rounded-full border text-sm flex items-center justify-center ${
                    currentPage === 1 || totalPages === 0
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-[#4A90E2] hover:text-white"
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {pageItems.map((p, idx) => {
                    if (p === "left-ellipsis" || p === "right-ellipsis") {
                      return (
                        <div
                          key={p + idx}
                          className="px-2 text-sm text-[#4A4A4A]"
                        >
                          …
                        </div>
                      );
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => applyPage(p)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          p === currentPage
                            ? "bg-[#0F1E3D] text-white border-[#0F1E3D]"
                            : "bg-white text-[#0F1E3D] hover:bg-[#4A90E2] hover:text-white"
                        }`}
                        aria-current={p === currentPage ? "page" : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={goNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-full border text-sm flex items-center justify-center ${
                    currentPage === totalPages || totalPages === 0
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-[#4A90E2] hover:text-white"
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

      {loading ? (
        <div className="flex justify-center items-center mt-12">
          <Loader className="animate-spin w-8 h-8 text-[#0F1E3D]" />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-16 text-[#4A4A4A]">
          <p className="text-lg font-semibold">No items found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>

          <div className="mt-4 text-sm">
            Showing page {currentPage} of {totalPages} — 0 items
          </div>
        </div>
      ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product, index) => (
                  <div
                    key={product._id}
                    data-testid={`product-card-${product._id}`}
                    data-index={index}
                    className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <img
                      src={`${BASE_URL}/images/${product.image_url
                        .split("/")
                        .pop()}`}
                      alt={product.product_name}
                      className="w-full h-48 object-cover rounded-md mb-3 bg-[#F5F7FA]"
                    />
                    <h2 className="font-semibold text-lg text-[#0F1E3D] mb-1 truncate">
                      {product.product_name}
                    </h2>
                    <p className="text-[#4A4A4A] text-sm mb-2">
                      {product.author}
                    </p>
                    <p className="text-[#4A90E2] font-bold mb-2">
                      ${product.unit_price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom: optional minimal pagination summary (kept small) */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-[#4A4A4A]">
                  Showing page {currentPage} of {totalPages} — {totalCount}{" "}
                  items
                </div>

                {/* Small quick jump input (compact) */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputSubmit}
                    className="w-16 text-center px-2 py-1 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] text-sm"
                    min={1}
                    max={Math.max(1, totalPages)}
                  />
                  <button
                    onClick={() => applyPage(pageInput)}
                    disabled={totalPages <= 1}
                    className={`px-3 py-1 text-white rounded-lg text-sm ${
                      totalPages <= 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-[#4A90E2] hover:bg-[#3A7BC8]"
                    }`}
                  >
                    Go
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 bg-[#4A90E2] text-white p-3 rounded-full shadow-lg hover:bg-[#3A7BC8] transition"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default BrowseBooksPage;
