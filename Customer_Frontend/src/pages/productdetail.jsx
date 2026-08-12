import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios ကို import လုပ်ပါ
import { AuthContext } from '../context/AuthContext';
import { StationeroNavbar } from './StationeroPage'; 

const ProductDetail = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [isBackHovered, setIsBackHovered] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // Theingi Change 
  useEffect(() => {

    const hasSession =
      localStorage.getItem("stationero_logged_user");


    if (!isLoggedIn && !hasSession) {

      navigate("/login");
      return;

    }


    fetchProductDetail();


  }, [id]);

  const fetchProductDetail = async () => {
    try {
      // 🌟 fetch အစား axios.get ကို အသုံးပြုထားသည်
      const response = await axios.get(`http://localhost:8000/api/products/${id}`);
      setProduct(response.data); // response.json() မလိုတော့ပါ
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

    const handleAction = (actionType) => {
    if (!product) return;

    // 🌟 ယူဆာရဲ့ Email ကို Dynamic မှန်ကန်စွာ ဆွဲထုတ်ယူခြင်း (Cart Key မလွဲစေရန်)
    let userEmail = 'guest';
    try {
      const savedProfile = localStorage.getItem('stationero_logged_user');
      if (savedProfile && savedProfile !== "undefined") {
        const parsed = JSON.parse(savedProfile);
        userEmail = (parsed.email || parsed.user_email || parsed.customer_email || 'guest').trim();
      }
    } catch (e) { }
    const cartKey = `stationero_cart_${userEmail}`;

    // ==========================================================================
    // 🌟 ၁။ BUY_NOW FUNCTIONS - Cart ထဲက ပစ္စည်းဟောင်းများကို လုံးဝ မဖျက်ဆီးစေရန် ပြုပြင်ခြင်း
    // ==========================================================================
    if (actionType === 'BUY_NOW') {
      // ကနဦးအဆင့် - Cart ထဲမှာ ရှိပြီးသား ပစ္စည်းဟောင်းများကို အရင်ဆွဲထုတ်ပါသည်
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

      // လက်ရှိ Buy Now နှိပ်လိုက်သော ပစ္စည်းသည် Cart ထဲတွင် ရှိနေပြီးသားလား စစ်ဆေးခြင်း
      const existingIndex = cartItems.findIndex(i => i.id === newItem.id);
      if (existingIndex > -1) {
        // ရှိပြီးသားဆိုလျှင် အရေအတွက်ကိုသာ ပေါင်းထည့်ပေးပြီး Cart ဟောင်းကို ဆက်ထိန်းထားပါသည်
        cartItems[existingIndex].quantity += quantity;
      } else {
        // မရှိသေးလျှင် Cart ထဲသို့ ဤပစ္စည်းအသစ်ကိုပါ အောက်ခြေတွင် ထည့်သွင်းပေးပါသည်
        cartItems.push(newItem);
      }

      // 🌟 အရေးကြီးချက် - Cart တစ်ခုလုံးကို ဖျက်မချဘဲ ပစ္စည်းအသစ်ပါဝင်သော Cart ကို ဒိုင်ခံ သိမ်းဆည်းခိုင်းလိုက်ခြင်းဖြစ်သည်
      localStorage.setItem(cartKey, JSON.stringify(cartItems));

      // Order Checkout ဒေတာပြင်ဆင်ခြင်း
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
      
      // 🌟 SAFETY OVERRIDE: Cart ရှင်းပစ်မည့် logic ထဲမဝင်စေရန် source အား 'cart_checkout' အဖြစ် ပြောင်းလဲသတ်မှတ်ခြင်း
      localStorage.setItem('checkout_source', 'cart_checkout'); 
      
      navigate('/order');
      return;
    }

    // ==========================================================================
    // 🌟 ၂။ ADD_TO_CART FUNCTIONS (မူရင်းအတိုင်း သန့်ရှင်းစွာ ဆက်လက်ထားရှိပါသည်)
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

return (
    <div style={styles.container}>
      <StationeroNavbar showSearch={false} />
      
      <div style={{ width: '100%', padding: '0 min(50px, 4%)', boxSizing: 'border-box', marginTop: '10px' }}>
        <button 
          type="button"
          onClick={() => navigate('/product')} 
          onMouseEnter={() => setIsBackHovered(true)}  
          onMouseLeave={() => setIsBackHovered(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isBackHovered ? '#f25278' : '#555555', 
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 4px',
            outline: 'none',
            textTransform: 'capitalize',
            transition: 'color 0.2s ease, transform 0.2s ease'
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
          {/* 👈 🎯 FIXED: Product Name and Price are bound together horizontally with space-between */}
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
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px min(50px, 4%)', borderBottom: '1px solid #f0f0f0', position: 'relative', width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff' },
  logo: { fontFamily: "Azeret Mono, monospace", color: '#f25278', fontSize: '30px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0, textTransform: 'none' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  link: { cursor: 'pointer', color: '#333', fontSize: '15px', transition: 'color 0.2s ease' },
  mainContent: { display: 'flex', padding: '16px 50px 50px 50px', gap: '40px', maxWidth: '1000px', margin: '0 auto', alignItems: 'flex-start' },
  mainContentMobile: { display: 'flex', flexDirection: 'column', padding: '50px min(20px, 4%)', gap: '16px', maxWidth: '1000px', margin: '0 auto', alignItems: 'center', width: '100%', boxSizing: 'border-box' },
  imageColumn: { display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' },
  productImage: { width: '100%', maxWidth: '400px', height: 'auto', borderRadius: '12px', objectFit: 'cover', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  productImageMobile: { width: 'auto', height: 'auto', maxHeight: '210px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' },
  detailsColumn: { display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box', textAlign: 'left' },
  backButtonWrapper: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 10, transition: 'all 0.2s ease' },
  titlePriceRowMobile: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', boxSizing: 'border-box', marginBottom: '8px', gap: '10px' },
  title: { fontFamily: "'Poppins', sans-serif", fontSize: '26px', color: '#111827', margin: '0 0 16px 0', fontWeight: '700', letterSpacing: '-0.5px' },
  titleMobile: { fontFamily: "'Poppins', sans-serif", fontSize: '18px', color: '#111827', margin: 0, fontWeight: '600', flex: 1 },
  price: { fontFamily: "'Poppins', sans-serif", fontSize: '20px', color: '#f25278', margin: '0 0 15px 0', fontWeight: 600 },
  priceMobile: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', color: '#f25278', margin: 0, fontWeight: '600', whiteSpace: 'nowrap' },
  sectionTitle: { fontFamily: "'Poppins', sans-serif", fontSize: '18px', color: '#1f2937', margin: '0 0 8px 0', fontWeight: '700' },
  sectionTitleMobile: { fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#1f2937', margin: '0 0 2px 0', fontWeight: '600' },
  description: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', color: '#4b5563', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' },
  descriptionMobile: { fontFamily: "'Poppins', sans-serif", fontSize: '12px', color: '#4b5563', lineHeight: '1.4', margin: '0 0 8px 0', fontWeight: '400' },
  actionBox: { border: '1px solid #e5e7eb', padding: '20px min(20px, 4%)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' },
  actionBoxMobile: { border: '1px solid #f3f4f6', padding: '10px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box', backgroundColor: '#ffffff' },
  quantityLabel: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: '#4b5563', margin: 0 },
  quantityRowMobile: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', marginBottom: '2px' },
  quantitySelectorRow: { display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%', maxWidth: '110px', backgroundColor: '#fff', boxSizing: 'border-box' },
  qtyBtn: { background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', flex: 1 },
  qtyDisplay: { padding: '0 6px', fontSize: '16px', fontWeight: '600', textAlign: 'center', flex: 1 },
  buyNowBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', transition: 'opacity 0.2s ease', width: '100%', boxSizing: 'border-box' },
  secondaryActionsRow: { display: 'flex', gap: '15px', width: '100%', boxSizing: 'border-box' },
  cartBtn: { fontFamily: "'Poppins', sans-serif", flex: 1, backgroundColor: 'white', color: '#f25278', border: '1px solid #f25278', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', boxSizing: 'border-box', fontSize: '16px' }
};

export default ProductDetail;
