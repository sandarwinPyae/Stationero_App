import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SupplierWisePurchase = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const recordsPerPage = 5; 

  useEffect(() => {
    axios.get('http://localhost:8000/supplier-wise')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const exportData = filteredData.map(item => ({
      "Supplier ID": item.supplier_id,
      "Supplier Name": item.supplier_name,
      "Total Order": item.total_order,
      "Total Quantity": item.total_qty,
      "Total Amount (Ks)": item.total_amount
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier_Purchase");
    XLSX.writeFile(workbook, "Supplier_Wise_Purchase.xlsx");
    setIsExportOpen(false);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text("Supplier-wise Purchase Report", 14, 15);
    autoTable(doc, {
      head: [['Supplier ID', 'Supplier Name', 'Total Order', 'Total Qty', 'Total Amount (Ks)']],
      body: filteredData.map(item => [item.supplier_id, item.supplier_name, item.total_order, item.total_qty, item.total_amount.toLocaleString()]),
      startY: 20,
    });
    doc.save("Supplier_Wise_Purchase.pdf");
    setIsExportOpen(false);
  };

  const filteredData = data.filter(item => {
    const name = item.supplier_name ? item.supplier_name.toString().toLowerCase() : "";
    const id = item.supplier_id ? item.supplier_id.toString().toLowerCase() : "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || id.includes(term);
  });

  const nPages = Math.ceil(filteredData.length / recordsPerPage);
  const currentRecords = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);


  if (loading) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      <div className="px-8 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Supplier-wise Purchase Report</h2>
          <div className="relative">
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-[#F25278] text-white font-semibold rounded-lg hover:bg-[#e0456a] transition-all shadow-sm">
                <i className="fa-solid fa-file-export"></i> Export
            </button>
            {isExportOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden">
                    <button onClick={exportToPDF} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"><i className="fa-solid fa-file-pdf text-red-500"></i> Export PDF</button>
                    <button onClick={exportToExcel} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"><i className="fa-solid fa-file-excel text-green-600"></i> Export Excel</button>
                </div>
            )}
          </div>
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <input 
            type="text" 
            placeholder="Search Supplier Name or ID..." 
            className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25278]/20"
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-600 uppercase text-sm">
              <tr>
                <th className="p-5">Supplier ID</th>
                <th className="p-5">Supplier Name</th>
                <th className="p-5">Total Order</th>
                <th className="p-5">Total Quantity</th>
                <th className="p-5">Total Amount (Ks)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRecords.length > 0 ? (
                currentRecords.map((item) => (
                  <tr key={item.supplier_id} className="hover:bg-gray-50 transition">
                    <td className="p-5 font-medium text-gray-700">{item.supplier_id}</td>
                    <td className="p-5 font-medium text-gray-800">{item.supplier_name}</td>
                    <td className="p-5">{item.total_order}</td>
                    <td className="p-5">{item.total_qty}</td>
                    <td className="p-5 font-bold text-gray-800">{item.total_amount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 font-medium">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left text-sm"></i></button>
            {[...Array(nPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
            ))}
            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right text-sm"></i></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierWisePurchase;