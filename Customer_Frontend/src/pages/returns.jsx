import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { AuthProvider } from '../context/AuthContext'; 
import { StationeroNavbar } from './StationeroPage';

const ReturnsPage = () => {
  const navigate = useNavigate();

  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSubmitBtn, setHoveredSubmitBtn] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash Down');
  const [selectedFile, setSelectedFile] = useState(null);
  const [customerProfile, setCustomerProfile] = useState({ phone: '-', email: '', address: '-' });
  const [returnId, setReturnId] = useState('');
  const [invoiceList, setInvoiceList] = useState([]); 
  const [selectedInvoice, setSelectedInvoice] = useState(''); 
  const [availableProducts, setAvailableProducts] = useState([]); 
  const [maxQty, setMaxQty] = useState(0);

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

    if (!savedProfile || savedProfile === "undefined" || !activeEmail) {
      navigate('/login');
      return;
    }

    // 🌟 Profile ကို Axios ဖြင့် ခေါ်ယူခြင်း
    axios.get(`http://localhost:8000/api/customer/profile/${activeEmail}`)
      .then(res => {
        const data = res.data; // res.json() မလိုတော့ပါ
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

    // 🌟 Next Return ID ကို Axios ဖြင့် ခေါ်ယူခြင်း
    axios.get(`http://localhost:8000/api/order/next-return/${activeEmail}`)
      .then(res => {
        const data = res.data;
        if (data && data.return_id) {
          setReturnId(data.return_id);
        }
      })
      .catch(err => console.error("Error fetching dynamic return ID strings:", err));
     }, [navigate]);

    const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('customer_email', customerProfile.email);
      formData.append('product_name', productName);
      formData.append('qty', parseInt(quantity, 10) || 1);
      formData.append('reason', reason);
      formData.append('payment_method', paymentMethod);
      
      // 🌟 FIX: Append the invoice tracking parameter securely to the network request
      if (selectedInvoice) {
        formData.append('invoice_number', selectedInvoice.trim());
      }

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Send via Axios to your Python FastAPI backend
      const response = await axios.post('http://localhost:8000/api/order/return-status', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201) {
        navigate('/history');
      }
    } catch (error) {
      console.error("Return submission failed:", error);
      alert('Return submission failed. Please try again.');
    }
  };


  useEffect(() => {
    if (customerProfile && customerProfile.email) {
      axios.get(`http://localhost:8000/api/order/valid-return-invoices/${customerProfile.email.trim()}`)
        .then(res => {
          setInvoiceList(res.data.orders || []);
        })
        .catch(err => console.error("Error loading returnable invoices dropdown sets:", err));
    }
  }, [customerProfile]);


    const handleInvoiceChange = async (invoiceNum) => {
    setSelectedInvoice(invoiceNum);
    setAvailableProducts([]);
    setProductName('');
    setQuantity('0');
    setMaxQty(0);

    if (!invoiceNum) return;

    const selectedInvoiceNode = invoiceList.find(inv => inv.real_db_invoice === invoiceNum || inv.invoice_number === invoiceNum);
    const targetDbKey = selectedInvoiceNode ? selectedInvoiceNode.real_db_invoice : invoiceNum;

    try {
      const res = await axios.get(`http://localhost:8000/api/order/return-items-check/${targetDbKey}`);
      
      // ====== 🎯 🟢 FIXED: UNIVERSAL DATA MAPPING PARSER SECURED ======
      // ❌ items သက်သက်သာယူပြီး စျေးနှုန်းကျန်ရစ်ခဲ့သော စနစ်ဟောင်းအား ဖြုတ်ချ၍ 🟢 Backend မှ ကျလာသမျှသော Object fields အကုန်လုံး (selling_price ပါမကျန်) အား ကွက်တိ သိမ်းဆည်းလိုက်ခြင်းဖြစ်သည်
      const cleanItemsArray = res.data.items || (Array.isArray(res.data) ? res.data : []);
      setAvailableProducts(cleanItemsArray);
      
      console.log("🌟 Dynamic Product List with Selling Prices Loaded Success:", cleanItemsArray);
    } catch (err) {
      console.error("Error loading linked items for chosen invoice index:", err);
    }
  };



  const handleProductSelectionChange = (chosenProdName) => {
    setProductName(chosenProdName);
        const selectedItemNode = availableProducts.find(
      p => (p.name === chosenProdName || p.product_name === chosenProdName)
    );
    
    if (selectedItemNode) {
      const purchaseLimit = parseInt(selectedItemNode.qty, 10) || 0;
      setMaxQty(purchaseLimit);
      setQuantity(purchaseLimit.toString()); 
      console.log(`🌟 Dropdown Linked Success: Max returnable qty is now ${purchaseLimit}`);
    }
  };


  return (
    <div style={styles.container}>
      <StationeroNavbar showSearch={false} />
      <main style={styles.mainContent}>
        <h2 style={styles.mainHeading}>Order Return</h2>
        <form onSubmit={handleReturnSubmit} style={styles.formContainerCard}>
          <div style={styles.formGrid}>
            
            {/* Left Column Container Panel */}
            <div style={styles.formColumn}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Email</label>
                <input type="email" value={customerProfile.email} style={styles.inputFieldDisabled} readOnly />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input type="text" value={customerProfile.phone} style={styles.inputFieldDisabled} readOnly />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <input type="text" value={customerProfile.address} style={styles.inputFieldDisabled} readOnly />
              </div>
              
              {/* FIXED: Invoice ID Dropdown positioned directly above the Product Name link track */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Invoice ID</label>
                <select 
                  value={selectedInvoice} 
                  onChange={(e) => handleInvoiceChange(e.target.value)} 
                  style={styles.dropdownSelect}
                  disabled={invoiceList.length === 0}
                  required
                >
                  {invoiceList.length === 0 ? (
                    <option value="">No Order to Return</option>
                  ) : (
                    <>
                  <option value="">Select Invoice ID</option>
                  {invoiceList.map((inv, idx) => (
                    <option key={idx} value={inv.invoice_number}>{inv.invoice_number}</option>
                  ))}
                    </>
                  )}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Product Name</label>
                <select 
                  value={productName} 
                  onChange={(e) => handleProductSelectionChange(e.target.value)} 
                  style={styles.dropdownSelect}
                  disabled={!selectedInvoice}
                  required
                >
                  <option value="">Choose Product</option>
                  {availableProducts.map((prod, idx) => (
                    <option key={idx} value={prod.product_name}>{prod.product_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column Container Panel */}
            <div style={styles.formColumn}>          
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity {maxQty > 0 && `(Max Purchased: ${maxQty})`}</label>
                <input 
                  type="number" 
                  value={quantity} 
                  min={1}
                  max={maxQty}
                  onChange={(e) => {
                    const typedVal = parseInt(e.target.value, 10) || 0;
                    setQuantity(Math.min(typedVal, maxQty).toString());
                  }} 
                  placeholder="0" 
                  style={styles.inputField} 
                  disabled={!productName}
                  required 
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Reason For Return</label>
                <input 
                  type="text" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Enter the Reason" 
                  style={styles.inputField} 
                  required 
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Item Condition</label>
                <div style={styles.fileUploadWrapper}>
                  <input type="file" id="item-file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ display: 'none' }}required />
                  <label htmlFor="item-file" style={styles.fileLabelBtn}>Choose File</label>
                  <span style={styles.fileNameText}>{selectedFile ? selectedFile.name : 'No File Chosen'}</span>
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={styles.dropdownSelect}>
                  <option value="Cash Down">Cash Down</option>
                  <option value="KBZ Pay">KBZ Pay</option>
                  <option value="Wave Pay">Wave Pay</option>
                </select>
              </div>
              {productName && (parseInt(quantity, 10) >= 0) && (
  <div style={styles.inputGroup}>
    <label style={{ ...styles.label, color: '#555555' }}>Receive Amount</label>
    <div style={{ ...styles.label, color: '#d9383a', fontWeight: '805', fontSize: '18px', paddingTop: '6px' }}>
      {(() => {
        // 1. Find the selected item node
        const selectedItemNode = availableProducts.find(
          p => (p.name === productName || p.product_name === productName)
        );
        
        // 2. Find the selected invoice header to get global discounts
        const currentInvoiceHeader = invoiceList.find(
          inv => inv.invoice_number === selectedInvoice
        );
        
        const rawUnitPrice = selectedItemNode ? parseFloat(selectedItemNode.selling_price || 0) : 0;
        
        // Grab the global coupon details if they exist in your invoice list payload
        const globalDiscount = currentInvoiceHeader ? parseFloat(currentInvoiceHeader.discount || 0) : 0;
        const grossTotalAmount = currentInvoiceHeader ? parseFloat(currentInvoiceHeader.total_amount || 0) : 0;
        
        // 3. Calculate proportional unit price after discount
        let finalRefundUnitPrice = rawUnitPrice;
        if (globalDiscount > 0 && grossTotalAmount > 0) {
          const discountRatio = globalDiscount / grossTotalAmount;
          finalRefundUnitPrice = rawUnitPrice * (1 - discountRatio);
        }
        
        const returnQty = parseInt(quantity, 10) || 0;
        const totalRefund = returnQty * finalRefundUnitPrice;
        
        return (Math.round(totalRefund).toLocaleString() + " MMK");
      })()}
    </div>
  </div>
)}

              <div style={styles.actionRow}>
            <button
              type="submit"
              onMouseEnter={() => setHoveredSubmitBtn(true)}
              onMouseLeave={() => setHoveredSubmitBtn(false)}
              style={{
                ...styles.submitReturnBtn,
                ...(hoveredSubmitBtn ? styles.submitReturnBtnHover : {})
              }}
            >
              Return Order
            </button>
          </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '14px', transition: 'color 0.2s ease' },
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  mainContent: { padding: '40px', maxWidth: '1100px', margin: '0 auto' },
  mainHeading: { fontSize: '25px', fontWeight: 300, color: '#111', marginBottom: '20px', paddingLeft: '2px' },
  formContainerCard: { backgroundColor: '#ffffff', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #eeeeee' },
  formGrid: { display: 'flex', gap: '50px' },
  formColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }, // Gap ကို 24px သို့ တိုးမြှင့်လိုက်သဖြင့် စာသားချင်း လုံးဝမကပ်တော့ပါ
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '15px', fontWeight: 200, color: '#111'},
  inputField: { padding: '12px 18px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  dropdownSelect: { padding: '12px 18px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
  fileUploadWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '15px', padding: '6px 12px', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%', height: '47px' },
  hiddenFileInput: { display: 'none' },
  fileLabelBtn: { backgroundColor: '#e0e0e0', color: '#333', padding: '6px 15px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px', display: 'inline-block', border: '1px solid #adadad' },
  fileNameText: { fontSize: '13px', color: '#666' },
  actionRow: { marginTop: '16px', display: 'flex', justifyContent: 'flex-end', width: '100%' },
  submitReturnBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(242,82,120,0.2)', outline: 'none' },
  submitReturnBtnHover: { backgroundColor: '#e04167', boxShadow: '0 4px 15px rgba(242,82,120,0.3)' },
  textareaField: { padding: '12px 15px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff', outline: 'none', fontFamily: "'Poppins', sans-serif", resize: 'none' }, // မူရင်း borders အဝိုင်းပုံစံများအတိုင်း ညှိထားခြင်း
  inputFieldDisabled: { padding: '12px 18px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#f1f5f9', color: '#64748b', outline: 'none', cursor: 'not-allowed' }
};
export default ReturnsPage;