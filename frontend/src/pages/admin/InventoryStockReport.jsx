import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InventoryStockReport = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchInventoryStock();
  }, []);

  const fetchInventoryStock = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stock-report');
      if (response.data && response.data.inventory) {
        setProducts(response.data.inventory);
      }
    } catch (error) {
      console.error("Error fetching live database inventory stock metrics:", error);
    }
  };

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "Inventory_Report.xlsx");
    setIsExportOpen(false);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text("Inventory Stock Report", 14, 15);
    autoTable(doc, {
      head: [['ID', 'Name', 'Category', 'Qty', 'Unit Price', 'Inventory Value', 'Status']],
      body: filteredProducts.map(p => [p.product_id, p.product_name, p.category, p.qty,p.unit_price, p.inventory_value, p.qty <= 10 ? 'Low Stock' : 'In Stock']),
      startY: 20,
    });
    doc.save("Inventory_Report.pdf");
    setIsExportOpen(false);
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
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      <div className="px-8 py-6 pt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Stock Report</h2>

        {/* CONTROLS */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <input
            type="text"
            placeholder="Search by ID, name, or category..."
            className="p-2.5 text-sm border border-gray-200 rounded-lg outline-none w-80 focus:ring-2 focus:ring-[#F25278]/20"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          
          <div className="flex items-center gap-6">
            {/* Total Monitored Items */}
            <div className="text-sm font-semibold text-gray-500">
              Total Monitored Items: <span className="text-[#F25278]">{filteredProducts.length}</span>
            </div>

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#F25278] text-white font-semibold rounded-lg hover:bg-[#e0456a] transition-all shadow-sm"
              >
                <i className="fa-solid fa-file-export"></i> Export
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden">
                  <button onClick={exportToPDF} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                    <i className="fa-solid fa-file-pdf text-red-500"></i> Export PDF
                  </button>
                  <button onClick={exportToExcel} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                    <i className="fa-solid fa-file-excel text-green-600"></i> Export Excel
                  </button>
                </div>
              )}
            </div>
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
                <th className="py-4 px-6 text-center">Unit Price</th>
                <th className="py-4 px-6 text-center">Inventory Value</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRecords.map((p, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-700">{p.product_id}</td>
                  <td className="py-4 px-6 text-gray-800">{p.product_name}</td>
                  <td className="py-4 px-6 text-gray-500">{p.category}</td>
                  <td className="py-4 px-6 text-center text-gray-800">{p.qty}</td>
                  <td className="py-4 px-6 text-center text-gray-800">{p.unit_price}</td>
                  <td className="py-4 px-6 text-center text-gray-800">{p.inventory_value}</td>
                  <td className="py-4 px-6 text-center">
                    {p.qty <= 10 ? (
                      <span className="text-red-600 text-xs bg-red-50 px-2.5 py-1 rounded-full font-bold border border-red-100">Low Stock</span>
                    ) : (
                      <span className="text-green-600 text-xs bg-green-50 px-2.5 py-1 rounded-full font-bold border border-green-100">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
             <div className="p-12 text-center text-gray-400 border-t border-gray-100 font-medium">
               No inventory logs found matching current search terms.
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
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              {[...Array(nPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)} 
                  className={`w-10 h-10 flex items-center justify-center border rounded-lg font-semibold text-sm transition-all ${
                    currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278] shadow-sm' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
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
                <i className="fa-solid fa-chevron-right"></i>
              </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default InventoryStockReport;