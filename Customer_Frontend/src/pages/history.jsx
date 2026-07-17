import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 useNavigate ထည့်သွင်းထားသည်
import axios from 'axios';
import { StationeroNavbar } from './StationeroPage'; 
import { AuthProvider } from '../context/AuthContext';
const OrderHistoryPage = () => {
  const navigate = useNavigate(); // 🌟 navigate သို့ ပြောင်းလဲထားသည်
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);  
  const [hoveredLink, setHoveredLink] = useState(null);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [hoveredSubmitBtn, setHoveredSubmitBtn] = useState(false);
  const [typedSearch, setTypedSearch] = useState('');
  const [typedStartDate, setTypedStartDate] = useState('');
  const [typedEndDate, setTypedEndDate] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeStartDate, setActiveStartDate] = useState('');
  const [activeEndDate, setActiveEndDate] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('stationero_logged_user');
    let activeEmail = '';
    if (savedProfile) {
      try {
        const parsedUser = JSON.parse(savedProfile);
        activeEmail = (parsedUser.email || parsedUser.user_email || '').trim();
      } catch (e) {
        console.error(e);
      }
    }

    if (!activeEmail) {
      navigate('/login');
      return;
    }




    // 🌟 Axios သုံးပြီး Data ဆွဲထုတ်ခြင်း
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/order/history-logs/${activeEmail}`);
        if (response.data.orders) setOrders(response.data.orders);
        if (response.data.returns) setReturns(response.data.returns);
      } catch (err) {
        console.error("History fetch error:", err)
      }
    };


    fetchHistory();
  }, [navigate]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1);
    setTypedSearch('');
    setTypedStartDate('');
    setTypedEndDate('');
    setActiveSearch('');
    setActiveStartDate('');
    setActiveEndDate('');
  };

  const handleSearchTrigger = () => {
    setActiveSearch(typedSearch);
    setActiveStartDate(typedStartDate);
    setActiveEndDate(typedEndDate);
    setCurrentPage(1);
  };

  const activeRecordsSource = activeTab === 'All' ? orders : returns;

const filteredRecords = activeRecordsSource.filter(record => {
    if (typedSearch) {
      const lowerSearch = typedSearch.toLowerCase().trim().replace(/,/g, '');
      const lowerInvoiceId = (record.invoice_number || '').toString().toLowerCase();
      const lowerStatus = (record.status || '').toString().toLowerCase();
      const lowerPaymentMethod = (record.payment_method || record.sale_return_payment_method || '').toString().toLowerCase();
      const lowerTotalAmount = (record.total_amount || record.total_returned_amount || '').toString().toLowerCase().replace(/,/g, '');
      const textMatch = lowerInvoiceId.includes(lowerSearch) || lowerStatus.includes(lowerSearch) || lowerPaymentMethod.includes(lowerSearch) || lowerTotalAmount.includes(lowerSearch);
      if (!textMatch) return false;
    }

    const explicitDateString = record.order_date || record.sale_return_date;
    if (typedStartDate || typedEndDate) {
      if (explicitDateString && explicitDateString !== "-") {
        const recordTimestamp = new Date(explicitDateString).getTime();

        if (typedStartDate) {
          const startLimit = new Date(typedStartDate).setHours(0, 0, 0, 0);
          if (recordTimestamp < startLimit) return false;
        }

        if (typedEndDate) {
          const endLimit = new Date(typedEndDate).setHours(23, 59, 59, 999);
          if (recordTimestamp > endLimit) return false;
        }
      } else {
        return false;
      }
    }
    return true;
});


  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecordsView = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPagesCount = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
  const todayLimitString = new Date().toISOString().split('T')[0];

return (
    <div style={styles.container}>
      <AuthProvider>
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <StationeroNavbar showSearch={false} />
        </div>
      </AuthProvider>
      <main style={isMobile ? styles.mainContentMobile : styles.mainContent}>
        <h1 style={styles.mainHeading}>History</h1>

        <div style={isMobile ? styles.filterControlPanelMobile : styles.filterControlPanel}>
          <div style={styles.toggleTabsCluster}>
            <span onClick={() => handleTabChange('All')} style={{ ...styles.toggleTabItem, ...(activeTab === 'All' ? styles.activeToggleTab : {}) }}>
              All Orders ({orders.length})
            </span>
            <span onClick={() => handleTabChange('Returned')} style={{ ...styles.toggleTabItem, ...(activeTab === 'Returned' ? styles.activeToggleTab : {}) }}>
              Returned ({returns.length})
            </span>
          </div>

          <input
            type="text"
            placeholder="Search Invoice / ID..."
            value={typedSearch}
            onChange={(e) => { setTypedSearch(e.target.value); setCurrentPage(1); }}
            style={isMobile ? { ...styles.textInputFilter, width: '100%' } : styles.textInputFilter}
          />
          
          <div style={isMobile ? styles.dateInputsContainerMobile : { display: 'contents' }}>
            <input 
              type="date" 
              value={typedStartDate} 
              max={todayLimitString} 
              onChange={(e) => { setTypedStartDate(e.target.value); setCurrentPage(1); }} 
              style={isMobile ? { ...styles.dateInputFilter, flex: 1 } : styles.dateInputFilter} 
            />
            
            <input 
              type="date" 
              value={typedEndDate} 
              min={typedStartDate}
              max={todayLimitString} 
              onChange={(e) => { setTypedEndDate(e.target.value); setCurrentPage(1); }} 
              style={isMobile ? { ...styles.dateInputFilter, flex: 1 } : styles.dateInputFilter} 
            />
          </div>
        </div>

        <div style={styles.tableWrapper}>
          {/* 👈 Hidden on smartphone displays to save core content workspace */}
          <div style={{ ...styles.tableHeaderRow, display: isMobile ? 'none' : 'flex' }}>
            <span style={{ flex: 1.5 }}>{activeTab === 'All' ? 'Invoice Number' : 'Return ID'}</span>
            <span style={{ flex: 1.2 }}>Status</span>
            <span style={{ flex: 1.2 }}>Total Amount</span>
            <span style={{ flex: 1.5 }}>Payment Method</span>
            <span style={{ flex: 1.8 }}>{activeTab === 'All' ? 'Sale Date' : 'Transaction Date'}</span>
            {activeTab === 'All' && <span style={{ flex: 0.6, textAlign: 'center' }}>Action</span>}
          </div>

          {currentRecordsView.length === 0 ? (
            <div style={styles.emptyNotificationBlock}>No verified logs found matching current search terms.</div>
          ) : (
            currentRecordsView.map((record, idx) => {
              const grossAmount = record.total_amount ? Number(record.total_amount) : 0;
              const discountAmount = record.discount ? Number(record.discount) : 0;
              const customerPaidNetAmount = grossAmount - discountAmount;

              return isMobile ? (
                /* 📱 Mobile Formatted History Entry Layout Card */
                <div key={idx} style={styles.tableBodyRowMobile}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid #f5f5f5', paddingBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: activeTab === 'Returned' ? '#d9383a' : '#111' }}>{record.invoice_number}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: record.status === 'Returned' ? '#d9383a' : record.status === 'Pending' ? '#d97706' : '#2b6cb0' }}>{record.status}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '13px', color: '#444' }}>
                    <span>Amount: <strong>{customerPaidNetAmount.toLocaleString()} MMK</strong></span>
                    <span>{record.payment_method}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '12px', color: '#777', marginTop: '2px' }}>
                    <span>{record.order_date || record.sale_return_date}</span>
                    {activeTab === 'All' && (
                      <button
                        type="button"
                        onClick={() => navigate(`/order/${record.sale_order_id || record.id}`)}
                        style={{ background: '#fdf2f4', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px 12px', color: '#f25278', borderRadius: '15px', fontWeight: 'bold', outline: 'none' }}
                      >
                        Details 👁
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* 💻 Desktop Default Table Grid Line Items Structure */
                <div key={idx} style={styles.tableBodyRow}>
                  <span style={{ flex: 1.5, fontWeight: 'bold', color: activeTab === 'Returned' ? '#d9383a' : '#111' }}>{record.invoice_number}</span>
                  <span style={{ flex: 1.2, fontWeight: 'bold', color: record.status === 'Returned' ? '#d9383a' : record.status === 'Pending' ? '#d97706' : '#2b6cb0' }}>{record.status}</span>
                  <span style={{ flex: 1.2 }}>{customerPaidNetAmount.toLocaleString()} MMK</span>
                  <span style={{ flex: 1.5, color: '#444' }}>{record.payment_method}</span>
                  <span style={{ flex: 1.8, color: '#777', fontSize: '13px' }}>{record.order_date || record.sale_return_date}</span>
                  {activeTab === 'All' && (
                    <span style={{ flex: 0.6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/order/${record.sale_order_id || record.id}`)}
                        title="View Details"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '4px', color: '#f25278', outline: 'none' }}
                      >
                        👁
                      </button>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>  

        {filteredRecords.length > 5 && (
          <div style={styles.paginationDockRow}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              style={styles.arrowPaginationBtn}
            >
              ◀
            </button>
            
            {[...Array(totalPagesCount)].map((_, pIdx) => (
              <button 
                key={pIdx} 
                onClick={() => setCurrentPage(pIdx + 1)} 
                style={{ 
                  ...styles.numberPaginationBtn, 
                  ...(currentPage === pIdx + 1 ? styles.activeNumberPaginationBtn : {}) 
                }}
              >
                {pIdx + 1}
              </button>
            ))}
            
            <button 
              disabled={currentPage === totalPagesCount} 
              onClick={() => setCurrentPage(prev => Math.min(totalPagesCount, prev + 1))} 
              style={styles.arrowPaginationBtn}
            >
              ▶
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#333', fontSize: '14px', transition: 'color 0.2s ease' },
  activeLink: { color: '#f25278', fontWeight: 'bold' },
  mainContent: { padding: '40px 50px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', boxSizing: 'border-box' },
  mainContentMobile: { padding: '20px min(15px, 4%)', maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' },
  mainHeading: { fontSize: '25px', color: '#111', fontWeight: 300, margin: 0 },
  filterControlPanel: { display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '15px', border: '1px solid #f0f0f0' },
  filterControlPanelMobile: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #f0f0f0', width: '100%', boxSizing: 'border-box' },
  toggleTabsCluster: { display: 'flex', gap: '20px', fontSize: '15px', marginRight: '10px', flexWrap: 'wrap' },
  toggleTabItem: { cursor: 'pointer', color: '#777', transition: 'all 0.2s ease', fontWeight: '500' },
  activeToggleTab: { color: '#f25278', fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: '6px' },
  textInputFilter: { padding: '10px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f7fafc', fontSize: '15px', outline: 'none', width: '160px', boxSizing: 'border-box' },
  dateInputFilter: { padding: '9px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f7fafc', fontSize: '15px', outline: 'none', color: '#4a5568', cursor: 'pointer', boxSizing: 'border-box' },
  dateInputsContainerMobile: { display: 'flex', gap: '10px', width: '100%', boxSizing: 'border-box' },
  searchActionBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '15px', fontSize: '15px', fontWeight: 200, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(242,82,120,0.15)', outline: 'none' },
  searchActionBtnHover: { backgroundColor: '#e04167', boxShadow: '0 4px 12px rgba(242,82,120,0.25)' },
  tableWrapper: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' },
  tableHeaderRow: { display: 'flex', backgroundColor: '#eeeeee', padding: '16px 25px', borderRadius: '15px', fontWeight: 200, color: '#2d3748', fontSize: '15px' },
  tableBodyRow: { display: 'flex', backgroundColor: '#fff', padding: '20px 25px', borderRadius: '12px', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', border: '1px solid #f0f0f0', fontSize: '15px', color: '#2d3748' },
  tableBodyRowMobile: { display: 'flex', flexDirection: 'column', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', alignItems: 'stretch', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0', gap: '10px', width: '100%', boxSizing: 'border-box' },
  emptyNotificationBlock: { backgroundColor: '#fff', padding: '30px', textAlign: 'center', borderRadius: '12px', color: '#718096', border: '1px dashed #cbd5e0', width: '100%', boxSizing: 'border-box' },
  paginationDockRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
  arrowPaginationBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#f25278', cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', transition: 'all 0.2s ease', backgroundColor: '#fff' },
  numberPaginationBtn: { border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', color: '#4a5568', cursor: 'pointer', padding: '8px 14px', fontSize: '15px', fontWeight: 200, transition: 'all 0.2s ease' },
  activeNumberPaginationBtn: { backgroundColor: '#f25278', color: '#fff', border: '1px solid #f25278' },
  submitReturnBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '25px', fontSize: '15px', fontWeight: 200, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(242,82,120,0.2)', outline: 'none' },
  submitReturnBtnHover: { backgroundColor: '#e04167', boxShadow: '0 4px 15px rgba(242,82,120,0.3)' }
};
export default OrderHistoryPage;