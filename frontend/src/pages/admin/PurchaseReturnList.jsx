import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PurchaseReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await axios.get('http://localhost:8000/purchase/returns');
      console.log("API Response:", res.data);
      setReturns(res.data);
    } catch (err) {
      console.error("Error fetching returns:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredReturns = returns.filter((ret) => {
  // Search Logic (null/undefined safety)
    const poNumber = ret.purchase_order?.po_number?.toString().toLowerCase() || "";
    const supplierName = ret.purchase_order?.supplier?.supplier_name?.toLowerCase() || "";
    const matchesSearch = 
        poNumber.includes(searchTerm.toLowerCase()) || 
        supplierName.includes(searchTerm.toLowerCase());

    // Date Logic
    const returnDate = new Date(ret.purchase_return_date);
    const matchesStartDate = !startDate || returnDate >= new Date(startDate);
    const matchesEndDate = !endDate || returnDate <= new Date(endDate);
    
    return matchesSearch && matchesStartDate && matchesEndDate;
    });

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReturns.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredReturns.length / recordsPerPage);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between px-4 py-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => navigate('/purchase')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500 text-sm"></i>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Purchase Return List</h2>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Search</label>
            <input 
              type="text" 
              placeholder="PO ID or Supplier name" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#F25278] transition" 
              value={searchTerm} 
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            />
          </div>
          
          <div className="min-w-[150px]">
            <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-500 outline-none focus:border-[#F25278] transition" 
              onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} 
            />
          </div>
          
          <div className="min-w-[150px]">
            <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">End Date</label>
            <input 
              type="date" 
              value={endDate}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-500 outline-none focus:border-[#F25278] transition" 
              onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} 
            />
          </div>

          {/* Reset Button */}
          <button 
            onClick={() => {
              setSearchTerm("");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="bg-gray-200 text-gray-700 py-2 px-8 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Reset Filter
          </button>
        </div>

        {/* Table */}
        <div className="">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-5 font-semibold text-gray-600">Returned ID</th>
                <th className="p-5 font-semibold text-gray-600">PO ID</th>
                <th className="p-5 font-semibold text-gray-600">Supplier Name</th>
                <th className="p-5 font-semibold text-gray-600">Returned Date</th>
                <th className="p-5 font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {currentRecords.length > 0 ? (
                currentRecords.map((ret) => (
                <tr key={ret.purchase_return_id} className="hover:bg-gray-50">
                    <td className="p-5">RP{String(ret.purchase_return_id).padStart(3, '0')}</td>
                    <td className="p-5">{ret.purchase_order?.po_number || "N/A"}</td>
                    <td className="p-5">{ret.purchase_order?.supplier?.supplier_name || "N/A"}</td>
                    <td className="p-5">
                      {ret.purchase_return_date ? (
                        new Date(ret.purchase_return_date).toLocaleString('en-GB', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          second: '2-digit' 
                        })
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-5 text-center">
                    <button onClick={() => navigate(`/purchase/return/details/${ret.purchase_return_id}`)} className="text-[#405169] hover:text-[#405169]">
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="5" className="p-10 text-center text-gray-500">
                    No data found matching your criteria.
                </td>
                </tr>
            )}
            </tbody>
          </table>
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

export default PurchaseReturnList;