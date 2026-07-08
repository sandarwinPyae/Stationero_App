import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SupplierWisePurchase = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5; 

  useEffect(() => {
    axios.get('http://localhost:8000/supplier-wise')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const filteredData = data.filter(item => {
    const name = item.supplier_name ? item.supplier_name.toString().toLowerCase() : "";
    const id = item.supplier_id ? item.supplier_id.toString().toLowerCase() : "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  const nPages = Math.ceil(filteredData.length / recordsPerPage);
  const currentRecords = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] border-b border-gray-200 shadow-sm w-full mb-8">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      <div className="px-8 pb-8">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Supplier-wise Purchase Report</h2>

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <input 
            type="text" 
            placeholder="Search Supplier Name or ID..." 
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25278]/20"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {currentRecords.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="p-5">Supplier ID</th>
                  <th className="p-5">Supplier Name</th>
                  <th className="p-5">Total Order</th>
                  <th className="p-5">Total Quantity</th>
                  <th className="p-5">Total Amount (Ks)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecords.map((item) => (
                  <tr key={item.supplier_id} className="hover:bg-gray-50 transition">
                    <td className="p-5 font-medium text-gray-700">{item.supplier_id}</td>
                    <td className="p-5 font-medium text-gray-800">{item.supplier_name}</td>
                    <td className="p-5">{item.total_order}</td>
                    <td className="p-5">{item.total_qty}</td>
                    <td className="p-5 font-bold text-gray-800">{item.total_amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500 font-medium">No data found</div>
          )}
        </div>

        {/* Pagination */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            
            {[...Array(nPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)} 
                className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              disabled={currentPage === nPages} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierWisePurchase;