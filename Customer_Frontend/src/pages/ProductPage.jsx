import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios import လုပ်ပါ
import { AuthContext } from '../context/AuthContext';
import { StationeroNavbar } from './StationeroPage';
import './ProductPage.css';
import Footer from "../components/Footer";

const ProductCard = ({ product, onProductClick }) => {
      return (
            <div className="product-card" onClick={() => onProductClick(product.product_id)} style={{ cursor: 'pointer' }}>
                  <div className="product-img-box">
                        <img src={`http://localhost:8000/${product.product_img_url}`} alt={product.product_name} />
                  </div>
                  <h3 className="product-name">{product.product_name}</h3>
                  <p className="product-price-tag">{product.display_price}</p>
            </div>
      );
};

const ProductPage = () => {
      const [searchParams] = useSearchParams();
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext);

      const initialSearch = searchParams.get("search") || "";

      const [products, setProducts] = useState([]);
      const [categories, setCategories] = useState([]);

      const [searchQuery, setSearchQuery] = useState(initialSearch);
      const [selectedCategory, setSelectedCategory] = useState("");

      const [sortOrder, setSortOrder] = useState("none");
      const [loading, setLoading] = useState(false);
      const handleProductClick = (productId) => {
            if (isLoggedIn) {
                  navigate(`/product/${productId}`);
            } else {
                  navigate('/login');
            }
      };

      // 🌟 Axios သုံးပြီး အဓိက ပြင်ဆင်ထားသော fetchProducts
      // Fetch Products
      const fetchProducts = async () => {
            setLoading(true);

            try {
                  const response = await axios.get(
                        "http://localhost:8000/api/products",
                        {
                              params: {
                                    sort: sortOrder,
                                    search:
                                          searchQuery.trim() !== ""
                                                ? searchQuery.trim()
                                                : undefined,

                                    category:
                                          selectedCategory !== ""
                                                ? selectedCategory
                                                : undefined,
                              },
                        }
                  );

                  console.log("API Response:", response.data);

                  setProducts(response.data);

            } catch (error) {

                  console.error("Error fetching products:", error);

            } finally {

                  setLoading(false);

            }
      };
      // Fetch Categories
      useEffect(() => {

            const fetchCategories = async () => {

                  try {

                        const response = await axios.get(
                              "http://localhost:8000/api/categories"
                        );

                        console.log("Categories:", response.data);

                        setCategories(response.data);

                  } catch (error) {

                        console.error("Error fetching categories:", error);

                  }

            };

            fetchCategories();

      }, []);
      useEffect(() => {
            setSearchQuery(searchParams.get("search") || "");
      }, [searchParams]);
      useEffect(() => {
            const delayDebounceFn = setTimeout(() => {
                  fetchProducts();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
      }, [searchQuery, selectedCategory, sortOrder]);
      useEffect(() => {
            console.log("Products State:", products);
      }, [products]);
      return (
            <div className="product-page">
                  <StationeroNavbar showSearch={false} />

                  <section className="product-hero">
                        <div className="product-hero-container">
                              <div className="hero-image-bg"></div>
                              <div className="product-hero-title-box">
                                    <h1 className="product-hero-title">OFFICE SUPPLIES</h1>
                              </div>
                        </div>
                  </section>

                  <section className="product-list-section">
                        <div className="product-toolbar">
                              <div className="product-search-bar">
                                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <circle cx="11" cy="11" r="8"></circle>
                                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <input
                                          type="text"
                                          placeholder="Search product"
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                              </div>
                              <div className="category-bar">
                                    <label style={{ fontWeight: 'bold' }}>Category:</label>

                                    <select
                                          className="category-select"
                                          value={selectedCategory}
                                          onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                          <option value="">All Categories</option>

                                          {categories.map((category) => (
                                                <option
                                                      key={category.category_id}
                                                      value={category.category_name}
                                                >
                                                      {category.category_name}
                                                </option>
                                          ))}
                                    </select>
                              </div>
                              <div className="sort-bar">
                                    <label>Price: </label>
                                    <select
                                          className="sort-select"
                                          value={sortOrder}
                                          onChange={(e) => setSortOrder(e.target.value)}
                                    >
                                          <option value="none">Default</option>
                                          <option value="low-to-high">Low to High</option>
                                          <option value="high-to-low">High to Low</option>
                                    </select>
                              </div>
                        </div>

                        <div className="product-grid">
                              {loading ? (
                                    <p style={{ textAlign: 'center', width: '100%' }}>Loading...</p>
                              ) : products.length > 0 ? (
                                    products.map((product) => (
                                          <ProductCard
                                                key={product.product_id}
                                                product={product}
                                                onProductClick={handleProductClick}
                                          />
                                    ))
                              ) : (
                                    <div style={{ textAlign: 'center', width: '100%', padding: '40px 0', color: '#ff4d4f' }}>
                                          <h3>Oppss! No products found.</h3>
                                          <p>We couldn't find anything matching "{searchQuery}". Please try another keyword.</p>
                                    </div>
                              )}
                        </div>
                  </section>
                  <Footer />
            </div>
      );
};

export default ProductPage;