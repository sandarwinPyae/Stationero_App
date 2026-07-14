import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SaleReturnReport = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const recordsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/sale-return-reports')
      .then(res => { setReturns(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Helper Function: Date Format dd/mm/yyyy, hh:mm:ss
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${ss}`;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Export Excel Function
  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const exportData = filteredData.map(s => ({
      "Invoice": s.invoice_number,
      "Return Amount (Ks)": s.total_returned_amount,
      "Payment Method": s.sale_return_payment_method,
      "Reason": s.return_reason,
      "Date": formatDate(s.sale_return_date)
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sale_Returns");
    XLSX.writeFile(wb, "Sale_Return_Report.xlsx");
    setIsExportOpen(false);
  };

  // Export PDF Function
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text("Sale Return Report", 14, 15);
    const tableBody = filteredData.map(s => [
      s.invoice_number, 
      s.total_returned_amount.toLocaleString(), 
      s.sale_return_payment_method, 
      s.return_reason, 
      formatDate(s.sale_return_date)
    ]);
    autoTable(doc, {
      head: [['Invoice', 'Amount (Ks)', 'Method', 'Reason', 'Date']],
      body: tableBody,
      startY: 20
    });
    doc.save("Sale_Return_Report.pdf");
    setIsExportOpen(false);
  };

  // Filter Logic
  const filteredData = returns.filter(s => {
    const matchesSearch = s.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.return_reason.toLowerCase().includes(searchTerm.toLowerCase());
    const itemDateStr = s.sale_return_date.substring(0, 10); 
    const matchesStartDate = !startDate || itemDateStr >= startDate;
    const matchesEndDate = !endDate || itemDateStr <= endDate;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const nPages = Math.ceil(filteredData.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      <div className="p-6 pt-24">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Sale Return Report</h2>
          <div className="relative">
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="bg-[#F25278] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#e0456a] transition-all flex items-center gap-2">
              <i className="fa-solid fa-file-export"></i> Export
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden">
                <button onClick={exportToPDF} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><i className="fa-solid fa-file-pdf text-red-500"></i> PDF</button>
                <button onClick={exportToExcel} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"><i className="fa-solid fa-file-excel text-green-600"></i> Excel</button>
              </div>
            )}
          </div>
        </div>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
            <input type="text" placeholder="Invoice / Reason" className="p-2 border rounded-lg text-sm" onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1)}} value={searchTerm} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
            <input type="date" value={startDate} className="p-2 border rounded-lg text-sm" 
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value > endDate) {
                  setEndDate(""); 
                }
              }}   
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
            <input type="date" min={startDate} className="p-2 border rounded-lg text-sm" onChange={(e) => setEndDate(e.target.value)} value={endDate}/>
          </div>
          <button onClick={resetFilters} className="bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Reset Filters</button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="py-4 px-6 font-semibold">Invoice</th>
                <th className="py-4 px-6 font-semibold">Return Amount (Ks)</th>
                <th className="py-4 px-6 font-semibold">Payment Method</th>
                <th className="p-4">Image</th>
                <th className="py-4 px-6 font-semibold">Reason</th>
                <th className="py-4 px-6 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentRecords.length > 0 ? (
                currentRecords.map((s) => (
                  <React.Fragment key={s.sale_return_id}>
                    <tr className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedId(selectedId === s.sale_return_id ? null : s.sale_return_id)}>
                      <td className="p-4 font-bold text-blue-600">{s.invoice_number}</td>
                      <td className="p-4 font-semibold">{s.total_returned_amount.toLocaleString()}</td>
                      <td className="p-4 text-gray-600">{s.sale_return_payment_method}</td>
                      <td className="p-4">
                        {s.return_img_url ? (
                          <img 
                            src={`http://localhost:8000/return-images/${s.return_img_url}`} 
                            alt="Return Proof" 
                            className="w-12 h-12 object-cover rounded shadow cursor-pointer border hover:scale-105 transition"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(s.return_img_url); }}
                          />
                        ) : <span className="text-gray-400 text-xs">No Image</span>}
                      </td>
                      <td className="p-4 text-gray-600">{s.return_reason}</td>
                      <td className="p-4 text-gray-500">{formatDate(s.sale_return_date)}</td>
                    </tr>
                    {selectedId === s.sale_return_id && (
                      <tr>
                        <td colSpan="6" className="p-4 bg-gray-50">
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
                                <td className="p-3 text-right font-bold">{d.sub_total.toLocaleString()}</td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Full Screen Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
            <img src={`http://localhost:8000/return-images/${selectedImage}`} alt="Full View" className="max-w-full max-h-full rounded-lg shadow-2xl" />
            <button className="absolute top-5 right-5 text-white text-3xl font-bold" onClick={() => setSelectedImage(null)}>&times;</button>
          </div>
        )}

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