import React, { useState } from 'react';

const ProductDetail = ({ onNavigate }) => {
  const [quantity, setQuantity] = useState(1);
  const [hoveredLink, setHoveredLink] = useState(null); // Track mouse placement

  const navItems = [
    { label: 'Home', action: 'product' },
    { label: 'About Us', action: 'product' },
    { label: 'Product', action: 'product', isProduct: true },
    { label: 'Shopping Cart', action: 'cart' },
    { label: 'Order', action: 'order' },
    { label: 'Returns', action: 'returns' },
    { label: 'History', action: 'history' },
    { label: 'Profile', action: 'profile' },
    { label: 'Logout', action: 'login' }
  ];

  const handleQuantityChange = (type) => {
    if (type === 'increment') setQuantity(prev => prev + 1);
    else if (type === 'decrement' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAction = async (actionType) => {
    if (actionType === 'ADD_TO_CART') {
      const currentCart = localStorage.getItem('stationero_cart');
      let cartArray = currentCart ? JSON.parse(currentCart) : [];
      const newItem = { id: 101, name: 'Gel Pens', price: 3300, quantity: quantity, image: 'https://unsplash.com' };
      const existingItemIndex = cartArray.findIndex(item => item.id === newItem.id);
      if (existingItemIndex > -1) {
        cartArray[existingItemIndex].quantity += quantity;
      } else {
        cartArray.push(newItem);
      }
      localStorage.setItem('stationero_cart', JSON.stringify(cartArray));
      alert('Added to cart successfully!');
      return;
    }

    // --- DYNAMIC "BUY NOW" FLOW LINKED TO ORDER PAGE ---
    if (actionType === 'BUY_NOW') {
      const singlePurchaseItem = [{
        no: 1,
        name: 'Gel Pens',
        qty: quantity,
        price: 3300,
        discount: 0, 
        amount: quantity * 3300
      }];
      
      localStorage.setItem('stationero_active_checkout', JSON.stringify(singlePurchaseItem));
      onNavigate('order');
      return;
    }

    // Optional API tracking loop handled safely inside the same function block
    try {
      const response = await fetch('http://localhost:8000/api/product/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, product_id: 101, quantity: quantity, price: 3300 }),
      });
      const data = await response.json();
      if (response.ok) console.log(`Processed: ${data.total_price} MMK`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          {navItems.map((item, index) => (
            <span
              key={index}
              onClick={() => onNavigate(item.action)}
              onMouseEnter={() => setHoveredLink(index)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                ...styles.link,
                ...(item.isProduct ? styles.activeLink : {}),
                ...(hoveredLink === index ? { color: '#f25278' } : {})
              }}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.imageColumn}>
          <img src="https://unsplash.com" alt="Gel Pens" style={styles.productImage} />
        </div>
        <div style={styles.detailsColumn}>
          <h1 style={styles.title}>Gel Pens</h1>
          <h2 style={styles.price}>3,300 MMK</h2>
          <h3 style={styles.sectionTitle}>Description</h3>
          <p style={styles.description}>Inspired by the creamy hues of ice cream flavors, this collection combines a minimalist matte design with ultra-smooth writing.</p>
          <div style={styles.actionBox}>
            <div style={styles.quantityLabel}>Quantity</div>
            <div style={styles.quantitySelectorRow}>
              <button type="button" onClick={() => handleQuantityChange('decrement')} style={styles.qtyBtn}>-</button>
              <div style={styles.qtyDisplay}>{quantity}</div>
              <button type="button" onClick={() => handleQuantityChange('increment')} style={styles.qtyBtn}>+</button>
            </div>
            
            <button 
              type="button" 
              onClick={() => handleAction('BUY_NOW')} 
              onMouseEnter={() => setHoveredLink('buyNow')}
              onMouseLeave={() => setHoveredLink(null)}
              style={{...styles.buyNowBtn, ...(hoveredLink === 'buyNow' ? { backgroundColor: '#d93a5f' } : {})}}
            >
              Buy Now
            </button>

            <div style={styles.secondaryActionsRow}>
              <button 
                type="button" 
                onClick={() => handleAction('ADD_TO_CART')} 
                onMouseEnter={() => setHoveredLink('addToCart')}
                onMouseLeave={() => setHoveredLink(null)}
                style={{...styles.cartBtn, ...(hoveredLink === 'addToCart' ? { backgroundColor: '#ffeef2', color: '#d93a5f' } : {})}}
              >
                + Add To Cart
              </button>
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
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  mainContent: { display: 'flex', padding: '50px', gap: '50px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center' },
  imageColumn: { flex: 1, display: 'flex', justifyContent: 'center' },
  productImage: { width: '100%', maxWidth: '450px', borderRadius: '10px', objectFit: 'cover', height: '450px' },
  detailsColumn: { flex: 1, display: 'flex', flexDirection: 'column' },
  title: { fontSize: '32px', color: '#333', margin: '0 0 20px 0' },
  price: { fontSize: '24px', color: '#f25278', margin: '0 0 20px 0', fontWeight: 'bold' },
  sectionTitle: { fontSize: '16px', color: '#333', margin: '0 0 10px 0' },
  description: { fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '0 0 30px 0' },
  actionBox: { border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' },
  quantityLabel: { fontSize: '14px', fontWeight: 'bold', color: '#333' },
  quantitySelectorRow: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px', width: 'fit-content', backgroundColor: '#fff' },
  qtyBtn: { background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' },
  qtyDisplay: { padding: '0 20px', fontSize: '16px', fontWeight: 'bold' },
  buyNowBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' },
  secondaryActionsRow: { display: 'flex', gap: '15px' },
  cartBtn: { flex: 1, backgroundColor: 'white', color: '#f25278', border: '1px solid #f25278', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default ProductDetail;
