import React, { useState, useEffect, useContext } from 'react'; 
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // 👈 🎯 useParams ပါဝင်အောင် ဖြည့်စွက်ပေးလိုက်ပါသည်
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext'; 
import { StationeroNavbar } from './StationeroPage'; 

// ====== 🟢 🎯 FIXED (၁): FUNCTION WRAPPER တဂ်ခေါင်းစဉ်အား စနစ်တကျ ပြန်လည်လွှမ်းခြုံပေးလိုက်ခြင်းဖြစ်သည် ======
const OrderDetailPage = () => {
  // ====== 🎯 🟢 UNIVERSAL KEBAB-CASE ROUTER PARAMETER PARSER SECURED (NO LOADING) ======
  const params = useParams();
  const orderId = params["order-id"] || params.orderId || params.order_id;
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // ====== 🎯 🟢 LIVE DATABASE DATA FETCH LAYER ======
  useEffect(() => {
    if (orderId && orderId !== "undefined") {
      axios.get(`http://localhost:8000/api/order/confirm-orders/details/${orderId}`)
        .then(res => {
          setOrderData(res.data);
          console.log("🌟 Master Invoice Blueprint Loaded Success Natively:", res.data);
        })
        .catch(err => {
          console.error("Axios Connection Error:", err);
        });
    }
  }, [orderId]);

  // ====== 🎯 🟢 DATA SECURITY CHECKS LAYER (NO LOADING SCREEN) ======
  if (!orderData || !orderData.header) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ color: '#d9383a', fontWeight: '700', fontSize: '18px' }}>Order records not found.</div>
        <button onClick={() => navigate('/history')} style={{ marginTop: '20px', padding: '10px 25px', backgroundColor: '#f25278', color: '#fff', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>Back to History</button>
      </div>
    );
  }

  // ====== 🎯 🟢 DESTRUCTURING INCOMING PAYLOADS & MATH LOGICS ======
  const { header, details, payments } = orderData;
  
  // 🟢 🎯 FIXED (၂): မိတ်ဆွေအောက်ခြေတွင် သုံးစွဲထားသော customerProfile နေရာတွင် ဒေတာဘေ့စ်မှကျလာသော Node အား စာရင်းကိုက် ညွှန်ပြပေးလိုက်ခြင်းဖြစ်သည်
  const customerProfile = {
    name: header.customer?.customer_name || "Customer",
    phone: header.customer?.customer_phone || header.customer?.phone_number || "-",
    email: header.customer?.customer_email || "-",
    address: header.customer?.customer_address || header.customer?.address || "-"
  };
  
  const activePaymentMethod = payments && payments.length > 0 ? payments.payment_method : "Cash Down";
  const amountPaidFromDb = payments && payments.length > 0 ? parseFloat(payments.amount_paid || 0) : 0;
  const saleDateString = header.order_date ? new Date(header.order_date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : "N/A";

  const grossAmount = header.total_amount ? Number(header.total_amount) : 0;
  const discountAmount = header.discount ? Number(header.discount) : 0;
  
  // 🟢 🎯 FIXED (၃): မိတ်ဆွေအောက်ခြေတွင် သုံးစွဲထားသော customerPaidNetAmount အား ဒိုင်နမစ် တန်ဖိုး ကွက်တိတွက်ချက်ပေးလိုက်ခြင်းဖြစ်သည်
  const customerPaidNetAmount = amountPaidFromDb > 0 ? amountPaidFromDb : (grossAmount - discountAmount);

  return (
    <div style={styles.container}>
      <StationeroNavbar showSearch={false} />
      
      <main style={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '-5px', paddingLeft: '5px' }}>
          <button 
            type="button"
            onClick={() => navigate('/history')} 
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
            <h3 style={styles.sectionHeading}>Order Information</h3>
            <div style={styles.infoGrid}>
              <span style={styles.infoLabel}>Order Status:</span>
              <span style={{ ...styles.infoValue, color: '#f25278', fontWeight: 'bold' }}>{header.status}</span>
              <span style={styles.infoLabel}>Payment Method:</span>
              <span style={styles.infoValue}>{activePaymentMethod || 'Cash Down'}</span>
            </div>
          </div>

<div style={styles.tableWrapper}>
            <div style={styles.tableHeaderRow}>
              <span style={{ ...styles.thCell, width: '10%' }}>No</span>
              
              <span style={{ ...styles.thCell, width: discountAmount > 0 ? '40%' : '48%' }}>Product Name</span>
              <span style={{ ...styles.thCell, width: '10%' }}>Qty</span>
              <span style={{ ...styles.thCell, width: '13%' }}>Unit Price</span>
              
              {discountAmount > 0 && (
                <span style={{ ...styles.thCell, width: '13%' }}>Discount</span>
              )}
              
              <span style={{ ...styles.thCell, width: discountAmount > 0 ? '14%' : '19%' }}>Total Amount</span>
            </div>

            {details.map((item, idx) => {
              const rowGrossAmount = parseInt(item.qty, 10) * parseFloat(item.selling_price || 0);
              
              const computedRowDiscount = discountAmount > 0 ? (rowGrossAmount * 0.10) : 0;

              return (
                <div key={idx} style={styles.tableBodyRow}>
                  {/* idx + 1 စနစ်ဖြင့် နံပါတ်စဉ် No အား ရှေ့ဆုံးတွင် လှလှပပ မပြောင်းလဲဘဲ ဖော်ပြပေးလိုက်ခြင်းဖြစ်ပါသည် */}
                  <span style={{ ...styles.tdCell, width: '10%' }}>{idx + 1}</span>
                  <span style={{ ...styles.tdCell, width: discountAmount > 0 ? '40%' : '48%' }}>{item.product_name}</span>
                  <span style={{ ...styles.tdCell, width: '10%' }}>{item.qty}</span>
                  <span style={{ ...styles.tdCell, width: '13%' }}>{Number(item.selling_price).toLocaleString()}</span>
                  {discountAmount > 0 && (
                    <span style={{ ...styles.tdCell, width: '13%', color: '#000000', fontWeight: 200 }}>
                      {computedRowDiscount.toLocaleString()}
                    </span>
                  )}
                  
                  <span style={{ ...styles.tdCell, width: discountAmount > 0 ? '14%' : '19%', fontWeight: 200 }}>
                    {Number(item.sub_total || rowGrossAmount).toLocaleString()} MMK
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.summaryContainer}>
            {discountAmount > 0 ? (
              <>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Discount:</span>
                  <span style={{ ...styles.summaryValue, color: '#000000', fontWeight: 200 }}>{discountAmount.toLocaleString()} MMK</span>
                </div>
                <div style={{ ...styles.summaryRow, paddingTop: '8px', marginTop: '5px' }}>
                  <span style={{ ...styles.summaryLabel, color: '#000000', fontSize: '16px' }}>Net Amount :</span>
                  <span style={{ ...styles.summaryValue, color: '#000000', fontSize: '16px', fontWeight: 200 }}>{customerPaidNetAmount.toLocaleString()} MMK</span>
                </div>
              </>
            ) : (
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Net Amount :</span>
                <span style={{ ...styles.summaryValue, color: '#f25278', fontSize: '16px', fontWeight: 'bold' }}>{grossAmount.toLocaleString()} MMK</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh', margin: 0 },
  mainContent: { maxWidth: '900px', width: '100%', height: '90%', margin: 'auto', padding: '0 20px', boxSizing: 'border-box',marginBottom:'20px' },
  invoiceCard: {  borderRadius: '15px', padding: '40px', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.04)',marginBottom: '20px' },
  brandTitleHeader: { backgroundColor: '#fdf2f4', color: '#f25278', fontSize: '25px', fontWeight: 200, textAlign: 'center', padding: '12px', borderRadius: '25px', marginBottom: '30px' },
  metaRow: { fontSize: '15px', color: '#666666', marginBottom: '35px', display: 'flex', flexWrap: 'wrap', gap: '10px' },
  sectionBlock: { marginBottom: '35px' },
  sectionHeading: { fontSize: '16px', fontWeight: 400, color: '#111111', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.3px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '12px', paddingLeft: '5px', fontSize: '15px', color: '#333333' },
  infoLabel: { fontWeight: '600', color: '#666666' },
  infoValue: { color: '#111111' },
  selectInput: { padding: '8px 15px', fontSize: '15px', borderRadius: '8px', border: '1px solid #dddddd', outline: 'none', width: '200px', fontFamily: "'Poppins', sans-serif", color: '#111111' },
  tableWrapper: { marginTop: '40px', border: '1px solid #f0f0f0', borderRadius: '10px', overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', backgroundColor: '#f9fafb', padding: '14px 20px', borderBottom: '1px solid #f0f0f0' },
  thCell: { fontSize: '14px', fontWeight: '700', color: '#555555', textAlign: 'left' },
  tableBodyRow: { display: 'flex', padding: '16px 20px', borderBottom: '1px solid #f9fafb', alignItems: 'center', transition: 'background-color 0.15s ease' },
  tdCell: { fontSize: '14px', color: '#333333', textAlign: 'left' },
  summaryContainer: { marginTop: '35px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '20px' },
  summaryRow: { display: 'flex', width: '280px', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: '15px', fontWeight: 400, color: '#666666' },
  summaryValue: { fontSize: '15px', color: '#111111' },
  actionButtonsRow: { display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '35px', paddingRight: '5px' },
  cancelBtn: { backgroundColor: '#ffffff', color: '#555555', border: '1px solid #dddddd', padding: '12px 35px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none', fontFamily: "'Poppins', sans-serif" },
  cancelBtnHover: { backgroundColor: '#f3f4f6', borderColor: '#cccccc' }
};


export default OrderDetailPage;
