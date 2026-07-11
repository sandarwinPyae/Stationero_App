import './StationeroPage.css';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Footer from "../components/Footer";

export const StationeroNavbar = ({ searchQuery, setSearchQuery, showSearch = true }) => {
      const location = useLocation();
      const navigate = useNavigate();

      const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

      const handleLogin = () => {
            navigate('/login');
      };

      const handleLogout = (e) => {
            e.preventDefault();
            setIsLoggedIn(false);
            localStorage.removeItem('stationero_logged_user');
            navigate('/');
      };

      const handleSearchSubmit = async (e) => {
            if (e.key !== "Enter") return;

            const query = searchQuery.trim().toLowerCase();

            if (!query) return;

            try {
                  const resBest = await fetch("http://127.0.0.1:8000/api/products/best-selling");
                  const bestProducts = await resBest.json();

                  const resNew = await fetch("http://127.0.0.1:8000/api/products/new-arrivals");
                  const newProducts = await resNew.json();

                  const homeProducts = [...bestProducts, ...newProducts];

                  const found = homeProducts.some(p =>
                        p.product_name.toLowerCase().includes(query) ||
                        p.category_name?.toLowerCase().includes(query)
                  );

                  if (found) {
                        setSearchQuery(query);
                        return;
                  }

                  navigate(`/product?search=${encodeURIComponent(query)}`);

            } catch (err) {
                  console.error(err);
            }
      };

      const scrollToSection = (id) => {
            if (location.pathname !== "/") {
                  navigate(`/#${id}`);
            } else {
                  const element = document.getElementById(id);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
            }
      };

      const renderSearchBar = () => (
            showSearch && (
                  <div className="search-bar">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8"></circle>
                              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                              type="text"
                              placeholder="Search product"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={handleSearchSubmit}
                        />
                  </div>
            )
      );

      return (
            <nav className="navbar">
                  <div className="container">
                        <h1 className="logo">Stationero</h1>
                        {isLoggedIn ? (
                              <>
                                    {renderSearchBar()}
                                    <ul className="nav-links user-nav-links">
                                          <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
                                          <li><Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About Us</Link></li>
                                          <li><Link to="/product" className={location.pathname === "/product" ? "active" : ""}>Product</Link></li>
                                          <li><Link to="/cart" className={location.pathname === "/cart" ? "active" : ""}>Shopping Cart</Link></li>
                                          <li><Link to="/order" className={location.pathname === "/order" ? "active" : ""}>Order</Link></li>
                                          <li><Link to="/returns" className={location.pathname === "/returns" ? "active" : ""}>Returns</Link></li>
                                          <li><Link to="/history" className={location.pathname === "/history" ? "active" : ""}>History</Link></li>
                                          <li><Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>Profile</Link></li>
                                          <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
                                    </ul>
                              </>
                        ) : (
                              <>
                                    {renderSearchBar()}
                                    <ul className="nav-links">
                                          <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
                                          <li><Link to="/about" className={location.pathname === "/about" ? "active" : ""}>About Us</Link></li>
                                          <li><Link to="/product" className={location.pathname === "/product" ? "active" : ""}>Product</Link></li>
                                    </ul>
                                    <div className="auth-btns">
                                          <button className="btn btn-auth" onClick={handleLogin}>Login</button>
                                          <button className="btn btn-auth" onClick={() => navigate('/signup')}>Sign Up</button>
                                    </div>
                              </>
                        )}
                  </div>
            </nav>
      );
};

const HeroSection = () => {
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext); // 🌟 Login စစ်ဖို့ ထည့်ထားပါတယ်

      const handleShopNowClick = () => {
            if (isLoggedIn) {
                  navigate('/product');
            } else {
                  navigate('/login');
            }
      };

      return (
            <section className="hero" style={{ backgroundImage: `url(http://127.0.0.1:8000/images/heroBg.jpg)` }}>
                  <div className="hero-container">
                        <div className="hero-content">
                              <h2 className="hero-title">
                                    Find <span className="highlight">Everything</span><br />
                                    Your Office Needs.
                              </h2>
                              <p className="hero-subtitle">
                                    Stationero makes it so that in everything we do, the<br />
                                    support we provide can help and educate you.
                              </p>
                              <button className="btn btn-shop-outline" onClick={handleShopNowClick}>
                                    SHOP NOW &gt;
                              </button>
                        </div>
                  </div>
            </section>
      );
};

const OfferCard = ({ image, title, discount, productId }) => {
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext);

      const handleShopClick = () => {
            if (isLoggedIn && productId) {
                  navigate(`/product`);
            } else if (!isLoggedIn) {
                  navigate('/login');
            }
      };

      return (
            <div className="offer-card" style={{ backgroundImage: `url(${image})` }}>
                  <div className="offer-content">
                        <h3 className="offer-title">{title}</h3>
                        <p className="offer-discount">{discount}</p>
                        <button className="btn btn-shop-small" onClick={handleShopClick}>
                              SHOP NOW &gt;
                        </button>
                  </div>
            </div>
      );
};

