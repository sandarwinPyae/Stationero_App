import React, { useState, useEffect, useContext } from 'react'; // 🌟 FIXED: useContext အား Import တွင် ဖြည့်စွက်ထားပါသည်
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { StationeroNavbar } from './StationeroPage'; 

const ProductDetail = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🌟 🌟 🌟 FIXED CORE LINE: userProfile အား AuthContext မှ အမိအရ ဆွဲထုတ်ယူခြင်း 🌟 🌟 🌟
  const { isLoggedIn, userProfile } = useContext(AuthContext); 
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBackHovered, setIsBackHovered] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const hasSession = localStorage.getItem("stationero_logged_user");
    if (!isLoggedIn && !hasSession) {
      navigate("/login");
      return;
    }
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/products/${id}`);
      setProduct(response.data); 
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleAction = (actionType) => {
    if (!product) return;

    let userEmail = 'guest';
    try {
      const savedProfile = localStorage.getItem('stationero_logged_user');
      if (savedProfile && savedProfile !== "undefined") {
        const parsedLocal = JSON.parse(savedProfile);
        
        // 🌟 FIXED CART KEY: userProfile ရော parsedLocal ပါ အဆင့်ဆင့် လုံခြုံစွာ ညှိနှိုင်းစစ်ဆေးခြင်း
        const activeEmail = (
          userProfile?.email || 
          userProfile?.customer_email || 
          parsedLocal?.email || 
          parsedLocal?.customer_email || 
          parsedLocal?.user_email ||
          ""
        ).trim();

        if (activeEmail) {
          userEmail = activeEmail;
        }
      }
    } catch (e) {
      console.error("Cart Key path alignment synchronization failure: ", e);
    }
    const cartKey = `stationero_cart_${userEmail}`;

    // ==========================================================================
    // 🌟 ၁။ BUY_NOW FUNCTIONS - TARGET BOUNDARY RESOLVED
    // ==========================================================================
    if (actionType === 'BUY_NOW') {
      const savedCart = localStorage.getItem(cartKey);
      let cartItems = savedCart ? JSON.parse(savedCart) : [];

      const checkoutData = [
        {
          product_id: product.product_id,
          name: product.product_name,
          qty: quantity,
          price: product.selling_price,
          discount: 0,
          amount: quantity * product.selling_price
        }
      ];
      
      localStorage.setItem('stationero_active_checkout', JSON.stringify(checkoutData));
      localStorage.setItem('checkout_source', 'buy_now'); 
      
      navigate('/order', { state: { items: checkoutData, source: 'buy_now' } });
      return;
    }

    // ==========================================================================
    // 🌟 ၂။ ADD_TO_CART FUNCTIONS (မူရင်းအတိုင်း သန့်ရှင်းစွာ ထားရှိပါသည်)
    // ==========================================================================
    if (actionType === 'ADD_TO_CART') {
      const savedCart = localStorage.getItem(cartKey);
      let cartItems = savedCart ? JSON.parse(savedCart) : [];

      const newItem = {
        id: product.product_id,
        product_id: product.product_id,
        name: product.product_name,
        price: product.selling_price,
        quantity: quantity,
        image: `http://localhost:8000/${product.product_img_url}`
      };

      const existingIndex = cartItems.findIndex(i => i.id === newItem.id);
      if (existingIndex > -1) {
        cartItems[existingIndex].quantity += quantity;
      } else {
        cartItems.push(newItem);
      }

      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      navigate('/cart');
      return;
    }
  };

  if (!product) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  // 🌟 သင့်ရဲ့ မူရင်း HTML Render Return Templates နှင့် Styles Layout constraints များကို အောက်ခြေတွင် ဆက်လက်ထိန်းသိမ်းထားပါသည်
  return (
    <div style={styles.container}>
      <StationeroNavbar showSearch={false} />
      
      <div style={{ width: '100%', padding: '10px min(50px, 4%)', boxSizing: 'border-box', marginTop: '10px' }}>
        <button 
          type="button"
          onClick={() => navigate('/product')} 
          onMouseEnter={() => setIsBackHovered(true)}  
          onMouseLeave={() => setIsBackHovered(false)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: isBackHovered ? '#f25278' : '#555555', 
            fontSize: '16px', fontWeight: 600, fontFamily: "'Poppins', sans-serif",
            display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 4px', outline: 'none',
            textTransform: 'capitalize', transition: 'color 0.2s ease, transform 0.2s ease'
          }}
        >
          <span>←</span> <span>Back</span>
        </button>
      </div>

      <main style={isMobile ? styles.mainContentMobile : styles.mainContent}>
        <div style={styles.imageColumn}>
          <img 
            src={`http://localhost:8000/${product.product_img_url}`} 
            alt={product.product_name} 
            style={isMobile ? styles.productImageMobile : styles.productImage} 
          />
        </div>

        <div style={styles.detailsColumn}>
          <div style={isMobile ? styles.titlePriceRowMobile : { display: 'flex', flexDirection: 'column' }}>
            <h1 style={isMobile ? styles.titleMobile : styles.title}>{product.product_name}</h1>
            <h2 style={isMobile ? styles.priceMobile : styles.price}>{product.display_price}</h2>
          </div>

          <h4 style={isMobile ? styles.sectionTitleMobile : styles.sectionTitle}>Description</h4>
          <p style={isMobile ? styles.descriptionMobile : styles.description}>
            {product.description || "Bring a touch of soft, aesthetic charm to your daily notes, journaling, or sketching."}
          </p>

          <div style={isMobile ? styles.actionBoxMobile : styles.actionBox}>
            <div style={isMobile ? styles.quantityRowMobile : { display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={styles.quantityLabel}>Quantity</span>
              <div style={styles.quantitySelectorRow}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>-</button>
                <span style={styles.qtyDisplay}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>+</button>
              </div>
            </div>

            <button onClick={() => handleAction('BUY_NOW')} style={styles.buyNowBtn}>Buy Now</button>

            <div style={styles.secondaryActionsRow}>
              <button onClick={() => handleAction('ADD_TO_CART')} style={styles.cartBtn}>🛒 Add To Cart</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' },
  mainContent: { display: 'flex', flex: 1, padding: '0px min(50px, 4%)', gap: '40px', boxSizing: 'border-box', alignItems: 'start' },
  mainContentMobile: { display: 'flex', flexDirection: 'column', padding: '20px min(20px, 4%)', gap: '20px', boxSizing: 'border-box' },
  imageColumn: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px', minHeight: '350px', maxHeight: '480px', boxSizing: 'border-box', border: '1px solid #f0f0f0' },
  detailsColumn: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'start' },
  productImage: { width: '100%', height: '100%', maxHeight: '400px', borderRadius: '8px', objectFit: 'contain', transition: 'transform 0.3s ease' },
  productImageMobile: { width: '100%', maxHeight: '28px', borderRadius: '8px', objectFit: 'contain' },
  title: { fontSize: '28px', fontWeight: '700', color: '#333333', margin: '0 0 10px 0', fontFamily: "'Poppins', sans-serif" },
  titleMobile: { fontSize: '22px', fontWeight: '700', color: '#333333', margin: '0 0 5px 0' },
  price: { fontSize: '24px', fontWeight: '600', color: '#f25278', margin: '0 0 20px 0', fontFamily: "'Poppins', sans-serif" },
  priceMobile: { fontSize: '20px', fontWeight: '600', color: '#f25278', margin: '0 0 15px 0' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#555555', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sectionTitleMobile: { fontSize: '14px', fontWeight: '600', color: '#555555', margin: '0 0 5px 0' },
  description: { fontSize: '15px', color: '#666666', lineHeight: '1.7', margin: '0 0 30px 0', textAlign: 'justify' },
  descriptionMobile: { fontSize: '13px', color: '#666666', lineHeight: '1.5', margin: '0 0 20px 0' },
  actionBox: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '350px', width: '100%' },
  actionBoxMobile: { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' },
  quantityLabel: { fontSize: '14px', color: '#777777', fontWeight: '500' },
  quantitySelectorRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  qtyBtn: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s ease' },
  qtyDisplay: { fontSize: '16px', fontWeight: '600', minWidth: '20px', textAlign: 'center' },
  buyNowBtn: { width: '100%', padding: '14px', backgroundColor: '#f25278', color: '#ffffff', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(242, 82, 120, 0.2)' },
  secondaryActionsRow: { display: 'flex', gap: '15px' },
  cartBtn: { flex: 1, padding: '12px', backgroundColor: '#ffffff', color: '#f25278', border: '2px solid #f25278', borderRadius: '25px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }
};


export default ProductDetail;
