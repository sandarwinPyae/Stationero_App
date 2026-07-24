import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PurchaseReturnList = ({toggleSidebar}) => {
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

    // Date Logic (Year, Month, Day သက်သက် နှိုင်းယှဉ်ရန် ယူခြင်း)
    if (!ret.purchase_return_date) return matchesSearch && !startDate && !endDate;

    const returnDateObj = new Date(ret.purchase_return_date);
    
    // Time များကို 00:00:00 သို့ ညှိရန် ရက်စွဲ string အဖြစ် ပြောင်းပြီးမှ နှိုင်းယှဉ်ခြင်း
    const returnDateOnly = new Date(returnDateObj.getFullYear(), returnDateObj.getMonth(), returnDateObj.getDate());
    
    const startDateOnly = startDate ? new Date(startDate) : null;
    if (startDateOnly) startDateOnly.setHours(0, 0, 0, 0);

    const endDateOnly = endDate ? new Date(endDate) : null;
    if (endDateOnly) endDateOnly.setHours(0, 0, 0, 0);

    const matchesStartDate = !startDateOnly || returnDateOnly >= startDateOnly;
    const matchesEndDate = !endDateOnly || returnDateOnly <= endDateOnly;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReturns.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredReturns.length / recordsPerPage);

  if (loading) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Data...</p>
  </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="fixed top-0 left-0 right-0 h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <button onClick={toggleSidebar} className="md:hidden text-gray-600 text-xl">
          <i className="fa-solid fa-bars"></i>
        </button>
        <button 
          onClick={() => navigate('/purchase')}
          className="hidden sm:flex text-gray-600 hover:text-[#F25278] transition-colors font-medium items-center"
        >
          
          <i className="fa-solid fa-arrow-left"></i> <span className="hidden sm:inline">Back</span>
        </button>

        
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500 text-sm" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Purchase Return List</h2>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Search</label>
            <input 
              type="text" 
              placeholder="PO ID or Supplier name" 
              className="w-full px-4 py-2 text-sm border rounded-lg outline-none" 
              value={searchTerm} 
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            />
          </div>
          
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 outline-none focus:border-[#F25278] transition" 
              onChange={(e) => {
                setStartDate(e.target.value); 
                setCurrentPage(1);
                if (endDate && e.target.value > endDate) {
                  setEndDate(""); 
                }
              }}
            />
          </div>
          
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block uppercase font-semibold">End Date</label>
            <input 
              type="date" 
              value={endDate}
              min={startDate}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 outline-none focus:border-[#F25278] transition" 
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
            className="px-4 py-2 bg-gray-200 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition self-end h-[38px]"
          >
            Reset Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
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