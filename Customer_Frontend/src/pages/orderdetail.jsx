import React, { useState, useEffect, useContext } from 'react'; 
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // 👈 🎯 useParams ပါဝင်အောင် ဖြည့်စွက်ပေးလိုက်ပါသည်
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext'; 
import { StationeroNavbar } from './StationeroPage'; 

const OrderDetailPage = () => {
  const params = useParams();
  const orderId = params["order-id"] || params.orderId || params.order_id;
  const navigate = useNavigate();
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const [orderData, setOrderData] = useState(null);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

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

  if (!orderData || !orderData.header) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ color: '#d9383a', fontWeight: '700', fontSize: '18px' }}>Order records not found.</div>
        <button onClick={() => navigate('/history')} style={{ marginTop: '20px', padding: '10px 25px', backgroundColor: '#f25278', color: '#fff', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>Back to History</button>
      </div>
    );
  }

  const { header, details, payments } = orderData;
  
  const customerProfile = {
    name: header.customer?.customer_name || "Customer",
    phone: header.customer?.customer_phone || header.customer?.phone_number || "-",
    email: header.customer?.customer_email || "-",
    address: header.customer?.customer_address || header.customer?.address || "-"
  };
  
const activePaymentMethod = payments && payments.length > 0 && payments[0]
  ? (payments[0].sale_payment_method || "Cash Down") 
  : "Cash Down";

const amountPaidFromDb = payments && payments.length > 0 && payments[0]
  ? parseFloat(payments[0].amount_paid || 0) 
  : 0;

  const saleDateString = header.order_date ? new Date(header.order_date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : "N/A";

  const grossAmount = header.total_amount ? Number(header.total_amount) : 0;
  const discountAmount = header.discount ? Number(header.discount) : 0;
  
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
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              outline: 'none',
              textTransform: 'capitalize',
              transition: 'color 0.2s ease, transform 0.2s ease' // 👈 စာသားအရောင် ပြောင်းလဲမှုကို အလွန်နူးညံ့ချောမွေ့သွားစေရန် ဖြစ်သည်
            }}
          >
            <span>←</span> <span>Back</span>
          </button>
        </div>

        <div style={styles.invoiceCard}>
          <div style={styles.brandTitleHeader}>Stationero</div>
          <div style={styles.metaRow}>
            <span>Sale Date : {saleDateString}</span>
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
  <div style={{ ...styles.tableHeaderRow, display: isMobile ? 'none' : 'flex' }}>
    <span style={{ ...styles.thCell, width: '10%' }}>No</span>
    <span style={{ ...styles.thCell, width: '48%' }}>Product Name</span>
    <span style={{ ...styles.thCell, width: '10%' }}>Qty</span>
    <span style={{ ...styles.thCell, width: '20%' }}>Unit Price</span>
    <span style={{ ...styles.thCell, width: '24%' }}>Total Amount</span>
  </div>

  {details.map((item, idx) => {
    const rowGrossAmount = parseInt(item.qty, 10) * parseFloat(item.selling_price || 0);
    const computedRowDiscount = discountAmount > 0 ? (rowGrossAmount * 0.10) : 0;

    return (
      <div key={idx} style={isMobile ? styles.tableBodyRowMobile : styles.tableBodyRow}>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '14px', color: '#111', fontWeight: 500 }}>
                {idx + 1}. {item.product_name}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Qty: {item.qty} × {Number(item.selling_price).toLocaleString()}
                {discountAmount > 0 && (
                  <span style={{ color: '#dc2626', marginLeft: '8px' }}>
                    (Disc: -{computedRowDiscount.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ color: '#000000', fontWeight: 'bold', fontSize: '14px', paddingBottom: '2px' }}>
              {Number(item.sub_total || rowGrossAmount).toLocaleString()} MMK
            </div>
          </div>
        ) : (
          <>
            <span style={{ ...styles.tdCell, width: '10%' }}>{idx + 1}</span>
            <span style={{ ...styles.tdCell, width: '48%' }}>{item.product_name}</span>
            <span style={{ ...styles.tdCell, width: '10%' }}>{item.qty}</span>
            <span style={{ ...styles.tdCell, width: '20%' }}>{Number(item.selling_price).toLocaleString()}</span>
            <span style={{ ...styles.tdCell, width: '24%', fontWeight: 600 }}>
              {Number(item.sub_total || rowGrossAmount).toLocaleString()} MMK
            </span>
          </>
        )}
      </div>
    );
  })}
</div>
          <div style={styles.summaryContainer}>
              {discountAmount > 0 && (
                <>
                  <div style={{ ...styles.summaryRow, marginBottom: '8px' }}>
                    <span style={styles.summaryLabel}>Discount :</span>
                    <span style={{ ...styles.summaryValue, color: '#dc2626', fontWeight: '600' }}>
                      - {discountAmount.toLocaleString()} MMK
                    </span>
                  </div>
                </>
              )}

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Net Amount :</span>
                <span style={{ ...styles.summaryValue, color: '#f25278', fontSize: '18px', fontWeight: 'bold' }}>
                  {customerPaidNetAmount.toLocaleString()} MMK
                </span>
              </div>

          </div>

        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  mainContent: { padding: '30px 10px', maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' },
  mainContentMobile: { padding: '12px 0px', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' },
  invoiceCard: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 15px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' },
  invoiceCardMobile: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', width: '100%', boxSizing: 'border-box' },
  brandTitleHeader: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fdf2f4', color: '#f25278', fontSize: '25px', fontWeight: '600', textAlign: 'center', padding: '12px', borderRadius: '8px', marginBottom: '24px' },
  metaRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#1f2937', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px', marginBottom: '20px', fontWeight: '600' },
  sectionBlock: { marginBottom: '25px', width: '100%', boxSizing: 'border-box' },
  sectionHeading: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' },
  infoGrid: { fontFamily: "'Poppins', sans-serif", display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '8px', fontSize: '16px', color: '#4b5563', paddingLeft: '5px' },
  infoGridMobile: { fontFamily: "'Poppins', sans-serif", display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '12px', rowGap: '8px', fontSize: '15px', color: '#4b5563', paddingLeft: '5px', width: '100%' },
  infoLabel: { fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: '#6b7280', fontSize: '15px' },
  infoValue: { fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: '#1f2937', fontSize: '15px', whiteSpace: 'nowrap' },
  tableWrapper: { marginTop: '20px', borderTop: '1px dashed #e5e7eb', paddingTop: '20px', width: '100%', boxSizing: 'border-box' },
  tableHeaderRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', backgroundColor: '#e5e7eb', padding: '12px 15px', borderRadius: '8px', fontWeight: '600', color: '#4b5563', fontSize: '16px', textTransform: 'uppercase', alignItems: 'center' },
  tableBodyRow: { fontFamily: "'Poppins', sans-serif", display: 'flex', padding: '15px', borderBottom: '1px solid #f3f4f6', color: '#1f2937', fontSize: '16px', fontWeight: '600', alignItems: 'center', textTransform: 'capitalize' },
  tableBodyRowMobile: { display: 'flex', padding: '12px 5px', borderBottom: '1px dashed #e5e7eb', color: '#1f2937', width: '100%', boxSizing: 'border-box' },
  thCell: { textAlign: 'left',fontsize: '16px', fontWeight: '600' },
  tdCell: { textAlign: 'left',fontsize: '16px', fontWeight: '600' },
  summaryContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: '25px', paddingRight: '15px', width: '100%', boxSizing: 'border-box' },
  summaryRow: { fontFamily: "'Poppins', sans-serif", display: 'grid', gridTemplateColumns: '120px 100px', textAlign: 'right', fontSize: '16px', color: '#4b5563' },
  summaryLabel: { fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: '#6b7280', fontSize: '16px' },
  summaryValue: { fontFamily: "'Poppins', sans-serif", fontWeight: '600', color: '#1f2937', fontSize: '16px' }
};

export default OrderDetailPage;
