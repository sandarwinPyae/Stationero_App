import React, { useState, useEffect } from 'react';

const ReturnsPage = ({ onNavigate }) => {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSubmitBtn, setHoveredSubmitBtn] = useState(false);
  const [productName, setProductName] = useState('Gel Pens');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('Broken');
  const [paymentMethod, setPaymentMethod] = useState('Cash Down');
  const [selectedFile, setSelectedFile] = useState(null);
  const [customerProfile, setCustomerProfile] = useState({ phone: '-', email: '', address: '-' });

  const navItems = [
    { label: 'Home', action: 'product' },
    { label: 'About Us', action: 'product' },
    { label: 'Product', action: 'product' },
    { label: 'Shopping Cart', action: 'cart' },
    { label: 'Order', action: 'order' },
    { label: 'Returns', action: 'returns', isReturnsPage: true },
    { label: 'History', action: 'history' },
    { label: 'Profile', action: 'profile' },
    { label: 'Logout', action: 'login' }
  ];

  useEffect(() => {
    const savedProfile = localStorage.getItem('stationero_logged_user');
    if (savedProfile) {
      setCustomerProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. SUBMIT DIRECTLY TO YOUR UPDATED STATUS PIPELINE
      const response = await fetch('http://localhost:8000/api/order/return-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: customerProfile.email,
          product_name: productName,
          qty: parseInt(quantity, 10) || 1,
          reason: reason,
          payment_method: paymentMethod
        }),
      });

      if (response.ok) {

        onNavigate('history'); // Directly opens history view pane to see updates instantly
      } else {
        alert('Return submission failed.');
      }
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
                ...(item.isReturnsPage ? styles.activeLink : {}),
                ...(hoveredLink === index ? { color: '#f25278' } : {})
              }}
            >
              {item.label}
            </span>
          ))}
        </nav>
      </header>

      <main style={styles.mainContent}>
        <h2 style={styles.mainHeading}>Order Return</h2>
        <form onSubmit={handleReturnSubmit} style={styles.formContainerCard}>
          <div style={styles.formGrid}>
            <div style={styles.formColumn}>
              
              {/* ---- 3. FIXED: THE RETURN ID BOX HAS BEEN COMPLETELY DELETED ---- */}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Email</label>
                <input type="email" value={customerProfile.email} style={styles.inputField} readOnly />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input type="text" value={customerProfile.phone} style={styles.inputField} readOnly />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <input type="text" value={customerProfile.address} style={styles.inputField} readOnly />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Product Name</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} style={styles.inputField} required />
              </div>
            </div>

            <div style={styles.formColumn}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={styles.inputField} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Reason For Return</label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} style={styles.inputField} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Item Condition</label>
                <div style={styles.fileUploadWrapper}>
                  <input type="file" id="item-file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{display:'none'}} />
                  <label htmlFor="item-file" style={styles.fileLabelBtn}>Choose File</label>
                  <span style={styles.fileNameText}>{selectedFile ? selectedFile.name : 'No File Chosen'}</span>
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={styles.dropdownSelect}>
                  <option value="Cash Down">Cash Down</option>
                  <option value="KPay">KPay</option>
                </select>
              </div>
            </div>
          </div>
          <div style={styles.actionRow}>
            <button 
              type="submit" 
              onMouseEnter={() => setHoveredSubmitBtn(true)}
              onMouseLeave={() => setHoveredSubmitBtn(false)}
              style={{
                ...styles.submitReturnBtn, 
                ...(hoveredSubmitBtn ? styles.submitReturnBtnHover : {}) // Safely blends hover styles!
              }}
            >
              Return Order
            </button>
          </div>
        </form>
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
  mainContent: { padding: '40px 50px', maxWidth: '1100px', margin: '0 auto' },
  mainHeading: { fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '20px', paddingLeft: '5px' },
  formContainerCard: { backgroundColor: '#ffffff', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #eeeeee' },
  formGrid: { display: 'flex', gap: '50px' },
  formColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#111' },
  inputField: { padding: '12px 18px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  dropdownSelect: { padding: '12px 18px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
  fileUploadWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '15px', padding: '6px 12px', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' },
  hiddenFileInput: { display: 'none' },
  fileLabelBtn: { backgroundColor: '#e0e0e0', color: '#333', padding: '6px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px', display: 'inline-block', border: '1px solid #adadad' },
  fileNameText: { fontSize: '13px', color: '#666' },
  actionRow: { marginTop: '35px', display: 'flex', justifyContent: 'flex-start' },
  submitReturnBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer',
  transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(242,82,120,0.2)', outline: 'none' },
  submitReturnBtnHover: { backgroundColor: '#e04167', boxShadow: '0 4px 15px rgba(242,82,120,0.3)' },
};
export default ReturnsPage;