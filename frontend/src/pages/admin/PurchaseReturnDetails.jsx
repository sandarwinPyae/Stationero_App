import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseReturnDetails = ({ toggleSidebar }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);

  useEffect(() => {
    fetchReturnDetails();
  }, [id]);

  const fetchReturnDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/purchase/return/details/${id}`);
      setDetails(res.data);
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  if (!details) return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
      <p className="mt-4 text-gray-500 font-medium">Loading Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 md:left-64 right-0 h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <button onClick={toggleSidebar} className="md:hidden text-gray-600 text-xl">
          <i className="fa-solid fa-bars"></i>
        </button>
        <button 
          onClick={() => navigate('/purchase/returns')}
          className="hidden sm:flex text-gray-600 hover:text-[#F25278] transition-colors font-medium items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        
        <div className="ml-auto w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
          <i className="fa-solid fa-user text-gray-500 text-sm" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-10">
        <div className="max-w-5xl mx-auto bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Purchase Order Returns</h2>
          
          {/* Header Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 mb-8 text-sm">
            <p><span className="text-gray-500">Returned PO ID:</span> <br/><span className="font-semibold">RP{String(details.purchase_return_id).padStart(3, '0')}</span></p>
            <p>
              <span className="text-gray-500">Returned Date:</span> <br/>
              <span className="font-semibold">
                {details.purchase_return_date ? new Date(details.purchase_return_date).toLocaleString('en-GB') : "N/A"}
              </span>
            </p>
            <p><span className="text-gray-500">Purchase Order ID:</span> <br/><span className="font-semibold">{details.purchase_order?.po_number}</span></p>
            <p><span className="text-gray-500">Supplier Name:</span> <br/><span className="font-semibold">{details.purchase_order?.supplier?.supplier_name}</span></p>
          </div>

          {/* Details Table */}
          <div className="overflow-x-auto mb-8 border rounded-lg">
            <table className="w-full min-w-[500px] text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3">No</th>
                  <th className="p-3">Product ID</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Refunded Qty</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {details.details?.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.product?.product_code || item.product?.product_id}</td>
                    <td className="p-3">{item.product?.product_name}</td>
                    <td className="p-3">{item.returned_qty}</td>
                    <td className="p-3">{item.unit_price?.toLocaleString()}</td>
                    <td className="p-3 font-semibold">{(Number(item.returned_qty) * Number(item.unit_price)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{details.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Method:</span>
                <span>{details.purchase_return_payment_method}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnDetails;