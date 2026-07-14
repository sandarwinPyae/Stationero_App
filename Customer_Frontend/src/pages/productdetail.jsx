import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios ကို import လုပ်ပါ
import { AuthContext } from '../context/AuthContext';
import { StationeroNavbar } from './StationeroPage'; 

const ProductDetail = () => {
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

    if (actionType === 'BUY_NOW') {
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
      navigate('/order');
      return;
    }

    if (actionType === 'ADD_TO_CART') {
      let userEmail = 'guest';
      try {
        const savedProfile = localStorage.getItem('stationero_logged_user');
        if (savedProfile && savedProfile !== "undefined") {
          const parsed = JSON.parse(savedProfile);
          userEmail = (parsed.email || parsed.user_email || parsed.customer_email || 'guest').trim();
        }
      } catch (e) { }

      const cartKey = `stationero_cart_${userEmail}`;
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
      <button 
            type="button"
            onClick={() => navigate('/product')} 
            onMouseEnter={() => setIsBackHovered(true)}  
            onMouseLeave={() => setIsBackHovered(false)}
            style={{
              background: 'none',
              marginLeft: '30px',
              border: 'none',
              cursor: 'pointer',
              color: isBackHovered ? '#f25278' : '#555555', 
              fontSize: '15px',
              fontWeight: 200,
              fontFamily: "'Poppins', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              outline: 'none',
              transition: 'color 0.2s ease, transform 0.2s ease' // 👈 စာသားအရောင် ပြောင်းလဲမှုကို အလွန်နူးညံ့ချောမွေ့သွားစေရန် ဖြစ်သည်
            }}
          >
            <span>←</span> <span>Back</span>
          </button>
      <main style={styles.mainContent}>
        <div style={styles.imageColumn}>
          <img src={`http://localhost:8000/${product.product_img_url}`} alt={product.product_name} style={styles.productImage} />
        </div>

        <div style={styles.detailsColumn}>
          <h1 style={styles.title}>{product.product_name}</h1>
          <h2 style={styles.price}>{product.display_price}</h2>

          <h4 style={styles.sectionTitle}>Description</h4>
          <p style={styles.description}>
            {product.description || "Bring a touch of soft, aesthetic charm to your daily notes, journaling, or sketching."}
          </p>

          <div style={styles.actionBox}>
            <span style={styles.quantityLabel}>Quantity</span>
            <div style={styles.quantitySelectorRow}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>-</button>
              <span style={styles.qtyDisplay}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>+</button>
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
  container: { fontFamily: "Poppins, sans-serif", backgroundColor: '#ffffff', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #f0f0f0', position: 'relative' },
  logo: { fontFamily: "Azeret Mono, monospace", color: '#f25278', fontSize: '30px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0, textTransform: 'none' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '15px', transition: 'color 0.2s ease' },
  mainContent: { display: 'flex', padding: '50px', gap: '50px', maxWidth: '1000px', margin: '0 auto', alignItems: 'flex-start' },
  imageColumn: { flex: 1, display: 'flex', justifyContent: 'center' },
  productImage: { width: '100%', maxWidth: '400px', borderRadius: '10px', objectFit: 'cover' },
  detailsColumn: { flex: 1, display: 'flex', flexDirection: 'column' },
  backButtonWrapper: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 14px', borderRadius: '20px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, transition: 'all 0.2s ease' },
  title: { fontSize: '25px', color: '#333', margin: '0 0 15px 0', fontWeight: 400, fontFamily: "Poppins, sans-serif" },
  price: { fontSize: '20px', color: '#f25278', margin: '0 0 20px 0', fontWeight: 300, fontFamily: "Poppins, sans-serif" },
  sectionTitle: { fontSize: '16px', color: '#333', margin: '0 0 10px 0', fontWeight: 400, fontFamily: "Poppins, sans-serif" },
  description: { fontSize: '15px', color: '#666', lineHeight: '1.6', margin: '0 0 30px 0', fontWeight: '400', fontFamily: "Poppins, sans-serif" },
  actionBox: { border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' },
  quantityLabel: { fontSize: '15px', fontWeight: 400, color: '#333', fontFamily: "Poppins, sans-serif" },
  quantitySelectorRow: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', width: 'fit-content', backgroundColor: '#fff' },
  qtyBtn: { background: 'none', border: 'none', padding: '10px 15px', cursor: 'pointer', fontSize: '18px', fontWeight: 400 },
  qtyDisplay: { padding: '0 20px', fontSize: '16px', fontWeight: 400 },
  buyNowBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '15px', borderRadius: '5px', fontSize: '16px', fontWeight: 400, cursor: 'pointer', textAlign: 'center', transition: 'opacity 0.2s ease', fontFamily: "Poppins, sans-serif" },
  secondaryActionsRow: { display: 'flex', gap: '15px' },
  cartBtn: { flex: 1, backgroundColor: 'white', color: '#f25278', border: '1px solid #f25278', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: '400', fontFamily: "Poppins, sans-serif" }
};

export default ProductDetail;