// 🌟 100% Dynamic ဖြစ်အောင် ပြင်ဆင်ထားသော CategoryOffers
const CategoryOffers = () => {
      const [products, setProducts] = useState([]);

      useEffect(() => {
            fetch("http://127.0.0.1:8000/api/products")
                  .then(res => res.json())
                  .then(data => setProducts(data))
                  .catch(err => console.error("Error fetching for category offers:", err));
      }, []);

      // Database ထဲက နာမည်တွေနဲ့ တိုက်စစ်ပြီး ID တွေကို Dynamic ဆွဲထုတ်ပါမည်
      const notebookId = products.find(p => p.product_name.toLowerCase().includes("notebook"))?.product_id;
      const tapeId = products.find(p => p.product_name.toLowerCase() === "tape")?.product_id;
      const correctionTapeId = products.find(p => p.product_name.toLowerCase().includes("correction tape"))?.product_id;

      return (
            <section className="category-offers">
                  <div className="container">
                        <div className="category-grid">
                              <OfferCard
                                    image="http://127.0.0.1:8000/images/notebookOffer.jpg"
                                    title="NOTEBOOKS"
                                    productId={notebookId || 1}
                              />
                              <OfferCard
                                    image="http://127.0.0.1:8000/images/tapeOffer.jpg"
                                    title="ALL TAPES"
                                    productId={tapeId || 1}
                              />
                              <OfferCard
                                    image="http://127.0.0.1:8000/images/correctionTapeOffer.jpg"
                                    title="CORRECTION TAPES"
                                    productId={correctionTapeId || 1}
                              />
                        </div>
                  </div>
            </section>
      );
};


const ProductCard = ({ product }) => {
      return (
            <Link
                  to="/product"
                  className="product-card"
                  style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
            >
                  <div className="product-img-box">
                        <img
                              src={`http://127.0.0.1:8000/${product.product_img_url}`}
                              alt={product.product_name}
                        />
                  </div>
                  <h3 className="product-name">{product.product_name}</h3>
                  <p className="product-price-tag">{product.display_price}</p>
            </Link>
      );
};

const SectionTitle = () => {
      return (
            <div className="container best-selling-container">
                  <h2 className="section-title">Selling <span className="highlight">Products</span></h2>
                  <p className="section-subtitle">
                        Essentials Office Supplies in Our Online Stationery Shop That Keep Your Office<br />
                        Operations Smooth And Efficient
                  </p>
            </div>
      );
};

const BestSellingGrid = ({ searchQuery }) => {
      const [products, setProducts] = useState([]);
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext);

      useEffect(() => {
            fetch("http://127.0.0.1:8000/api/products/best-selling")
                  .then(res => res.json())
                  .then(data => setProducts(data));
      }, []);

      const handleProductClick = (productId) => {
            if (isLoggedIn) {
                  navigate(`/product/${productId}`);
            } else {
                  navigate('/login');
            }
      };

      const filtered = products.filter(p => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()));

      return (
            <section className="best-selling" id="best-selling">
                  <div className="container">
                        <div className="product-grid">
                              {filtered.map(p => (
                                    <ProductCard
                                          key={p.product_id}
                                          product={p}
                                          onProductClick={handleProductClick}
                                    />
                              ))}
                        </div>
                  </div>
            </section>
      );
};

const NewArrivalsGrid = ({ searchQuery }) => {
      const [products, setProducts] = useState([]);
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext);

      useEffect(() => {
            fetch("http://127.0.0.1:8000/api/products/new-arrivals")
                  .then(res => res.json())
                  .then(data => setProducts(data));
      }, []);

      const filtered = products.filter(p => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const handleProductClick = (productId) => {
            if (isLoggedIn) {
                  navigate(`/product/${productId}`);
            } else {
                  navigate('/login');
            }
      };

      return (
            <section className="new-arrivals" id="new-arrivals" style={{ paddingBottom: '50px' }}>
                  <div className="container best-selling-container">
                        <h2 className="section-title">New <span className="highlight">Arrivals</span></h2>
                  </div>
                  <div className="container">
                        <div className="product-grid">
                              {filtered.map(p => (
                                    <ProductCard
                                          key={p.product_id}
                                          product={p}
                                          onProductClick={handleProductClick}
                                    />
                              ))}
                        </div>
                  </div>
            </section>
      );
};

// 🌟 100% Dynamic ဖြစ်အောင် ပြင်ဆင်ထားသော PromoBanner
const PromoBanner = () => {
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext);
      const [promoProduct, setPromoProduct] = useState(null);

      useEffect(() => {
            fetch("http://127.0.0.1:8000/api/products")
                  .then(res => res.json())
                  .then(data => {
                        // Promotion အတွက် Desk Organizer သို့မဟုတ် ရှိတဲ့ပစ္စည်းကို Dynamic ဆွဲတင်ပါမည်
                        const targetPromo = data.find(p => p.product_name === "Desk Organizer") || data[0];
                        setPromoProduct(targetPromo);
                  })
                  .catch(err => console.error("Error fetching promo product:", err));
      }, []);

      const handlePromoClick = () => {
            if (isLoggedIn && promoProduct) {
                  navigate(`/product`);
            } else if (!isLoggedIn) {
                  navigate('/login');
            }
      };

      return (
            <section className="promo-banner">
                  <div className="container promo-wrapper">
                        <div className="promo-text-side">
                              <h4 className="promo-subtitle">TODAY ONLY</h4>
                              <h2 className="promo-title">YELLOW PACK BACK</h2>

                              <svg className="squiggly-line" width="250" height="20" viewBox="0 0 250 20">
                                    <path d="M0,10 Q15,0 31.25,10 T62.5,10 T93.75,10 T125,10 T156.25,10 T187.5,10 T218.75,10 T250,10" fill="none" stroke="#555" strokeWidth="1.5" />
                              </svg>

                              {/* Database ထဲက ဈေးနှုန်းအတိုင်း အမှန်တကယ် ပြသပေးပါမည် */}
                              <p className="promo-price">{promoProduct ? promoProduct.display_price : "Loading..."}</p>

                              <button className="btn btn-promo-shop" onClick={handlePromoClick}>
                                    SHOP NOW &gt;
                              </button>
                        </div>
                        <div className="promo-image-side">
                              <img src="http://127.0.0.1:8000/images/yellowPack.jpg" alt="Yellow Pack Back" />
                        </div>
                  </div>
            </section>
      );
};

const NewExperienceSection = () => {
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext); // 🌟 Login စစ်ဖို့ ထည့်ထားပါတယ်

      const handleShopClick = () => {
            if (isLoggedIn) {
                  navigate('/product');
            } else {
                  navigate('/login');
            }
      };

      return (
            <section className="experience-section">
                  <div className="container experience-wrapper" style={{ backgroundImage: `url(http://127.0.0.1:8000/images/experienceBg.jpg)` }}>
                        <div className="exp-content">
                              <p className="exp-label">100% STATIONERY PRODUCT</p>
                              <h2 className="exp-title">Open Up To<br />A New Experience.</h2>
                              <button className="btn btn-exp-shop" onClick={handleShopClick}>
                                    ALL PRODUCTS&gt;
                              </button>
                        </div>
                  </div>
            </section>
      );
};

const FirstOrderOffer = () => {
      const navigate = useNavigate();
      return (
            <section className="first-order-section" style={{ backgroundImage: `url(http://127.0.0.1:8000/images/firstOrderBg.jpg)` }}>
                  <div className="first-order-content">
                        <h2>10% OFF YOUR FIRST ORDER</h2>
                        <p>Welcome Offer</p>
                        <button className="btn-sign-up-offer" onClick={() => navigate('/signup')}>
                              Sign up
                        </button>
                  </div>
            </section>
      );
};

const StationeroPage = () => {
      const [searchQuery, setSearchQuery] = useState("");
      const location = useLocation();

      // 🌟 Footer ကနေ Hash နဲ့ လာရင် တန်း Scroll ချပေးမယ့် အပိုင်း
      useEffect(() => {
            if (location.hash) {
                  const id = location.hash.replace('#', '');
                  const element = document.getElementById(id);
                  if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                  }
            } else {
                  window.scrollTo(0, 0);
            }
      }, [location]);

      // Search လုပ်တဲ့အခါ Scroll ချပေးမယ့် အပိုင်း
      useEffect(() => {
            if (searchQuery) {
                  fetch("http://127.0.0.1:8000/api/products/best-selling")
                        .then(res => res.json())
                        .then(data => {
                              if (data.some(p => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                                    const el = document.getElementById('best-selling');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }
                        });

                  fetch("http://127.0.0.1:8000/api/products/new-arrivals")
                        .then(res => res.json())
                        .then(data => {
                              if (data.some(p => p.product_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                                    const el = document.getElementById('new-arrivals');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }
                        });
            }
      }, [searchQuery]);

      return (
            <div className="page-layout">
                  <StationeroNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                  <HeroSection />
                  <CategoryOffers />
                  <SectionTitle />
                  <BestSellingGrid searchQuery={searchQuery} />
                  <NewArrivalsGrid searchQuery={searchQuery} />
                  <PromoBanner />
                  <NewExperienceSection />
                  <FirstOrderOffer />
                  <Footer />
            </div>
      );
};

export default StationeroPage;