import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios ကို import လုပ်ပါ
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      fetchProductDetail();
    }
  }, [isLoggedIn, navigate]);

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
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          <span onClick={() => navigate('/')} style={styles.link}>Home</span>
          <span onClick={() => navigate('/cart')} style={styles.link}>Shopping Cart</span>
          <span onClick={() => { localStorage.removeItem('stationero_logged_user'); navigate('/login'); }} style={styles.link}>Logout</span>
        </nav>
      </header>

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
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', borderBottom: '1px solid #f0f0f0' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '14px', transition: 'color 0.2s ease' },
  mainContent: { display: 'flex', padding: '50px', gap: '50px', maxWidth: '1000px', margin: '0 auto', alignItems: 'flex-start' },
  imageColumn: { flex: 1, display: 'flex', justifyContent: 'center' },
  productImage: { width: '100%', maxWidth: '400px', borderRadius: '10px', objectFit: 'cover' },
  detailsColumn: { flex: 1, display: 'flex', flexDirection: 'column' },
  title: { fontSize: '28px', color: '#333', margin: '0 0 15px 0' },
  price: { fontSize: '22px', color: '#f25278', margin: '0 0 20px 0', fontWeight: 'bold' },
  sectionTitle: { fontSize: '16px', color: '#333', margin: '0 0 10px 0', fontWeight: 'bold' },
  description: { fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '0 0 30px 0' },
  actionBox: { border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' },
  quantityLabel: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  quantitySelectorRow: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', width: 'fit-content', backgroundColor: '#fff' },
  qtyBtn: { background: 'none', border: 'none', padding: '10px 15px', cursor: 'pointer', fontSize: '18px' },
  qtyDisplay: { padding: '0 20px', fontSize: '16px', fontWeight: 'bold' },
  buyNowBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '15px', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' },
  secondaryActionsRow: { display: 'flex', gap: '15px' },
  cartBtn: { flex: 1, backgroundColor: 'white', color: '#f25278', border: '1px solid #f25278', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ProductDetail;