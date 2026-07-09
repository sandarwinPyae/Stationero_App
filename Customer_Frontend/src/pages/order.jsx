import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios ကို import လုပ်ပါ
const OrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Product', path: '/product' },
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'Order', path: '/order', isOrderPage: true },
    { label: 'Returns', path: '/returns' },
    { label: 'History', path: '/history' },
    { label: 'Profile', path: '/profile' }
  ];

  const calculate = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || item.price * item.qty), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    setPricingSummary({ total: totalAmount, discount: totalDiscount, net: totalAmount - totalDiscount });
  };

  useEffect(() => {
    setSaleDateString(new Date().toLocaleDateString());

    const savedProfile = localStorage.getItem('stationero_logged_user');
    let activeEmail = 'guest';
    if (savedProfile && savedProfile !== "undefined") {
      try {
        const parsed = JSON.parse(savedProfile);
        activeEmail = (parsed.email || parsed.user_email || parsed.customer_email || 'guest').trim();
      } catch (e) { console.error(e); }
    }

    if (!savedProfile || activeEmail === 'guest') {
      navigate('/login');
      return;
    }

    // 🌟 ဒီနေရာမှာ async function အသစ်ဆောက်ပြီး ခေါ်ပါမယ် 🌟
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8000/api/customer/profile/${activeEmail}`);
        setCustomerProfile({
          name: data.name || data.customer_name,
          email: data.email || activeEmail,
          phone: data.phone,
          address: data.address
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();

    // CHECKOUT LOGIC
    const activeCheckoutData = localStorage.getItem('stationero_active_checkout');
    const checkoutSource = localStorage.getItem('checkout_source');
    const cartKey = `stationero_cart_${activeEmail}`;
    const cartData = localStorage.getItem(cartKey);

    if (location.state && location.state.items) {
      setCheckoutItems(location.state.items);
      calculate(location.state.items);
    }
    else if (localStorage.getItem('stationero_active_checkout')) {
      const items = JSON.parse(localStorage.getItem('stationero_active_checkout'));
      setCheckoutItems(items);
      calculate(items);
    }
    else {
      setCheckoutItems([]);
      setPricingSummary({ total: 0, discount: 0, net: 0 });
    }
  }, [navigate, location.state]);
  const handleConfirmOrder = async () => {
    try {
      const itemsPayload = checkoutItems.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        selling_price: item.price,
        sub_total: item.amount
      }));

      // 🌟 axios.post သို့ ပြောင်းလဲခြင်း
      const response = await axios.post('http://localhost:8000/api/order/confirm', {
        net_amount: pricingSummary.net,
        total_qty: checkoutItems.reduce((sum, item) => sum + item.qty, 0),
        customer_email: customerProfile.email,
        payment_method: paymentMethod,
        items: itemsPayload
      });

      if (response.status === 201) { // axios မှာ status 201 ကို စစ်ရပါတယ်
        localStorage.removeItem('stationero_active_checkout');
        localStorage.removeItem('checkout_source');
        navigate('/history');
      }
    } catch (error) {
      console.error("Order confirmation error:", error);
      alert("Order confirmation failed!");
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
              onClick={() => navigate(item.path)}
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
          <span onClick={() => navigate('/login')} style={styles.link}>Logout</span>
        </nav>
      </header>

      <main style={styles.mainContent}>
        {/* 🌟 ပစ္စည်းမရှိပါက ပြသမည့် အလွတ်ဒီဇိုင်း 🌟 */}
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
          /* 🌟 ပစ္စည်းရှိပါက ပြသမည့် မူလ Invoice ဒီဇိုင်း 🌟 */
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
                  <span style={{ ...styles.thCell, width: '40%' }}>Product Name</span>
                  <span style={{ ...styles.thCell, width: '10%' }}>Qty</span>
                  <span style={{ ...styles.thCell, width: '13%' }}>Unit Price</span>
                  <span style={{ ...styles.thCell, width: '13%' }}>Discount</span>
                  <span style={{ ...styles.thCell, width: '14%' }}>Amount</span>
                </div>

                {checkoutItems.map((item, idx) => (
                  <div key={idx} style={styles.tableBodyRow}>
                    <span style={{ ...styles.tdCell, width: '10%' }}>{idx + 1}</span>
                    <span style={{ ...styles.tdCell, width: '40%' }}>{item.name}</span>
                    <span style={{ ...styles.tdCell, width: '10%' }}>{item.qty}</span>
                    <span style={{ ...styles.tdCell, width: '13%' }}>{(item.price || 0).toLocaleString()}</span>
                    <span style={{ ...styles.tdCell, width: '13%' }}>{(item.discount || 0).toLocaleString()}</span>
                    <span style={{ ...styles.tdCell, width: '14%', fontWeight: 'bold' }}>{(item.amount || 0).toLocaleString()}</span>
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
  // 🌟 အသစ်ထပ်ဖြည့်ထားသော Style များ 🌟
  emptyOrderContainer: { backgroundColor: '#ffffff', borderRadius: '15px', padding: '60px 40px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  emptyOrderText: { color: '#111', fontSize: '20px', margin: 0, fontWeight: 'bold' },
  emptyOrderSubtext: { color: '#777', fontSize: '15px', margin: '0 0 15px 0' },
  shopBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px 35px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' },
  shopBtnHover: { backgroundColor: '#d93a5f', color: 'white' },
  // styles အောက်ဆုံးတွင် ထပ်ဖြည့်ရန်
  selectInput: { padding: '6px 12px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none', fontSize: '14px', color: '#333', cursor: 'pointer', fontFamily: 'inherit' }
};

export default OrderPage;