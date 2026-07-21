import React, { useState, useEffect, useContext } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext'; 
import { StationeroNavbar } from './StationeroPage'; 

const OrderPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const location = useLocation();
  const { userProfile } = useContext(AuthContext); 
  const [isBackHovered, setIsBackHovered] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [pricingSummary, setPricingSummary] = useState({ total: 0, discount: 0, net: 0 });
  const [saleDateString, setSaleDateString] = useState('');
  const [returnId, setReturnId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash Down');
  const [customerProfile, setCustomerProfile] = useState({
    name: 'Customer',
    phone: '-',
    email: '',
    address: '-'
  });

  const [isFirstOrder, setIsFirstOrder] = useState(false);

  /*const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Product', path: '/product' },
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'Order', path: '/order', isOrderPage: true },
    { label: 'Returns', path: '/returns' },
    { label: 'History', path: '/history' },
    { label: 'Profile', path: '/profile' }
  ];*/

  const calculate = (items, checkFirstOrderFlag = isFirstOrder) => {
    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.amount || item.price * item.qty), 0);
      let baseDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
      
      let specialDiscount = 0;
      if (checkFirstOrderFlag) {
        specialDiscount = totalAmount * 0.10;
      }

      const finalDiscount = baseDiscount + specialDiscount;
      const netPayable = totalAmount - finalDiscount;

      setPricingSummary({ 
        total: totalAmount, 
        discount: finalDiscount, 
        net: netPayable 
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setSaleDateString(new Date().toLocaleDateString());

    const savedProfile = localStorage.getItem('stationero_logged_user');
    const parsedLocal = savedProfile ? JSON.parse(savedProfile) : null;
    
    const activeEmail = (
      userProfile?.email || 
      userProfile?.customer_email || 
      parsedLocal?.email || 
      parsedLocal?.customer_email || 
      ""
    ).trim();

    if (!activeEmail) {
      navigate('/login');
      return;
    }

    const fetchProfileAndOrderHistory = async () => {
      try {
        const profileRes = await axios.get(`http://localhost:8000/api/customer/profile/${activeEmail}`);
        const data = profileRes.data;
        setCustomerProfile({
          name: data.name || data.customer_name || "Customer",
          email: data.email || activeEmail,
          phone: data.phone || "-",
          address: data.address || "-"
        });

        let firstOrderCheck = false;
        try {
          // Hits her direct history-logs list array wrapper path
          const historyRes = await axios.get(`http://localhost:8000/api/order/history-logs/${activeEmail}`);
          const historyData = historyRes.data;
          
          // ---- FIXED: EXTRACTS LIST FROM NATIVE .orders OBJECT WRAPPER ----
          let ordersArray = [];
          if (historyData) {
            if (Array.isArray(historyData.orders)) {
              ordersArray = historyData.orders;
            } else if (Array.isArray(historyData)) {
              ordersArray = historyData;
            }
          }

          // STRICT SECURITY LOCK: If any past rows exist on her back-end, discount drops to false!
          if (ordersArray.length === 0) {
            firstOrderCheck = true; 
          } else {
            firstOrderCheck = false; 
          }
        } catch (historyErr) {
          console.warn("History link channel dropped, turning off discount for safety.");
          firstOrderCheck = false; 
        }

        setIsFirstOrder(firstOrderCheck);
        processCheckoutLogic(firstOrderCheck);

      } catch (err) {
        console.error(err);
        processCheckoutLogic(false);
      }
    };

    const processCheckoutLogic = (firstOrderFlag) => {
      let targetItems = [];
      if (location.state && location.state.items) {
        targetItems = location.state.items;
      } else if (localStorage.getItem('stationero_active_checkout')) {
        targetItems = JSON.parse(localStorage.getItem('stationero_active_checkout'));
      }
      
      setCheckoutItems(targetItems);
      calculate(targetItems, firstOrderFlag);
    };

    fetchProfileAndOrderHistory();

  }, [navigate, location.state, userProfile]);

  useEffect(() => {
    if (checkoutItems.length > 0) {
      calculate(checkoutItems, isFirstOrder);
    }
  }, [isFirstOrder, checkoutItems.length]);

       const handleConfirmOrder = async () => {
    try {
      // 1. ---- FIXED: EXTRACTS USER PACKET SAFELY TO GRAB THE RELATIONAL NUMERIC ID ----
      const storedUserStr = localStorage.getItem('stationero_logged_user');
      let numericCustomerId = 6; // Standard safe fallback user ID integer if empty
      
      if (storedUserStr && storedUserStr !== "undefined") {
        const parsedUser = JSON.parse(storedUserStr);
        // Safely extract user_id or fallback integer keys from the database mapping
        numericCustomerId = parseInt(parsedUser.user_id || parsedUser.id || parsedUser.user?.user_id, 10) || 6;
      }

      const itemsPayload = checkoutItems.map(item => ({
        product_id: parseInt(item.product_id, 10),
        qty: parseInt(item.qty, 10),
        selling_price: parseFloat(item.price || 0),
        sub_total: parseFloat(item.amount || (item.price * item.qty))
      }));

      // 2. ---- FIXED: MATCHES THE EXACT PAYLOAD VALUES EXPECTED BY YOUR SCHEMAS ----
      const response = await axios.post('http://localhost:8000/api/order/confirm', {
        customer_id: numericCustomerId, // 👈 INJECTS THE TRUE NUMERIC INTEGER ID DIRECTLY!
        net_amount: pricingSummary.net,
        total_qty: checkoutItems.reduce((sum, item) => sum + item.qty, 0),
        customer_email: customerProfile.email,
        payment_method: paymentMethod,
        items: itemsPayload
      });

      if (response.status === 201 || response.status === 200) { 
        try {
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (key.startsWith('stationero_cart')) {
              console.log(`Force deleting storage residue node: ${key}`);
              localStorage.removeItem(key);
            }
          });
        } catch (storageErr) {
          console.error("Global storage purge exception handler: ", storageErr);
        }

        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
        localStorage.removeItem('stationero_active_checkout');
        localStorage.removeItem('checkout_source');
        
        window.location.href = '/history';
      }
    } catch (error) {
      console.error(error);
      alert("Order confirmation failed!");
    }
  };

  return (
    <div style={styles.container}>
        <StationeroNavbar showSearch={false} />
        <main style={isMobile ? styles.mainContentMobile : styles.mainContent}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '-5px', paddingLeft: '5px' }}>
          <button 
            type="button"
            onClick={() => navigate('/cart')} 
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
              gap: '6px',
              padding: '4px 8px',
              outline: 'none',
              textTransform: 'capitalize',
              transition: 'color 0.2s ease, transform 0.2s ease'
            }}
          >
            <span>←</span> <span>Back</span>
          </button>
        </div>
            <div style={isMobile ? styles.invoiceCardMobile : styles.invoiceCard}>
              <div style={styles.brandTitleHeader}>Stationero</div>

              <div style={styles.metaRow}>
                <span><strong>Sale Date :</strong> {saleDateString}</span>
              </div>

              <div style={styles.sectionBlock}>
                <h3 style={styles.sectionHeading}>Customer Information :</h3>
                <div style={isMobile ? styles.infoGridMobile : styles.infoGrid}>
                  <div style={styles.infoLabel}>Customer Name :</div>
                  <div style={styles.infoValue}>{customerProfile.name}</div>
                  <div style={styles.infoLabel}>Phone :</div>
                  <div style={styles.infoValue}>{customerProfile.phone}</div>
                  <div style={styles.infoLabel}>Email :</div>
                  <div style={styles.infoValue}>{customerProfile.email}</div>
                  <div style={styles.infoLabel}>Address :</div>
                  <div style={styles.infoValue}>{customerProfile.address}</div>
                </div>
              </div>

              <div style={styles.sectionBlock}>
                <h3 style={styles.sectionHeading}>Payment Information :</h3>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '5px' }}>
                  <div style={isMobile ? { ...styles.infoLabel, width: '135px' } : { ...styles.infoLabel, width: '160px' }}>Payment Method :</div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="Cash Down">Cash Down</option>
                    <option value="KBZ Pay">KBZ Pay</option>
                    <option value="Wave Pay">Wave Pay</option>
                  </select>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                {/* 👈 Hidden on mobile to avoid squishing the layout columns */}
                <div style={{ ...styles.tableHeaderRow, display: isMobile ? 'none' : 'flex' }}>
                  <span style={{ ...styles.thCell, width: '10%' }}>No</span>
                  <span style={{ ...styles.thCell, width: pricingSummary.discount > 0 ? '40%' : '48%' }}>Product Name</span>
                  <span style={{ ...styles.thCell, width: '10%' }}>Qty</span>
                  <span style={{ ...styles.thCell, width: '13%' }}>Unit Price</span>
                  {pricingSummary.discount > 0 && <span style={{ ...styles.thCell, width: '13%' }}>Discount</span>}
                  <span style={{ ...styles.thCell, width: pricingSummary.discount > 0 ? '14%' : '19%' }}>Total Amount</span>
                </div>

                {checkoutItems.map((item, idx) => {
                  const rowGrossAmount = parseInt(item.qty, 10) * parseFloat(item.price || 0);
                  const computedRowDiscount = rowGrossAmount * 0.10;

                  return (
                    <div key={idx} style={isMobile ? styles.tableBodyRowMobile : styles.tableBodyRow}>
                      {isMobile ? (
                        /* 📱 Mobile Layout: Fixes overlapping product information */
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px' }}>
                          <div style={{ fontSize: '14px', color: '#111', fontWeight: 500 }}>{idx + 1}. {item.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                            <span>Qty: {item.qty} × {(item.price || 0).toLocaleString()}</span>
                            {pricingSummary.discount > 0 && <span style={{ color: '#dc2626' }}>Discount: {computedRowDiscount.toLocaleString()}</span>}
                            <span style={{ color: '#000000', fontWeight: 'bold' }}>{(item.amount || 0).toLocaleString()} MMK</span>
                          </div>
                        </div>
                      ) : (
                        /* 💻 Desktop Layout: Preserved exactly as your original code */
                        <>
                          <span style={{ ...styles.tdCell, width: '10%' }}>{idx + 1}</span>
                          <span style={{ ...styles.tdCell, width: pricingSummary.discount > 0 ? '40%' : '48%' }}>{item.name}</span>
                          <span style={{ ...styles.tdCell, width: '10%' }}>{item.qty}</span>
                          <span style={{ ...styles.tdCell, width: '13%' }}>{(item.price || 0).toLocaleString()}</span>
                          {pricingSummary.discount > 0 && <span style={{ ...styles.tdCell, width: '13%', color: '#dc2626', fontWeight: 'bold' }}>{computedRowDiscount.toLocaleString()}</span>}
                          <span style={{ ...styles.tdCell, width: pricingSummary.discount > 0 ? '14%' : '19%', fontWeight: 'bold' }}>{(item.amount || 0).toLocaleString()} MMK</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={styles.summaryContainer}>
                {pricingSummary.discount > 0 && (
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Discount :</span>
                    <span style={{ ...styles.summaryValue, color: '#dc2626', fontWeight: 'bold' }}>
                      -{pricingSummary.discount.toLocaleString()} MMK
                    </span>
                  </div>
                )}
                
                <div style={{ ...styles.summaryRow, marginTop: '10px' }}>
                  <span style={styles.summaryLabel}>Net Amount :</span>
                  <span style={{ ...styles.summaryValue, color: '#f25278', fontSize: '16px', fontWeight: 'bold' }}>
                    {pricingSummary.net.toLocaleString()} MMK
                  </span>
                </div>
              </div>
            </div>

            <div style={isMobile ? styles.actionButtonsRowMobile : styles.actionButtonsRow}>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                onMouseEnter={() => setHoveredBtn('cancel')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ ...styles.cancelBtn, ...(hoveredBtn === 'cancel' ? styles.cancelBtnHover : {}) }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                onMouseEnter={() => setHoveredBtn('confirm')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ ...styles.confirmBtn, ...(hoveredBtn === 'confirm' ? styles.confirmBtnHover : {}) }}
              >
                Confirm Order
              </button>
            </div>
        </main>
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
  mainContent: { padding: '16px 10px', maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' },
  mainContentMobile: { padding: '50px 5px', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' },
  invoiceCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' },
  invoiceCardMobile: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', width: '100%', boxSizing: 'border-box' },
  brandTitleHeader: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fdf2f4', color: '#f25278', fontSize: '25px', fontWeight: '600', textAlign: 'center', padding: '12px', borderRadius: '8px', marginBottom: '24px' },
  metaRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#4b5563', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px', marginBottom: '20px' },
  sectionBlock: { marginBottom: '25px', width: '100%', boxSizing: 'border-box' },
  sectionHeading: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' },
  infoGrid: { fontFamily: "'Poppins', sans-serif", display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '8px', fontSize: '16px', color: '#4b5563', paddingLeft: '5px' },
  infoGridMobile: { fontFamily: "'Poppins', sans-serif", display: 'grid', gridTemplateColumns: '135px 1fr', rowGap: '8px', fontSize: '13px', color: '#4b5563', paddingLeft: '5px' },
  infoLabel: { fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: '#6b7280' },
  infoValue: { fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: '#1f2937' },
  tableWrapper: { marginTop: '20px', borderTop: '1px dashed #e5e7eb', paddingTop: '20px', width: '100%', boxSizing: 'border-box' },
  tableHeaderRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', backgroundColor: '#e5e7eb', padding: '12px 15px', borderRadius: '8px', fontWeight: '600', color: '#4b5563', fontSize: '15px', textTransform: 'uppercase' },
  tableBodyRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', padding: '15px', borderBottom: '1px solid #f3f4f6', color: '#1f2937', fontSize: '16px', fontWeight: '500', alignItems: 'center', textTransform: 'capitalize' },
  tableBodyRowMobile: { display: 'flex', padding: '12px 5px', borderBottom: '1px dashed #e5e7eb', color: '#1f2937', width: '100%', boxSizing: 'border-box' },
  thCell: { textAlign: 'left' },
  tdCell: { textAlign: 'left' },
  backButtonWrapper: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 10, transition: 'all 0.2s ease' },
  backArrow: { color: '#f25278', fontWeight: '600' },
  backText: { color: '#f25278', fontWeight: '600', fontSize: '15px', fontFamily: "'Poppins', sans-serif" },
  summaryContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: '25px', paddingRight: '15px', width: '100%', boxSizing: 'border-box' },
  summaryRow: { fontFamily: "'Poppins', sans-serif", display: 'grid', gridTemplateColumns: '120px 100px', textAlign: 'right', fontSize: '14px', color: '#4b5563' },
  summaryLabel: { fontWeight: '600', color: '#6b7280' },
  summaryValue: { fontWeight: '600', color: '#111827' },
  actionButtonsRow: { display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px', marginBottom: '30px' },
  actionButtonsRowMobile: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' },
  cancelBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', padding: '12px 35px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  cancelBtnHover: { backgroundColor: '#e5e7eb', color: '#111827' },
  confirmBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  confirmBtnHover: { backgroundColor: '#e04167', color: 'white' },
  emptyOrderContainer: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '60px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  emptyOrderText: { fontFamily: "'Poppins', sans-serif", color: '#111827', fontSize: '20px', margin: 0, fontWeight: '600' },
  emptyOrderSubtext: { fontFamily: "'Poppins', sans-serif", color: '#6b7280', fontSize: '15px', margin: '0 0 15px 0' },
  shopBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  shopBtnHover: { backgroundColor: '#e04167', color: 'white' },
  selectInput: { fontFamily: "'Poppins', sans-serif", padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontSize: '16px', color: '#1f2937', cursor: 'pointer' }
};

  export default OrderPage;