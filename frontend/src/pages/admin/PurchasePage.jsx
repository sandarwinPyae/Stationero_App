import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchasePage = () => {
  const [orders, setOrders] = useState([]);
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


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Full Width */}
      <header className="h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm mb-8 w-full">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      {/* Main Container - Centered */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Page</h2>
          <button 
            onClick={() => navigate('/purchase/add')} 
            className="bg-[#F25278] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-pink-600 transition"
          >
            + Add New Purchase Order
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-end gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <input type="text" placeholder="PO ID or Supplier name" className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
            <input type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500" onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">End Date</label>
            <input type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500" onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
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
                currentRecords.map((order) => (
                  <tr key={order.purchase_order_id} className="hover:bg-gray-50 transition">
                    <td className="p-5 text-gray-700">{order.po_number}</td>
                    <td className="p-5 text-gray-700">{order.supplier?.supplier_name}</td>
                    <td className="p-5 text-gray-700">{order.purchase_order_status}</td>
                    <td className="p-5 text-gray-700">
                      {new Date(order.purchase_order_date).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-5 flex justify-center items-center gap-4">
                      <button className="text-[#F25278] underline text-sm hover:text-pink-600">Returns</button>
                      <button 
                        onClick={() => navigate(`/purchase/details/${order.purchase_order_id}`)} 
                        className="text-[#405169] hover:text-[#2d3a4d] transition"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>              
                    </td>
                  </tr>
                ))
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