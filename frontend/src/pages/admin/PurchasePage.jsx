import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchasePage = ({ toggleSidebar }) => {
  const [orders, setOrders] = useState([]);
  const [returnedPoIds, setReturnedPoIds] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;


  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, returnsRes] = await Promise.all([
          axios.get('http://localhost:8000/purchase-orders'),
          axios.get('http://localhost:8000/purchase/returns') 
        ]);
        
        setOrders(ordersRes.data);
        const ids = returnsRes.data.map(r => r.purchase_order_id);
        setReturnedPoIds(ids);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:8000/purchase-orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.supplier?.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || order.purchase_order_status === statusFilter;
    const orderDate = new Date(order.purchase_order_date).toISOString().split('T')[0];
    const matchesStartDate = !startDate || orderDate >= startDate;
    const matchesEndDate = !endDate || orderDate <= endDate;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredOrders.length / recordsPerPage);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Full Width */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <button onClick={toggleSidebar} className="md:hidden text-gray-600 text-xl">
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="ml-auto w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500 cursor-pointer" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      {/* Main Container - Centered */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Page</h2>
          <button 
            onClick={() => navigate('/purchase/add')} 
            className="bg-[#F25278] text-white px-6 py-2.5 rounded-xl font-semibold"
          >
            + Add New Purchase Order
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Search</label>
              <input 
                type="text" 
                placeholder="PO number / Supplier" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-sm focus:border-gray-400" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white outline-none focus:border-gray-400" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 outline-none focus:border-gray-400" 
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) {
                    setEndDate(""); 
                  }
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
              <input 
                type="date" 
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 outline-none focus:border-gray-400" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>

            {/* Reset Button */}
            <button onClick={resetFilters} className="bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Reset Filters</button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-5 font-semibold text-gray-600">Purchase Order ID</th>
                <th className="p-5 font-semibold text-gray-600">Supplier Name</th>
                <th className="p-5 font-semibold text-gray-600">Status</th>
                <th className="p-5 font-semibold text-gray-600">Ordered Date</th>
                <th className="p-5 font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {currentRecords.length > 0 ? (
              currentRecords.map((order) => {
                const isReturned = returnedPoIds.includes(order.purchase_order_id);

                return (
                  <tr key={order.purchase_order_id} className="hover:bg-gray-50 transition">
                    <td className="p-5 text-gray-700">{order.po_number}</td>
                    <td className="p-5 text-gray-700">{order.supplier?.supplier_name}</td>
                    <td className="p-5 text-gray-700">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.purchase_order_status === 'Confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : order.purchase_order_status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {order.purchase_order_status}
                      </span>
                      {isReturned && (
                        <span className="block text-[10px] text-red-500 font-bold uppercase mt-1">
                          Already Returned
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-gray-700">
                      {new Date(order.purchase_order_date).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-5 flex justify-center items-center gap-4">
                      <button 
                        className={`text-sm underline transition-colors ${
                          (order.purchase_order_status === 'Confirmed' && !isReturned)
                            ? 'text-blue-700 hover:text-blue-900 cursor-pointer' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={order.purchase_order_status !== 'Confirmed' || isReturned}
                        onClick={() => {
                          navigate(`/purchase/returns/${order.purchase_order_id}`);
                        }}
                      >
                        {isReturned ? 'Returned' : 'Returns'}
                      </button>
                      <button 
                        onClick={() => navigate(`/purchase/details/${order.purchase_order_id}`)} 
                        className="text-[#405169] hover:text-[#2d3a4d] transition"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>             
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="5" className="p-10 text-center text-gray-500">No Data Found</td></tr>
            )}
          </tbody>
          </table>
        </div>

        {/* Pagination */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8 gap-2 pb-10">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
            {[...Array(nPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white' : 'bg-white'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchasePage;