import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SaleReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/sale-reports')
      .then(res => { setSales(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const filteredData = sales.filter(s => {
    // 1. Search & Status Logic
    const matchesSearch = s.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || s.status === statusFilter;


    const itemDateStr = s.order_date.substring(0, 10); // "2026-07-05" ဖြစ်သွားပါမယ်

    const matchesStartDate = !startDate || itemDateStr >= startDate;
    const matchesEndDate = !endDate || itemDateStr <= endDate;
    
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const nPages = Math.ceil(filteredData.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full Width */}
      <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] border-b border-gray-200 shadow-sm w-full">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      {/* Main Content with Padding */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Sale Report</h2>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
            <input type="text" placeholder="Invoice / Customer" className="p-2 border rounded-lg" onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}} value={searchTerm} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
            <select className="p-2 border rounded-lg" onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1)}} value={statusFilter}>
              <option value="">All</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
            <input type="date" className="p-2 border rounded-lg" onChange={(e) => setStartDate(e.target.value)} value={startDate} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
            <input type="date" className="p-2 border rounded-lg" onChange={(e) => setEndDate(e.target.value)} value={endDate} />
          </div>
          <button onClick={resetFilters} className="bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Reset Filters</button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          {currentRecords.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-5">Invoice</th>
                  <th className="p-5">Customer</th>
                  <th className="p-5">Amount (Ks)</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((s) => (
                  <React.Fragment key={s.sale_order_id}>
                    <tr className="cursor-pointer hover:bg-gray-50 border-b" onClick={() => setSelectedId(selectedId === s.sale_order_id ? null : s.sale_order_id)}>
                      <td className="p-5 font-medium">{s.invoice_number}</td>
                      <td className="p-5">{s.customer_name}</td>
                      <td className="p-5">{s.total_amount.toLocaleString()}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</span>
                      </td>
                      <td className="p-5">{new Date(s.order_date).toLocaleDateString()}</td>
                    </tr>
                    {selectedId === s.sale_order_id && (
                      <tr>
                        <td colSpan="5" className="p-4 bg-gray-50">
                          <table className="w-full text-sm bg-white rounded-xl shadow-sm border">
                            <thead className="bg-gray-100"><tr className="text-gray-600"><th className="p-3">Product</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Subtotal</th></tr></thead>
                            <tbody className="divide-y">{s.details.map((d, i) => (
                              <tr key={i}>
                                <td className="p-3">{d.product_name}</td>
                                <td className="p-3 text-center">{d.qty}</td>
                                <td className="p-3 text-right">{d.selling_price.toLocaleString()}</td>
                                <td className="p-3 text-right font-semibold">{d.sub_total.toLocaleString()}</td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : <div className="p-10 text-center text-gray-500">No matching records found.</div>}
        </div>

        {/* Pagination */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
            {[...Array(nPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white' : 'bg-white'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleReport;