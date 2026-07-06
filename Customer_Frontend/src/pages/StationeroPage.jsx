import './StationeroPage.css';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Footer from "../components/Footer";

export const StationeroNavbar = ({ searchQuery, setSearchQuery, showSearch = true }) => {
      const location = useLocation();
      const navigate = useNavigate();

      const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

      const [navSearchQuery, setNavSearchQuery] = useState("");

      const handleLogin = () => {
            navigate('/login'); // 🌟 Navbar က Login ခလုတ်ကို နှိပ်ရင် Login Page ကို သွားအောင် ပြင်ထားပါတယ်
      };

      const handleLogout = (e) => {
            e.preventDefault();
            setIsLoggedIn(false);
            localStorage.removeItem('stationero_logged_user'); // Logout လုပ်ရင် Storage ပါ ရှင်းထုတ်မယ်
            navigate('/');
      };

      const handleSearchSubmit = async (e) => {
            if (e.key === 'Enter' && navSearchQuery.trim() !== "") {
                  const query = navSearchQuery.trim().toLowerCase();

                  try {
                        const resBest = await fetch("http://127.0.0.1:8000/api/products/best-selling");
                        const bestProducts = await resBest.json();
                        if (bestProducts.find(p => p.product_name.toLowerCase().includes(query))) {
                              scrollToSection('best-selling');
                              return;
                        }

                        const resNew = await fetch("http://127.0.0.1:8000/api/products/new-arrivals");
                        const newProducts = await resNew.json();
                        if (newProducts.find(p => p.product_name.toLowerCase().includes(query))) {
                              scrollToSection('new-arrivals');
                              return;
                        }

                        navigate(`/product?search=${encodeURIComponent(query)}`);
                  } catch (error) {
                        console.error("Search error", error);
                  }
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

// 🌟 HeroSection component နေရာတွင် အစားထိုးရန်
const HeroSection = () => {
      const navigate = useNavigate(); // Navigation အတွက် ထည့်သွင်းခြင်း

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
                              {/* 🌟 ခလုတ်နှိပ်လျှင် /product သို့ ရောက်သွားစေမည့် onClick ကို ထည့်ထားပါသည် */}
                              <button
                                    className="btn btn-shop-outline"
                                    onClick={() => navigate('/product')}
                              >
                                    SHOP NOW &gt;
                              </button>
                        </div>
                  </div>
            </section>
      );
};

// 🌟 OfferCard ကို Login ဝင်/မဝင် စစ်ဆေးနိုင်ရန် ပြင်ဆင်ခြင်း
const OfferCard = ({ image, title, discount, productId }) => {
      const navigate = useNavigate(); // Navigation အတွက်
      const { isLoggedIn } = useContext(AuthContext); // Login အခြေအနေစစ်ရန်

      const handleShopClick = () => {
            if (isLoggedIn) {
                  // Login ဝင်ထားရင် သတ်မှတ်ထားတဲ့ Product Detail ကိုသွားမယ်
                  navigate(`/product/${productId}`);
            } else {
                  // Guest ဆိုရင် Login Page ကိုသွားမယ်
                  navigate('/login');
            }
      };

      return (
            <div className="offer-card" style={{ backgroundImage: `url(${image})` }}>
                  <div className="offer-content">
                        <h3 className="offer-title">{title}</h3>
                        <p className="offer-discount">{discount}</p>
                        {/* 🌟 ခလုတ်နှိပ်လျှင် handleShopClick ကို အလုပ်လုပ်စေမည် */}
                        <button className="btn btn-shop-small" onClick={handleShopClick}>
                              SHOP NOW &gt;
                        </button>
                  </div>
            </div>
      );
};

// 🌟 CategoryOffers တွင် သက်ဆိုင်ရာ Product ID များ ထည့်ပေးခြင်း
const CategoryOffers = () => {
      return (
            <section className="category-offers">
                  <div className="container">
                        <div className="category-grid">
                              {/* ⚠️ productId နေရာတွင် Database ထဲက အမှန်တကယ်သွားချင်သော ပစ္စည်း၏ ID ကို ပြင်ထည့်ပေးပါ ⚠️ */}
                              <OfferCard
                                    image="http://127.0.0.1:8000/images/notebookOffer.jpg"
                                    title="NOTEBOOKS"
                                    discount="25% OFF"
                                    productId={15} /* <--- ဥပမာ: Notebook ၏ Product ID */
                              />
                              <OfferCard
                                    image="http://127.0.0.1:8000/images/tapeOffer.jpg"
                                    title="ALL TAPES"
                                    discount="25% OFF"
                                    productId={11} /* <--- ဥပမာ: Tapes ၏ Product ID */
                              />
                              <OfferCard
                                    image="http://127.0.0.1:8000/images/correctionTapeOffer.jpg"
                                    title="CORRECTION TAPES"
                                    discount="25% OFF"
                                    productId={13} /* <--- ဥပမာ: Correction Tapes ၏ Product ID */
                              />
                        </div>
                  </div>
            </section>
      );
};

// 🌟 ပစ္စည်းနှိပ်လျှင် အလုပ်လုပ်မည့် ProductCard အသစ်
const ProductCard = ({ product, onProductClick }) => {
      return (
            <div className="product-card" onClick={() => onProductClick(product.product_id)} style={{ cursor: 'pointer' }}>
                  <div className="product-img-box">
                        <img src={`http://127.0.0.1:8000/images/${product.product_img_url}`} alt={product.product_name} />
                  </div>
                  <h3 className="product-name">{product.product_name}</h3>
                  <p className="product-price-tag">{product.display_price}</p>
            </div>
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

// 🌟 BestSellingGrid ကို Click function နှင့်ချိတ်ဆက်ခြင်း
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
                                          product={p} // 🌟 Product Object အပြည့်ပို့ပါမည်
                                          onProductClick={handleProductClick} // 🌟 Click Function ပို့ပါမည်
                                    />
                              ))}
                        </div>
                  </div>
            </section>
      );
};

