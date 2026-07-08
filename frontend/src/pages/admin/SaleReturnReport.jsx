import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SaleReturnReport = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8; // တစ်မျက်နှာမှာ 8 ခုပြမယ်

  useEffect(() => {
    axios.get('http://localhost:8000/sale-return-reports')
      .then(res => { setReturns(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Filter Logic
  const filteredData = returns.filter(s => {
    // 1. Search Logic
    const matchesSearch = s.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.return_reason.toLowerCase().includes(searchTerm.toLowerCase());


    const itemDateStr = s.sale_return_date.substring(0, 10); 
    
    // 3. Date Comparison Logic
    const matchesStartDate = !startDate || itemDateStr >= startDate;
    const matchesEndDate = !endDate || itemDateStr <= endDate;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });
  // Pagination Logic
  const nPages = Math.ceil(filteredData.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-16 flex justify-end items-center px-8 bg-gray-50 border-b border-gray-200">
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Sale Return Report</h2>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
            <input type="text" placeholder="Invoice / Reason" className="p-2 border rounded-lg" onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}} value={searchTerm} />
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {currentRecords.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="py-4 px-6 font-semibold">Invoice</th>
                  <th className="py-4 px-6 font-semibold">Return Amount (Ks)</th>
                  <th className="py-4 px-6 font-semibold">Payment Method</th>
                  <th className="py-4 px-6 font-semibold">Reason</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((s) => (
                  <React.Fragment key={s.sale_return_id}>
                    <tr className="cursor-pointer hover:bg-gray-50 border-b transition-colors" onClick={() => setSelectedId(selectedId === s.sale_return_id ? null : s.sale_return_id)}>
                      <td className="p-4 font-bold text-blue-600">{s.invoice_number}</td>
                      <td className="p-4 font-semibold">{s.total_returned_amount.toLocaleString()}</td>
                      <td className="p-4 text-gray-600">{s.sale_return_payment_method}</td>
                      <td className="p-4 text-gray-600">{s.return_reason}</td>
                      <td className="p-4 text-gray-500">{new Date(s.sale_return_date).toLocaleDateString()}</td>
                    </tr>
                    {selectedId === s.sale_return_id && (
                      <tr>
                        <td colSpan="5" className="p-4 bg-gray-50">
                          <table className="w-full text-xs bg-white border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr className="text-gray-600">
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Selling Price</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                
                                </tr>
                            </thead>
                            <tbody className="divide-y">{s.details.map((d, i) => (
                              <tr key={i}>
                                <td className="p-3">{d.product_name}</td>
                                <td className="p-3">{d.selling_price}</td>
                                <td className="p-3 text-center">{d.qty}</td>
                                <td className="p-3 text-right font-bold">
                                  {d.sub_total.toLocaleString()}
                                </td>
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
          <div className="flex justify-center mt-6 gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"><i className="fa-solid fa-chevron-left"></i></button>
            {[...Array(nPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white' : 'bg-white hover:bg-gray-50'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleReturnReport;