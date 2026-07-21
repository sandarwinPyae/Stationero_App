import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext'; 
import { StationeroNavbar } from './StationeroPage'; 
import { AlignCenter, ArrowLeft } from 'lucide-react';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSubmitBtn, setHoveredSubmitBtn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);

  const getCartKey = () => {
    let userEmail = 'guest';
    try {
      const savedProfile = localStorage.getItem('stationero_logged_user');
      if (savedProfile && savedProfile !== "undefined") {
        const parsed = JSON.parse(savedProfile);
        userEmail = (parsed.email || parsed.user_email || parsed.customer_email || 'guest').trim();
      }
    } catch (e) { }
    return `stationero_cart_${userEmail}`;
  };

  useEffect(() => {
    const savedCart = localStorage.getItem(getCartKey());
    setCartItems(savedCart ? JSON.parse(savedCart) : []); // Data မရှိရင် Array အလွတ် [] သတ်မှတ်ပေးခြင်း
  }, []);

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
  };

  const saveQuantityEdit = (id) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, parseInt(editQuantity, 10) || 1) } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem(getCartKey(), JSON.stringify(updatedCart));
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
      localStorage.setItem(getCartKey(), JSON.stringify(remainingItems));
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleOrderCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutMessage('');
    const formattedCheckoutItems = cartItems.map((item, index) => ({
      product_id: item.id,
      no: index + 1,
      name: item.name,
      qty: item.quantity,
      price: item.price,
      discount: 0,
      amount: item.quantity * item.price
    }));


    localStorage.setItem('stationero_active_checkout', JSON.stringify(formattedCheckoutItems));
    localStorage.setItem('checkout_source', 'cart'); // OrderPage က Cart ကိုဖျက်ဖို့အတွက် ခွဲခြားမှတ်သားခြင်း
    navigate('/order');
  };

  return (
    <div style={styles.container}>
          <StationeroNavbar showSearch={false} />      
      <main style={isMobile ? styles.mainContentMobile : styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ ...styles.mainHeading, margin: 0 }}>Shopping Cart</h1>
          <button 
            type="button" 
            onMouseEnter={() => setHoveredSubmitBtn('add')}
            onMouseLeave={() => setHoveredSubmitBtn(false)}
            style={{
              ...styles.submitReturnBtn,
              ...(hoveredSubmitBtn === 'add' ? styles.submitReturnBtnHover : {}),
              margin: 0
            }}
            onClick={() => navigate('/product')}
          >
            Add Product
          </button>
        </div>
        {checkoutMessage && <div style={styles.successBanner}>{checkoutMessage}</div>}

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: '#666' }}>Your cart is empty.</p>
            <button onClick={() => navigate('/product')} style={styles.shopMoreBtn}>Go Add Products</button>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            {/* 👈 Headers are hidden on mobile screens to save massive space */}
            <div style={{ ...styles.tableHeaderRow, display: isMobile ? 'none' : 'flex' }}>
              <span style={{ ...styles.headerCell, width: '15%' }}>Product Image</span>
              <span style={{ ...styles.headerCell, width: '25%' }}>Product Name</span>
              <span style={{ ...styles.headerCell, width: '15%' }}>Unit Price</span>
              <span style={{ ...styles.headerCell, width: '15%', textAlign: 'center' }}>Quantity</span>
              <span style={{ ...styles.headerCell, width: '15%', textAlign: 'center' }}>Total Amount</span>
              <span style={{ ...styles.headerCell, width: '15%', textAlign: 'center' }}>Action</span>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} style={isMobile ? styles.tableBodyRowMobile : styles.tableBodyRow}>
                
                {isMobile ? (
                  <>
                    <div style={styles.mobileRowWrapper}>
                      <div style={styles.bodyCellMobileImg}><img src={item.image} alt={item.name} style={styles.productThumb} /></div>
                      <div style={styles.bodyCellMobileName}>{item.name}</div>
                      <div style={styles.bodyCellMobilePrice}>{(item.price || 0).toLocaleString()} MMK</div>
                      <div style={styles.bodyCellMobileQty}>
                        {editingId === item.id ? (
                          <input
                            type="number"
                            min="1" 
                            value={editQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) {
                                setEditQuantity(1);
                              } else {
                                setEditQuantity(val);
                              }
                            }}
                            style={styles.qtyInput}
                          />
                        ) : (
                          `x${item.quantity}`
                        )}
                      </div>
                      <div style={styles.bodyCellMobileTotal}>{((item.price || 0) * item.quantity).toLocaleString()} MMK</div>
                    </div>
                    
                    <div style={styles.bodyCellMobileActions}>
                      {editingId === item.id ? (
                        <button type="button" onClick={() => saveQuantityEdit(item.id)} style={styles.saveBtn}>Save</button>
                      ) : (
                        <button type="button" onClick={() => startEditing(item)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      <button type="button" onClick={() => openDeleteConfirmation(item)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f25278" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ width: '15%', display: 'flex', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={styles.productThumb} />
                    </span>
                    <span style={{ width: '25%', color: '#333', fontWeight: 600, paddingLeft: '5px', boxSizing: 'border-box' }}>
                      {item.name}
                    </span>
                    <span style={{ width: '15%', color: '#333', fontWeight: 600 }}>
                      {(item.price || 0).toLocaleString()} MMK
                    </span>
                    <span style={{ width: '15%', textAlign: 'center',fontWeight: 600 }}>
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min="1" 
                          value={editQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) {
                              setEditQuantity(1);
                            } else {
                              setEditQuantity(val);
                            }
                          }}
                          style={styles.qtyInput}
                        />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <span style={{ width: '15%', color: '#333', fontWeight: 600, textAlign: 'center' }}>
                      {((item.price || 0) * item.quantity).toLocaleString()} MMK
                    </span>
                    <span style={{ width: '15%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                      {editingId === item.id ? (
                        <button type="button" onClick={() => saveQuantityEdit(item.id)} style={styles.saveBtn}>Save</button>
                      ) : (
                        <button type="button" onClick={() => startEditing(item)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      <button type="button" onClick={() => openDeleteConfirmation(item)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f25278" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </span>
                  </>
                )}

              </div>
            ))}
            
            <div style={styles.footerActionRow}>
              <button
                type="submit"
                onClick={handleOrderCheckout}
                onMouseEnter={() => setHoveredSubmitBtn('order')}
                onMouseLeave={() => setHoveredSubmitBtn(false)}
                style={{
                  ...styles.submitReturnBtn,
                  ...(hoveredSubmitBtn === 'order' ? styles.submitReturnBtnHover : {})
                }}
              >
                Order
              </button>
            </div>
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
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' },
  logo: { fontFamily: "Azeret Mono, monospace", color: '#f25278', fontSize: '30px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0, textTransform: 'none' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '14px', transition: 'color 0.2s ease' },
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  backButtonWrapper: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 14px', borderRadius: '20px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, transition: 'all 0.2s ease' },
  mainContent: { padding: '16px 80px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  mainContentMobile: { padding: '12px min(15px, 3%)', maxWidth: '100%', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
  mainHeading: { fontFamily: "'Poppins', sans-serif", fontSize: '24px', color: '#111827', margin: '4px 0 20px 0', fontWeight: '600' },
  successBanner: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#eef9f0', color: '#1e7e34', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #c3e6cb', fontWeight: '500', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  tableWrapper: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' },
  tableHeaderRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', backgroundColor: '#e5e7eb', padding: '16px 20px', borderRadius: '12px', alignItems: 'center', textTransform: 'uppercase' },
  headerCell: { fontFamily: "'Poppins', sans-serif", fontSize: '15px', color: '#4b5563', fontWeight: '600' },
  tableBodyRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '12px', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', border: '1px solid #f3f4f6' },
  tableBodyRowMobile: { display: 'flex', flexDirection: 'column', backgroundColor: '#fff', padding: '12px 10px', borderRadius: '12px', alignItems: 'stretch', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', gap: '8px', width: '100%', boxSizing: 'border-box' },
  mobileRowWrapper: { display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: '6px' },
  bodyCell: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', color: '#1f2937', fontWeight: '500', textTransform: 'capitalize' },
  bodyCellMobileImg: { width: '15%', minWidth: '45px', display: 'flex', alignItems: 'center' },
  bodyCellMobileName: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#1f2937', fontWeight: '500', width: '30%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' },
  bodyCellMobilePrice: { fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#4b5563', width: '23%', textAlign: 'right', whiteSpace: 'nowrap' },
  bodyCellMobileQty: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#1f2937', width: '12%', textAlign: 'center' },
  bodyCellMobileTotal: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', color: '#f25278', fontWeight: '600', width: '20%', textAlign: 'right', whiteSpace: 'nowrap' },
  bodyCellMobileActions: { display: 'flex', justifyContent: 'flex-end', gap: '20px', width: '100%', paddingTop: '6px', borderTop: '1px solid #f3f4f6', marginTop: '2px', paddingRight: '5px' },
  productThumb: { width: '45px', height: '42px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #f3f4f6' },
  actionIconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', outline: 'none' },
  qtyInput: { fontFamily: "'Poppins', sans-serif", width: '45px', padding: '4px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'center' },
  saveBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  footerActionRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '30px', width: '100%' },
  orderSubmitBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none', marginRight: '10px' },
  shopMoreBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', fontSize: '14px', fontWeight: '500' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 },
  modalContentBox: { backgroundColor: '#fff', padding: '30px 40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '90%' },
  modalHeading: { fontFamily: "'Poppins', sans-serif", margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937', fontWeight: '600' },
  modalActionsRow: { display: 'flex', justifyContent: 'center', gap: '20px' },
  submitReturnBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  submitReturnBtnHover: { backgroundColor: '#e04167' },
  cancelBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  confirmDeleteBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};


export default ShoppingCart;