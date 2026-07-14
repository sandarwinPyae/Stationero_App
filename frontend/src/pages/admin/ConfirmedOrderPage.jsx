import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmedOrderPage = () => {
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
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirmed Orders</h2>

          {/* Filter Bar */}
          <div className="flex items-end gap-4 mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Search</label>
            <input 
              type="text" 
              placeholder="Invoice ID or Customer name" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Status</label>
            <select 
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white focus:ring-2 focus:ring-blue-100" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-100" 
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value > endDate) {
                  setEndDate(""); 
                }
              }}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase">End Date</label>
            <input 
              type="date" 
              value={endDate}
              min={startDate}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-100" 
              onChange={(e) => setEndDate(e.target.value)} 
              
            />
          </div>

          {/* Reset Filter Button */}
          <button 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setStartDate("");
              setEndDate("");
            }}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
          >
            Reset Filter
          </button>
        </div>
          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="py-4 px-6 font-semibold">Invoice ID</th>
                  <th className="py-4 px-6 font-semibold">Customer Name</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold">Ordered Date</th>
                  <th className="py-4 px-6 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecords.length > 0 ? (
                  currentRecords.map((order) => (
                    <tr key={order.sale_order_id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-800">{order.invoice_number}</td>
                      <td className="py-4 px-6">{order.customer?.customer_name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          order.status === 'Confirmed' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : order.status === 'Pending' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100' 
                            : 'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(order.order_date).toLocaleString('en-GB', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit' 
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => navigate(`/confirm-orders/details/${order.sale_order_id}`)}
                          className="text-[#405169] hover:text-[#2d3a4d] transition">
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">No data found</td>
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