import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PurchaseSummary = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const recordsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/purchase-reports')
      .then(res => { setPurchases(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Filter Reset Function
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const filteredData = purchases.filter(p => {
    const matchesSearch = p.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.supplier?.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || p.purchase_order_status === statusFilter;
    const orderDate = new Date(p.purchase_order_date).toISOString().split('T')[0];
    const matchesStartDate = !startDate || orderDate >= startDate;
    const matchesEndDate = !endDate || orderDate <= endDate;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);
  const nPages = Math.ceil(filteredData.length / recordsPerPage);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] border-b border-gray-200 shadow-sm w-full mb-8">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      <div className="px-8 pb-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Purchase Order Summary Report</h2>

        {/* Filter Bar with Reset */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
  
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
            <input type="text" value={searchTerm} placeholder="Invoice / Customer" className="p-2 border rounded-lg" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
            <select value={statusFilter} className="p-2 border rounded-lg" onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
            <input type="date" value={startDate} className="p-2 border rounded-lg" onChange={(e) => setStartDate(e.target.value)} />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
            <input type="date" value={endDate} className="p-2 border rounded-lg" onChange={(e) => setEndDate(e.target.value)} />
          </div>

          {/* Reset Button */}
          <button 
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {currentRecords.length > 0 ? (
                <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="p-5">PO Number</th>
                    <th className="p-5">Supplier</th>
                    <th className="p-5">Total Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRecords.map((p) => (
                    <React.Fragment key={p.purchase_order_id}>
                        <tr onClick={() => setSelectedId(selectedId === p.purchase_order_id ? null : p.purchase_order_id)} 
                            className="cursor-pointer hover:bg-gray-50 border-b">
                        <td className="p-5 font-medium">{p.po_number}</td>
                        <td className="p-5">{p.supplier?.supplier_name}</td>
                        <td className="p-5">{p.total_amount.toLocaleString()} Ks</td>
                        <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                p.purchase_order_status === 'Confirmed' 
                                ? 'bg-green-100 text-green-700' 
                                : p.purchase_order_status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {p.purchase_order_status}
                            </span>
                        </td>
                        <td className="p-5">{new Date(p.purchase_order_date).toLocaleDateString()}</td>
                        </tr>
                        {selectedId === p.purchase_order_id && (
                        <tr className="bg-gray-50">
                            <td colSpan="5" className="p-6">
                            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                                <table className="w-full text-sm">
                                <thead className="bg-gray-100 text-gray-600">
                                    <tr>
                                    <th className="p-3 text-left">Product Name</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {p.details.map(d => (
                                    <tr key={d.purchase_order_details_id} className="hover:bg-gray-50">
                                        <td className="p-3">{d.product?.product_name}</td>
                                        <td className="p-3 text-center">{d.qty}</td>
                                        <td className="p-3 text-right">{d.unit_price.toLocaleString()} Ks</td>
                                        <td className="p-3 text-right font-semibold">{d.sub_total.toLocaleString()} Ks</td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                            </td>
                        </tr>
                        )}
                    </React.Fragment>
                    ))}
                </tbody>
                </table>
            ) : (
                <div className="p-10 text-center text-gray-500 font-medium">
                <i className="fa-solid fa-magnifying-glass text-3xl mb-3 block opacity-50"></i>
                No matching records found.
                </div>
            )}
            </div>
        {/* Pagination */}
        {nPages > 1 && (

          <div className="flex justify-center mt-8 gap-2">

            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>

            {[...Array(nPages)].map((_, i) => (

              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>

            ))}

            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>

          </div>

        )}
      </div>
    </div>
  );
};

export default PurchaseSummary;