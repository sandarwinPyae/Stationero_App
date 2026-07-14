import React, { useState, useEffect, useContext } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext'; 
import { StationeroNavbar } from './StationeroPage'; 

const OrderPage = () => {
  const navigate = useNavigate();
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
        <main style={styles.mainContent}>
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
        </div>
        {checkoutItems.length === 0 ? (
          <div style={styles.emptyOrderContainer}>
            <h2 style={styles.emptyOrderText}>Your Order is Empty</h2>
            <p style={styles.emptyOrderSubtext}>You haven't selected any products to order yet. Please browse our shop to add items.</p>
            <button
              type="button"
              onClick={() => navigate('/product')}
              onMouseEnter={() => setHoveredBtn('shop')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{ ...styles.shopBtn, ...(hoveredBtn === 'shop' ? styles.shopBtnHover : {}) }}
            >
              Go to Products
            </button>
          </div>
        ) : (
          <>
            <div style={styles.invoiceCard}>
              <div style={styles.brandTitleHeader}>Stationero</div>

              <div style={styles.metaRow}>
                <span><strong>Sale Date :</strong> {saleDateString}</span>
              </div>

              <div style={styles.sectionBlock}>
                <h3 style={styles.sectionHeading}>Customer Information :</h3>
                <div style={styles.infoGrid}>
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
                  <div style={{ ...styles.infoLabel, width: '160px' }}>Payment Method :</div>
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
                <div style={styles.tableHeaderRow}>
                  <span style={{ ...styles.thCell, width: '10%' }}>No</span>
                  <span style={{ ...styles.thCell, width: pricingSummary.discount > 0 ? '40%' : '48%' }}>Product Name</span>
                  <span style={{ ...styles.thCell, width: '10%' }}>Qty</span>
                  <span style={{ ...styles.thCell, width: '13%' }}>Unit Price</span>
                  
                  {pricingSummary.discount > 0 && (
                    <span style={{ ...styles.thCell, width: '13%' }}>Discount</span>
                  )}
                  
                  <span style={{ ...styles.thCell, width: pricingSummary.discount > 0 ? '14%' : '19%' }}>Total Amount</span>
                </div>

                {checkoutItems.map((item, idx) => {
                  const rowGrossAmount = parseInt(item.qty, 10) * parseFloat(item.price || 0);
                  const computedRowDiscount = rowGrossAmount * 0.10;

                  return (
                    <div key={idx} style={styles.tableBodyRow}>
                      <span style={{ ...styles.tdCell, width: '10%' }}>{idx + 1}</span>
                      <span style={{ ...styles.tdCell, width: pricingSummary.discount > 0 ? '40%' : '48%' }}>{item.name}</span>
                      <span style={{ ...styles.tdCell, width: '10%' }}>{item.qty}</span>
                      <span style={{ ...styles.tdCell, width: '13%' }}>{(item.price || 0).toLocaleString()}</span>
                      
                      {pricingSummary.discount > 0 && (
                        <span style={{ ...styles.tdCell, width: '13%', color: '#dc2626', fontWeight: 'bold' }}>
                          {computedRowDiscount.toLocaleString()}
                        </span>
                      )}
                      
                      <span style={{ ...styles.tdCell, width: pricingSummary.discount > 0 ? '14%' : '19%', fontWeight: 'bold' }}>
                        {(item.amount || 0).toLocaleString()} MMK
                      </span>
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

            <div style={styles.actionButtonsRow}>
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
          </>
        )}
      </main>
    </div>
  );
};


const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' },
  logo: { fontFamily: "Azeret Mono, monospace", color: '#f25278', fontSize: '30px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0, textTransform: 'none' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '14px', transition: 'color 0.2s ease' },
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  mainContent: { padding: '30px 20px', maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' },
  invoiceCard: { backgroundColor: '#ffffff', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' },
  brandTitleHeader: { backgroundColor: '#fdf2f4', color: '#f25278', fontSize: '25px', fontWeight: 200, textAlign: 'center', padding: '12px', borderRadius: '25px', marginBottom: '30px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#333', borderBottom: '1px solid #f9f9f9', paddingBottom: '15px', marginBottom: '20px' },
  sectionBlock: { marginBottom: '25px' },
  sectionHeading: { fontSize: '15px', fontWeight: 'bold', color: '#111', margin: '0 0 12px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '8px', fontSize: '15px', color: '#444', paddingLeft: '5px' },
  infoLabel: { fontWeight: 200, color: '#555' },
  infoValue: { color: '#222' },
  tableWrapper: { marginTop: '20px', borderTop: '1px dashed #e0e0e0', paddingTop: '20px' },
  tableHeaderRow: { display: 'flex', backgroundColor: '#f8f9fa', padding: '12px 15px', borderRadius: '5px', fontWeight: 200, color: '#444', fontSize: '15px' },
  tableBodyRow: { display: 'flex', padding: '15px', borderBottom: '1px solid #f6f6f6', color: '#444', fontSize: '15px', alignItems: 'center' },
  thCell: { textAlign: 'left' },
  tdCell: { textAlign: 'left' },
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  backButtonWrapper: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 14px', borderRadius: '20px', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10, transition: 'all 0.2s ease' },
  backArrow: { color: '#f25278', fontWeight: 200},
  backText: { color: '#f25278', fontWeight: 200, fontSize: '15px', fontFamily: "Poppins, sans-serif" },
  summaryContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: '25px', paddingRight: '15px' },
  summaryRow: { display: 'grid', gridTemplateColumns: '120px 100px', textAlign: 'right', fontSize: '14px', color: '#444' },
  summaryLabel: { fontWeight: 'bold', color: '#555' },
  summaryValue: { color: '#111' },
  actionButtonsRow: { display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px', marginBottom: '30px' },
  cancelBtn: { backgroundColor: '#e0e0e0', color: '#444', border: 'none', padding: '12px 45px', borderRadius: '25px', fontSize: '15px', fontWeight: 200, cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  cancelBtnHover: { backgroundColor: '#d5d5d5', color: '#111' },
  confirmBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 45px', borderRadius: '25px', fontSize: '15px', fontWeight: 200, cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  confirmBtnHover: { backgroundColor: '#d93a5f', color: 'white' },
  emptyOrderContainer: { backgroundColor: '#ffffff', borderRadius: '15px', padding: '60px 40px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  emptyOrderText: { color: '#111', fontSize: '20px', margin: 0, fontWeight: 'bold' },
  emptyOrderSubtext: { color: '#777', fontSize: '15px', margin: '0 0 15px 0' },
  shopBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  shopBtnHover: { backgroundColor: '#d93a5f', color: 'white' },
  selectInput: { padding: '6px 12px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', color: '#333', cursor: 'pointer', fontFamily: 'inherit' }
};
  export default OrderPage;