import React, { useState, useEffect } from 'react';

const OrderPage = ({ onNavigate }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [pricingSummary, setPricingSummary] = useState({ total: 0, discount: 0, net: 0 });
  const [saleDateString, setSaleDateString] = useState('');

  const [customerProfile, setCustomerProfile] = useState({
    name: 'Customer',
    phone: '-',
    email: '',
    address: '-'
  });

  const navItems = [
    { label: 'Home', action: 'product' },
    { label: 'About Us', action: 'product' },
    { label: 'Product', action: 'product' },
    { label: 'Shopping Cart', action: 'cart' },
    { label: 'Order', action: 'order', isOrderPage: true },
    { label: 'Returns', action: 'returns' },
    { label: 'History', action: 'history' },
    { label: 'Profile', action: 'profile' },
    { label: 'Logout', action: 'login' }
  ];

        useEffect(() => {
    const savedProfile = localStorage.getItem('stationero_logged_user');
    let activeEmail = '';
    
    if (savedProfile && savedProfile !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedProfile);
        activeEmail = (parsedUser.email || parsedUser.user_email || parsedUser.customer_email || '').trim();
      } catch (e) {
        console.error("Failed to parse local storage profile tokens during return page setup:", e);
      }
    }

    // Security Gate: Kick them back to login page if they are truly logged out
    if (!savedProfile || savedProfile === "undefined" || !activeEmail) {
      onNavigate('login');
      return;
    }

    // ---- FIXED: FETCH LIVE ACCOUNT DATA DYNAMICALLY FROM THE DATABASE ----
    fetch(`http://localhost:8000/api/customer/profile/${activeEmail}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        // FIXED: Maps ONLY the true database fields dynamically for whoever is logged in!
        setCustomerProfile({
          name: data.name || data.customer_name,
          email: data.email || data.customer_email || activeEmail,
          phone: data.phone || data.phone_number,
          address: data.address
        });
      })
      .catch(err => {
        console.error("Profile load failed, keeping basic session:", err);
      });

    // Fetch dynamic return incremental sequence numbers
    fetch(`http://localhost:8000/api/order/next-return/${activeEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.return_id) {
          setReturnId(data.return_id); 
        }
      })
      .catch(err => console.error("Error fetching dynamic return ID strings:", err));

  
    const activeCheckoutData = localStorage.getItem('stationero_active_checkout');
    if (activeCheckoutData) {
      const items = JSON.parse(activeCheckoutData);
      setCheckoutItems(items);

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
      setPricingSummary({
        total: totalAmount,
        discount: totalDiscount,
        net: totalAmount - totalDiscount
      });
    }
  }, []);

  const handleConfirmOrder = async () => {
    try {
      const itemsPayload = checkoutItems.map(item => ({
        product_id: item.product_id || 101,
        qty: item.qty,
        selling_price: item.price,
        sub_total: item.amount
      }));

      // FIXED: Dropped invoice_id from frontend body to prevent unique constraint failures
      const response = await fetch('http://localhost:8000/api/order/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          net_amount: pricingSummary.net,
          total_qty: checkoutItems.reduce((sum, item) => sum + item.qty, 0),
          customer_email: customerProfile.email,
          payment_method: "Cash Down",
          items: itemsPayload
        }),
      });
      
      if (response.ok) {
        onNavigate('history'); 
      } else {
        const errorLogs = await response.json();
        alert(`Order failed: ${JSON.stringify(errorLogs.detail)}`);
      }
    } catch (error) {
      console.error('Error reaching backend bridge:', error);
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
                ...(item.isOrderPage ? styles.activeLink : {}),
                ...(hoveredLink === index ? { color: '#f25278' } : {})
              }}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.invoiceCard}>
          <div style={styles.brandTitleHeader}>Stationero</div>
          
          {/* ---- FIXED: REMOVED THE DUPLICATE INVOICE ID DISPLAY BOX HERE ---- */}
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
            <div style={styles.infoGrid}>
              <div style={styles.infoLabel}>Payment Method :</div>
              <div style={styles.infoValue}>Cash Down</div>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <div style={styles.tableHeaderRow}>
              <span style={{...styles.thCell, width: '10%'}}>No</span>
              <span style={{...styles.thCell, width: '40%'}}>Product Name</span>
              <span style={{...styles.thCell, width: '10%'}}>Qty</span>
              <span style={{...styles.thCell, width: '13%'}}>Unit Price</span>
              <span style={{...styles.thCell, width: '13%'}}>Discount</span>
              <span style={{...styles.thCell, width: '14%'}}>Amount</span>
            </div>

            {checkoutItems.map((item, idx) => (
              <div key={idx} style={styles.tableBodyRow}>
                <span style={{...styles.tdCell, width: '10%'}}>{idx + 1}</span>
                <span style={{...styles.tdCell, width: '40%'}}>{item.name}</span>
                <span style={{...styles.tdCell, width: '10%'}}>{item.qty}</span>
                <span style={{...styles.tdCell, width: '13%'}}>{item.price.toLocaleString()}</span>
                <span style={{...styles.tdCell, width: '13%'}}>{(item.discount || 0).toLocaleString()}</span>
                <span style={{...styles.tdCell, width: '14%', fontWeight: 'bold'}}>{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={styles.summaryContainer}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Total Amount :</span>
              <span style={styles.summaryValue}>{pricingSummary.total.toLocaleString()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Discount :</span>
              <span style={styles.summaryValue}>{pricingSummary.discount.toLocaleString()}</span>
            </div>
            <div style={{...styles.summaryRow, marginTop: '10px'}}>
              <span style={styles.summaryLabel}>Net Amount :</span>
              <span style={{...styles.summaryValue, color: '#f25278', fontSize: '16px', fontWeight: 'bold'}}>
                {pricingSummary.net.toLocaleString()} MMK
              </span>
            </div>
          </div>
        </div>

        <div style={styles.actionButtonsRow}>
          <button 
            type="button" 
            onClick={() => onNavigate('cart')}
            onMouseEnter={() => setHoveredBtn('cancel')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{...styles.cancelBtn, ...(hoveredBtn === 'cancel' ? styles.cancelBtnHover : {})}}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleConfirmOrder}
            onMouseEnter={() => setHoveredBtn('confirm')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{...styles.confirmBtn, ...(hoveredBtn === 'confirm' ? styles.confirmBtnHover : {})}}
          >
            Comfirm Order
          </button>
        </div>
      </main>
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
  mainContent: { padding: '30px 20px', maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' },
  invoiceCard: { backgroundColor: '#ffffff', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' },
  brandTitleHeader: { backgroundColor: '#fdf2f4', color: '#f25278', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', padding: '12px', borderRadius: '25px', marginBottom: '30px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#333', borderBottom: '1px solid #f9f9f9', paddingBottom: '15px', marginBottom: '20px' },
  sectionBlock: { marginBottom: '25px' },
  sectionHeading: { fontSize: '15px', fontWeight: 'bold', color: '#111', margin: '0 0 12px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '8px', fontSize: '14px', color: '#444', paddingLeft: '5px' },
  infoLabel: { fontWeight: 'bold', color: '#555' },
  infoValue: { color: '#222' },
  tableWrapper: { marginTop: '20px', borderTop: '1px dashed #e0e0e0', paddingTop: '20px' },
  tableHeaderRow: { display: 'flex', backgroundColor: '#f8f9fa', padding: '12px 15px', borderRadius: '5px', fontWeight: 'bold', color: '#444', fontSize: '13px' },
  tableBodyRow: { display: 'flex', padding: '15px', borderBottom: '1px solid #f6f6f6', color: '#444', fontSize: '13px', alignItems: 'center' },
  thCell: { textAlign: 'left' },
  tdCell: { textAlign: 'left' },
  summaryContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: '25px', paddingRight: '15px' },
  summaryRow: { display: 'grid', gridTemplateColumns: '120px 100px', textAlign: 'right', fontSize: '14px', color: '#444' },
  summaryLabel: { fontWeight: 'bold', color: '#555' },
  summaryValue: { color: '#111' },
  actionButtonsRow: { display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px', marginBottom: '30px' },
  cancelBtn: { backgroundColor: '#e0e0e0', color: '#444', border: 'none', padding: '12px 45px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  cancelBtnHover: { backgroundColor: '#d5d5d5', color: '#111' },
  confirmBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 45px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  confirmBtnHover: { backgroundColor: '#d93a5f', color: 'white' },
};
export default OrderPage;