// 🌟 NewArrivalsGrid ကို Click function နှင့်ချိတ်ဆက်ခြင်း
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
                                          product={p} // 🌟 Product Object အပြည့်ပို့ပါမည်
                                          onProductClick={handleProductClick} // 🌟 Click Function ပို့ပါမည်
                                    />
                              ))}
                        </div>
                  </div>
            </section>
      );
};

// 🌟 PromoBanner ကို Login ဝင်/မဝင် စစ်ဆေးနိုင်ရန် ပြင်ဆင်ခြင်း
const PromoBanner = () => {
      const navigate = useNavigate();
      const { isLoggedIn } = useContext(AuthContext);

      // ⚠️ ဒီ Yellow Pack ပစ္စည်းအတွက် Database ထဲက အမှန်တကယ် ID ကို ပြင်ထည့်ပေးရန် ⚠️
      const promoProductId = 2;

      const handlePromoClick = () => {
            if (isLoggedIn) {
                  // Login ဝင်ထားရင် သတ်မှတ်ထားတဲ့ Product Detail ကိုသွားမယ်
                  navigate(`/product/${promoProductId}`);
            } else {
                  // Guest ဆိုရင် Login Page ကိုသွားမယ်
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

                              <p className="promo-price">25,000 MMK</p>
                              {/* 🌟 ခလုတ်နှိပ်လျှင် handlePromoClick ကို အလုပ်လုပ်စေမည် */}
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

      return (
            <section className="experience-section">
                  <div className="container experience-wrapper" style={{ backgroundImage: `url(http://127.0.0.1:8000/images/experienceBg.jpg)` }}>
                        <div className="exp-content">
                              <p className="exp-label">100% STATIONERY PRODUCT</p>
                              <h2 className="exp-title">Open Up To<br />A New Experience.</h2>
                              <button
                                    className="btn btn-exp-shop"
                                    onClick={() => navigate('/product')}
                              >
                                    ALL PRODUCTS&gt;
                              </button>
                        </div>
                  </div>
            </section>
      );
};

// 🌟 FirstOrderOffer component နေရာတွင် အစားထိုးရန်
const FirstOrderOffer = () => {
      const navigate = useNavigate(); // Navigation အတွက် ထည့်သွင်းခြင်း

      return (
            <section
                  className="first-order-section"
                  style={{ backgroundImage: `url(http://127.0.0.1:8000/images/firstOrderBg.jpg)` }}
            >
                  <div className="first-order-content">
                        <h2>10% OFF YOUR FIRST ORDER</h2>
                        <p>Welcome Offer</p>
                        {/* 🌟 ခလုတ်နှိပ်လျှင် /signup သို့ ရောက်သွားစေမည့် onClick ကို ထည့်ထားပါသည် */}
                        <button
                              className="btn-sign-up-offer"
                              onClick={() => navigate('/signup')}
                        >
                              Sign up
                        </button>
                  </div>
            </section>
      );
};

const StationeroPage = () => {
      const [searchQuery, setSearchQuery] = useState("");
      const location = useLocation();

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