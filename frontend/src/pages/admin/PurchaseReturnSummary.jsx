import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseReturnSummary = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const recordsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/purchase-returns-summary')
      .then(res => { setReturns(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Filter Reset Function
  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const filteredData = returns.filter(r => {
    const matchesSearch = r.purchase_order?.po_number.toLowerCase().includes(searchTerm.toLowerCase());
    const returnDate = new Date(r.purchase_return_date).toISOString().split('T')[0];
    const matchesStartDate = !startDate || returnDate >= startDate;
    const matchesEndDate = !endDate || returnDate <= endDate;
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Date Formatting Helper
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${ss}`;
  };

  // Export Functions
  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    const formattedData = filteredData.map(r => ({
      "PO Number": r.purchase_order?.po_number,
      "Return Date": formatDate(r.purchase_return_date),
      "Payment Method": r.purchase_return_payment_method,
      "Total Amount (Ks)": r.total_amount
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Returns");
    XLSX.writeFile(workbook, "Purchase_Return_Summary.xlsx");
    setIsExportOpen(false);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text("Purchase Return Summary Report", 14, 15);
    autoTable(doc, {
      head: [['PO Number', 'Return Date', 'Payment Method', 'Total Amount']],
      body: filteredData.map(r => [
        r.purchase_order?.po_number, 
        formatDate(r.purchase_return_date), 
        r.purchase_return_payment_method, 
        r.total_amount.toLocaleString() + ' Ks'
      ]),
      startY: 20,
    });
    doc.save("Purchase_Return_Summary.pdf");
    setIsExportOpen(false);
  };

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);
  const nPages = Math.ceil(filteredData.length / recordsPerPage);

  if (loading) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );


  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      <div className="px-8 pb-8 pt-24">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Purchase Return Summary Report</h2>
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

        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-500 uppercase">Search</label>
            <input type="text" value={searchTerm} placeholder="Search PO Number" className="p-2 border rounded-lg text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-500 uppercase">Start Date</label>
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
            <label className="text-sm font-semibold text-gray-500 uppercase">End Date</label>
            <input type="date" value={endDate} min={startDate} className="p-2 border rounded-lg text-sm" onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={resetFilters} className="bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Reset Filters</button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-5">PO Number</th>
                <th className="p-5">Return Date</th>
                <th className="p-5">Payment Method</th>
                <th className="p-5">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRecords.length > 0 ? (
                currentRecords.map((r) => (
                  <React.Fragment key={r.purchase_return_id}>
                    <tr 
                      onClick={() => setSelectedId(selectedId === r.purchase_return_id ? null : r.purchase_return_id)} 
                      className="cursor-pointer hover:bg-gray-50 border-b"
                    >
                      <td className="p-5 font-medium">{r.purchase_order?.po_number}</td>
                      <td className="p-5">{formatDate(r.purchase_return_date)}</td>
                      <td className="p-5">{r.purchase_return_payment_method}</td>
                      <td className="p-5 text-red-600 font-bold">{r.total_amount.toLocaleString()} Ks</td>
                    </tr>
                    {selectedId === r.purchase_return_id && (
                      <tr className="bg-red-50/50">
                        <td colSpan="4" className="p-6">
                          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                  <th className="p-3 text-left">Product Name</th>
                                  <th className="p-3 text-center">Returned Qty</th>
                                  <th className="p-3 text-right">Unit Price</th>
                                  <th className="p-3 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {r.details.map(d => (
                                  <tr key={d.purchase_return_details_id} className="hover:bg-gray-50">
                                    <td className="p-3">{d.product?.product_name}</td>
                                    <td className="p-3 text-center">{d.returned_qty}</td>
                                    <td className="p-3 text-right">{d.unit_price.toLocaleString()} Ks</td>
                                    <td className="p-3 text-right font-semibold">{d.returned_amount.toLocaleString()} Ks</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 font-medium">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

export default PurchaseReturnSummary;