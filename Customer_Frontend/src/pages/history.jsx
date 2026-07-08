import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 useNavigate ထည့်သွင်းထားသည်
import axios from 'axios';
const OrderHistoryPage = () => {
  const navigate = useNavigate(); // 🌟 navigate သို့ ပြောင်းလဲထားသည်

  const [hoveredLink, setHoveredLink] = useState(null);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [typedSearch, setTypedSearch] = useState('');
  const [typedStartDate, setTypedStartDate] = useState('');
  const [typedEndDate, setTypedEndDate] = useState('');

  const [activeSearch, setActiveSearch] = useState('');
  const [activeStartDate, setActiveStartDate] = useState('');
  const [activeEndDate, setActiveEndDate] = useState('');

  // 🌟 path များ မှန်ကန်အောင် ပြင်ဆင်ထားသည်
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Product', path: '/product' },
    { label: 'Shopping Cart', path: '/cart' },
    { label: 'Order', path: '/order' },
    { label: 'Returns', path: '/returns' },
    { label: 'History', path: '/history', isHistoryPage: true },
    { label: 'Profile', path: '/profile' }
  ];

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
    // 🌟 Search Filter (Case-insensitive)
    let matchesSearch = true; // ဒီမှာ Variable ကို အရင်သတ်မှတ်ပေးရပါမယ်
    if (activeSearch) {
      const lowerSearch = activeSearch.toLowerCase().trim();
      const lowerInvoiceId = (record.invoice_number || '').toString().toLowerCase();
      const lowerStatus = (record.status || '').toString().toLowerCase();

      matchesSearch = lowerInvoiceId.includes(lowerSearch) || lowerStatus.includes(lowerSearch);
    }
    // 🌟 Date Filter
    let matchesDate = true;
    if (activeStartDate || activeEndDate) {
      const recordDate = new Date(record.order_date);
      recordDate.setHours(0, 0, 0, 0); // အချိန်ကို ဖြုတ်ထားပါ

      if (activeStartDate) {
        const start = new Date(activeStartDate);
        if (recordDate < start) matchesDate = false;
      }
      if (activeEndDate) {
        const end = new Date(activeEndDate);
        if (recordDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecordsView = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPagesCount = Math.ceil(filteredRecords.length / recordsPerPage) || 1;

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          {navItems.map((item, index) => (
            <span
              key={index}
              onClick={() => navigate(item.path)} // 🌟 navigate ချိတ်ဆက်ထားသည်
              style={{ ...styles.link, ...(item.isHistoryPage ? styles.activeLink : {}) }}
            >
              {item.label}
            </span>
          ))}
          <span onClick={() => navigate('/login')} style={styles.link}>Logout</span>
        </nav>
      </header>

      <main style={styles.mainContent}>
        <h1 style={styles.mainHeading}>Orders History</h1>

        <div style={styles.filterControlPanel}>
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
            onChange={(e) => setTypedSearch(e.target.value)}
            style={styles.textInputFilter}
          />
          <input type="date" value={typedStartDate} onChange={(e) => setTypedStartDate(e.target.value)} style={styles.dateInputFilter} />
          <input type="date" value={typedEndDate} onChange={(e) => setTypedEndDate(e.target.value)} style={styles.dateInputFilter} />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault(); // 🌟 Form submit ဖြစ်မှာကို တားဆီးပေးခြင်း
              handleSearchTrigger();
            }}
            style={styles.searchActionBtn}
          >
            Search
          </button>
        </div>

        <div style={styles.tableWrapper}>
          <div style={styles.tableHeaderRow}>
            <span style={{ flex: 1.5 }}>{activeTab === 'All' ? 'Invoice Number' : 'Return ID'}</span>
            <span style={{ flex: 1.2 }}>Status</span>
            <span style={{ flex: 1.2 }}>Total Amount</span>
            <span style={{ flex: 1.5 }}>Payment Method</span>
            <span style={{ flex: 1.8 }}>{activeTab === 'All' ? 'Sale Date' : 'Transaction Date'}</span>
          </div>

          {currentRecordsView.length === 0 ? (
            <div style={styles.emptyNotificationBlock}>No verified logs found matching current search terms.</div>
          ) : (
            currentRecordsView.map((record, idx) => (
              <div key={idx} style={styles.tableBodyRow}>
                <span style={{ flex: 1.5, fontWeight: 'bold', color: activeTab === 'Returned' ? '#d9383a' : '#111' }}>{record.invoice_number}</span>
                <span style={{ flex: 1.2, fontWeight: 'bold', color: record.status === 'Returned' ? '#d9383a' : record.status === 'Pending' ? '#d97706' : '#2b6cb0' }}>{record.status}</span>
                <span style={{ flex: 1.2 }}>{record.total_amount.toLocaleString()} MMK</span>
                <span style={{ flex: 1.5, color: '#444' }}>{record.payment_method}</span>
                <span style={{ flex: 1.8, color: '#777', fontSize: '13px' }}>{record.order_date}</span>
              </div>
            ))
          )}
        </div>

        <div style={styles.paginationDockRow}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} style={styles.arrowPaginationBtn}>&#9664;</button>
          {[...Array(totalPagesCount)].map((_, pIdx) => (
            <button key={pIdx} onClick={() => setCurrentPage(pIdx + 1)} style={{ ...styles.numberPaginationBtn, ...(currentPage === pIdx + 1 ? styles.activeNumberPaginationBtn : {}) }}>{pIdx + 1}</button>
          ))}
          <button disabled={currentPage === totalPagesCount} onClick={() => setCurrentPage(prev => Math.min(totalPagesCount, prev + 1))} style={styles.arrowPaginationBtn}>&#9654;</button>
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
  mainContent: { padding: '40px 60px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' },
  mainHeading: { fontSize: '22px', color: '#111', fontWeight: 'bold', margin: 0 },
  filterControlPanel: { display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '15px', border: '1px solid #f0f0f0' },
  toggleTabsCluster: { display: 'flex', gap: '20px', fontSize: '14px', marginRight: '10px' },
  toggleTabItem: { cursor: 'pointer', color: '#777', transition: 'all 0.2s ease', fontWeight: '500' },
  activeToggleTab: { color: '#f25278', fontWeight: 'bold', textDecoration: 'underline', textUnderlineOffset: '6px' },
  textInputFilter: { padding: '10px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f7fafc', fontSize: '13px', outline: 'none', width: '160px' },
  dateInputFilter: { padding: '9px 15px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: '#f7fafc', fontSize: '13px', outline: 'none', color: '#4a5568', cursor: 'pointer' },
  searchActionBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '15px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(242,82,120,0.15)', outline: 'none' },
  searchActionBtnHover: { backgroundColor: '#e04167', boxShadow: '0 4px 12px rgba(242,82,120,0.25)' },
  tableWrapper: { display: 'flex', flexDirection: 'column', gap: '12px' },
  tableHeaderRow: { display: 'flex', backgroundColor: '#eeeeee', padding: '16px 25px', borderRadius: '15px', fontWeight: 'bold', color: '#2d3748', fontSize: '14px' },
  tableBodyRow: { display: 'flex', backgroundColor: '#fff', padding: '20px 25px', borderRadius: '12px', alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', border: '1px solid #f0f0f0', fontSize: '14px', color: '#2d3748' },
  emptyNotificationBlock: { backgroundColor: '#fff', padding: '30px', textAlign: 'center', borderRadius: '12px', color: '#718096', border: '1px dashed #cbd5e0' },
  paginationDockRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' },
  arrowPaginationBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#f25278', cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', transition: 'all 0.2s ease', backgroundColor: '#fff' },
  numberPaginationBtn: { border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', color: '#4a5568', cursor: 'pointer', padding: '8px 14px', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s ease' },
  activeNumberPaginationBtn: { backgroundColor: '#f25278', color: '#fff', border: '1px solid #f25278' }
};
export default OrderHistoryPage;