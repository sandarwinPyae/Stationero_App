import React, { useState, useEffect } from 'react';

const ShoppingCart = ({ onNavigate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [hoveredLink, setHoveredLink] = useState(null); // Track mouse placement
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);

  const navItems = [
    { label: 'Home', action: 'product' },
    { label: 'About Us', action: 'product' },
    { label: 'Product', action: 'product' },
    { label: 'Shopping Cart', action: 'cart', isCart: true },
    { label: 'Order', action: 'order' },
    { label: 'Returns', action: 'returns' },
    { label: 'History', action: 'history' },
    { label: 'Profile', action: 'profile' },
    { label: 'Logout', action: 'login' }
  ];

  useEffect(() => {
    const savedCart = localStorage.getItem('stationero_cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
  };

  const saveQuantityEdit = (id) => {
    const updatedCart = cartItems.map(item => item.id === id ? { ...item, quantity: Math.max(1, parseInt(editQuantity, 10) || 1) } : item);
    setCartItems(updatedCart);
    localStorage.setItem('stationero_cart', JSON.stringify(updatedCart));
    setEditingId(null);
  };

  const openDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const remainingItems = cartItems.filter(item => item.id !== itemToDelete.id);
      setCartItems(remainingItems);
      localStorage.setItem('stationero_cart', JSON.stringify(remainingItems));
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleOrderCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutMessage('');
    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const formattedCheckoutItems = cartItems.map((item, index) => ({
      no: index + 1,
      name: item.name,
      qty: item.quantity,
      price: item.price,
      discount: 0, // Apply business discount rule structures here if needed
      amount: item.quantity * item.price
    }));

    // Pass the formatted collection down to the active invoice viewport memory key
    localStorage.setItem('stationero_active_checkout', JSON.stringify(formattedCheckoutItems));
    onNavigate('order');


    try {
      const response = await fetch('http://localhost:8000/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: totalQty, price: totalCost }),
      });
      const data = await response.json();
    } catch (error) {
      setCheckoutMessage('Bridge connection failure.');
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
                ...(item.isCart ? styles.activeLink : {}),
                ...(hoveredLink === index ? { color: '#f25278' } : {}) // Dynamic hover highlight color
              }}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </header>

      <main style={styles.mainContent}>
        <h1 style={styles.mainHeading}>Shopping Cart</h1>
        {checkoutMessage && <div style={styles.successBanner}>{checkoutMessage}</div>}

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: '#666' }}>Your cart is empty.</p>
            <button onClick={() => onNavigate('product')} style={styles.shopMoreBtn}>Go Add Products</button>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <div style={styles.tableHeaderRow}>
              <span style={{...styles.headerCell, width: '15%'}}>Product Image</span>
              <span style={{...styles.headerCell, width: '25%'}}>Product Name</span>
              <span style={{...styles.headerCell, width: '15%'}}>Unit Price</span>
              <span style={{...styles.headerCell, width: '15%'}}>Quantity</span>
              <span style={{...styles.headerCell, width: '15%'}}>Total Amount</span>
              <span style={{...styles.headerCell, width: '15%', textAlign: 'center'}}>Action</span>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} style={styles.tableBodyRow}>
                <div style={{...styles.bodyCell, width: '15%'}}><img src={item.image} alt={item.name} style={styles.productThumb} /></div>
                <div onClick={() => onNavigate('product')} style={{...styles.bodyCell, width: '25%', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline'}}>{item.name}</div>
                <div style={{...styles.bodyCell, width: '15%'}}>{item.price.toLocaleString()} MMK</div>
                <div style={{...styles.bodyCell, width: '15%'}}>
                  {editingId === item.id ? <input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} style={styles.qtyInput} /> : item.quantity}
                </div>
                <div style={{...styles.bodyCell, width: '15%', fontWeight: 'bold'}}>{(item.price * item.quantity).toLocaleString()} MMK</div>
                <div style={{...styles.bodyCell, width: '15%', display: 'flex', justifyContent: 'center', gap: '20px'}}>
                  {editingId === item.id ? <button type="button" onClick={() => saveQuantityEdit(item.id)} style={styles.saveBtn}>Save</button> : <button type="button" onClick={() => startEditing(item)} style={styles.actionIconBtn}>✏️</button>}
                  <button type="button" onClick={() => openDeleteConfirmation(item)} style={styles.actionIconBtn}>🗑️</button>
                </div>
              </div>
            ))}
            <div style={styles.footerActionRow}><button type="button" onClick={handleOrderCheckout} style={styles.orderSubmitBtn}>Order</button></div>
          </div>
        )}
      </main>

      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentBox}>
            <h3 style={styles.modalHeading}>Are you sure to delete?</h3>
            <div style={styles.modalActionsRow}>
              <button type="button" onClick={() => setShowDeleteModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="button" onClick={confirmDelete} style={styles.confirmDeleteBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '14px', transition: 'color 0.2s ease' },
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  mainContent: { padding: '40px 80px', maxWidth: '1400px', margin: '0 auto' },
  mainHeading: { fontSize: '28px', color: '#111', margin: '0 0 30px 0', fontWeight: 'bold' },
  successBanner: { backgroundColor: '#eef9f0', color: '#1e7e34', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #c3e6cb', fontWeight: 'bold', textAlign: 'center' },
  tableWrapper: { display: 'flex', flexDirection: 'column', gap: '15px' },
  tableHeaderRow: { display: 'flex', backgroundColor: '#e8e8e8', padding: '15px 20px', borderRadius: '30px', alignItems: 'center' },
  headerCell: { fontSize: '14px', color: '#444', fontWeight: 'bold' },
  tableBodyRow: { display: 'flex', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '10px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.03)' },
  bodyCell: { fontSize: '14px', color: '#333' },
  productThumb: { width: '55px', height: '55px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' },
  actionIconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', outline: 'none' },
  qtyInput: { width: '60px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', textAlign: 'center' },
  saveBtn: { backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  footerActionRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '30px' },
  orderSubmitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '18px 60px', borderRadius: '40px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(242, 82, 120, 0.3)' },
  shopMoreBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '20px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContentBox: { backgroundColor: '#fff', padding: '30px 40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: '400px', width: '90%' },
  modalHeading: { margin: '0 0 20px 0', fontSize: '20px', color: '#111', fontWeight: 'bold' },
  modalActionsRow: { display: 'flex', justifyContent: 'center', gap: '20px' },
  cancelBtn: { backgroundColor: '#e0e0e0', color: '#333', border: 'none', padding: '10px 25px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  confirmDeleteBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer' },
};
export default ShoppingCart;