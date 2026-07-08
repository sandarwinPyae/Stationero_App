import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const InventoryLowStockReport = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const response = await axios.get('http://localhost:8000/low-stock-report');
      if (response.data && response.data.inventory) {
        setProducts(response.data.inventory);
      }
    } catch (error) {
      console.error("Error fetching live low stock metrics:", error);
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.product_id ? String(p.product_id) : '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.product_name ? String(p.product_name) : '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category ? String(p.category) : '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredProducts.length / recordsPerPage) || 1;

  return (
    <main className="w-full max-w-7xl mx-auto flex-grow">
      <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] border-b border-gray-200 shadow-sm w-full">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      <div className="px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Low Stock Report</h2>

        {/* CONTROLS */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <input
            type="text"
            placeholder="Search low stock items..."
            className="p-2.5 border border-gray-200 rounded-lg outline-none w-80 focus:ring-2 focus:ring-[#F25278]/20"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <div className="text-sm font-semibold text-gray-500">
            Total Low Stock Items: <span className="text-red-500">{filteredProducts.length}</span>
          </div>
        </div>

        {/* DATA GRID TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="py-4 px-6">Product ID</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-center">Qty</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRecords.map((p, index) => {
                const rawId = p.product_id ? String(p.product_id).replace(/\D/g, '') : '';

                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-700">{p.product_id}</td>
                    <td className="py-4 px-6 font-medium text-gray-800">{p.product_name}</td>
                    <td className="py-4 px-6 text-gray-500">{p.category}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{p.qty}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-red-600 text-xs bg-red-50 px-2.5 py-1 rounded-full font-bold border border-red-100">Low Stock</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link 
                        to={`/edit-product/${rawId}`} 
                        className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-100 transition-colors bg-white shadow-sm"
                        title="Edit Product"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-gray-400 border-t border-gray-100 font-medium">
              No low stock items found matching current search terms.
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8 gap-2 items-center">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-[#F25278] font-bold">&lt;</span>
            </button>
            {[...Array(nPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)} 
                className={`w-10 h-10 flex items-center justify-center border rounded-lg font-semibold text-sm transition-all ${
                  currentPage === i + 1 
                    ? 'bg-[#F25278] text-white border-[#F25278] shadow-sm' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === nPages} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-[#F25278] font-bold">&gt;</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default InventoryLowStockReport;