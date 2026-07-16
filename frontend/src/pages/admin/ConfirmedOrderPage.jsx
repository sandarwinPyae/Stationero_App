import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmedOrderPage = ({toggleSidebar}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:8000/confirm-orders');
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No Data and Check backend server");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const filteredOrders = orders.filter((order) => {
    const invoiceNum = order.invoice_number?.toString() || '';
    const customerName = order.customer?.customer_name?.toLowerCase() || '';

    const matchesSearch =
      invoiceNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || order.status === statusFilter;

    const orderDateStr = order.order_date ? order.order_date.split('T')[0] : ''; 

    const matchesDate = (!startDate || orderDateStr >= startDate) && 
                        (!endDate || orderDateStr <= endDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredOrders.length / recordsPerPage);

  if (loading) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );


  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <button 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          onClick={toggleSidebar} 
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
        <div className="ml-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 pt-20 md:pt-20 w-full max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirmed Orders</h2>

          {/* Filter Bar - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 items-end">
            <div className="lg:col-span-1 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Search</label>
              <input type="text" placeholder="Invoice ID or Customer" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Status</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Start Date</label>
              <input type="date" value={startDate} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-600" onChange={(e) => setStartDate(e.target.value)} />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">End Date</label>
              <input type="date" value={endDate} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-600" onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <button onClick={() => { setSearchTerm(""); setStatusFilter(""); setStartDate(""); setEndDate(""); }} className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg">
              Reset
            </button>
          </div>

          {/* Data Table - Overflow handling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="py-4 px-6">Invoice ID</th>
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Ordered Date</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {currentRecords.length > 0 ? (
                currentRecords.map((order) => (
                  <tr key={order.sale_order_id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">{order.invoice_number}</td>
                    <td className="py-4 px-6">{order.customer?.customer_name}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'Confirmed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {new Date(order.order_date).toLocaleString('en-GB')}
                    </td>
                    <td className="py-4 px-6">
                      <button onClick={() => navigate(`/confirm-orders/details/${order.sale_order_id}`)} className="text-[#405169]">
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Data မရှိရင် ဒီအပိုင်းက ပေါ်လာပါမယ်
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-500 font-medium">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>

          {/* Pagination */}
          {nPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"><i className="fa-solid fa-chevron-left"></i></button>
              {[...Array(nPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg transition-all ${currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278]' : 'bg-white border-gray-200 hover:border-blue-300'}`}>{i + 1}</button>
              ))}
              <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ConfirmedOrderPage;