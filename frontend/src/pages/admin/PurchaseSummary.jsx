import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const PurchaseSummary = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const recordsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8000/purchase-reports')
      .then(res => { setPurchases(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

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

  const filteredData = purchases.filter(p => {
    const matchesSearch = p.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.supplier?.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || p.purchase_order_status === statusFilter;
    const orderDate = new Date(p.purchase_order_date).toISOString().split('T')[0];
    const matchesStartDate = !startDate || orderDate >= startDate;
    const matchesEndDate = !endDate || orderDate <= endDate;
    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const exportToExcel = async () => {
    const XLSX = await import('xlsx');
    
    const summaryData = filteredData.map(p => ({
      "PO Number": p.po_number,
      "Supplier": p.supplier?.supplier_name || "",
      "Total Amount (Ks)": p.total_amount,
      "Status": p.purchase_order_status,
      "Date": formatDate(p.purchase_order_date)
    }));

    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    XLSX.writeFile(workbook, "Purchase_Summary.xlsx");
    setIsExportOpen(false);
  };

  // Export PDF (Summary Only)
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text("Purchase Order Summary Report", 14, 15);
    
    const tableBody = filteredData.map(p => [
      p.po_number, 
      p.supplier?.supplier_name || "", 
      p.total_amount.toLocaleString() + ' Ks', 
      p.purchase_order_status, 
      formatDate(p.purchase_order_date)
    ]);

    autoTable(doc, {
      head: [['PO Number', 'Supplier', 'Total Amount', 'Status', 'Date']],
      body: tableBody,
      startY: 20,
    });
    doc.save("Purchase_Summary.pdf");
    setIsExportOpen(false);
  };

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirst, indexOfLast);
  const nPages = Math.ceil(filteredData.length / recordsPerPage);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="fixed top-0 left-64 right-0 h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      <div className="px-8 pb-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Purchase Order Summary Report</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
            <input type="text" value={searchTerm} placeholder="PO number/ Supplier" className="p-2 border rounded-lg text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
            <select value={statusFilter} className="p-2 border rounded-lg text-sm" onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
            <input type="date" value={startDate} className="p-2 border rounded-lg text-sm" 
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value > endDate) {
                  setEndDate(""); 
                }
              }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
            <input type="date" value={endDate} min={startDate} className="p-2 border rounded-lg text-sm" onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={resetFilters} className="bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Reset</button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-5">PO Number</th>
                <th className="p-5">Supplier</th>
                <th className="p-5">Total Amount</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRecords.length > 0 ? (
                currentRecords.map((p) => (
                  <React.Fragment key={p.purchase_order_id}>
                    <tr 
                      onClick={() => setSelectedId(selectedId === p.purchase_order_id ? null : p.purchase_order_id)} 
                      className="cursor-pointer hover:bg-gray-50 border-b"
                    >
                      <td className="p-5 font-medium">{p.po_number}</td>
                      <td className="p-5">{p.supplier?.supplier_name}</td>
                      <td className="p-5">{p.total_amount.toLocaleString()} Ks</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          p.purchase_order_status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.purchase_order_status}
                        </span>
                      </td>
                      <td className="p-5">{formatDate(p.purchase_order_date)}</td>
                    </tr>
                    {selectedId === p.purchase_order_id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="p-6">
                          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                  <th className="p-3 text-left">Product Name</th>
                                  <th className="p-3 text-center">Qty</th>
                                  <th className="p-3 text-right">Unit Price</th>
                                  <th className="p-3 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {p.details.map(d => (
                                  <tr key={d.purchase_order_details_id} className="border-t">
                                    <td className="p-3">{d.product?.product_name}</td>
                                    <td className="p-3 text-center">{d.qty}</td>
                                    <td className="p-3 text-right">{d.unit_price.toLocaleString()} Ks</td>
                                    <td className="p-3 text-right font-semibold">{d.sub_total.toLocaleString()} Ks</td>
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
                  <td colSpan="5" className="p-10 text-center text-gray-500">
                    No records found.
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

export default PurchaseSummary;