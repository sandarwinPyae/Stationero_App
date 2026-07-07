import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseReturnDetails = () => {
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

  if (!details) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => navigate('/purchase/returns')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500 text-sm"></i>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-8 flex-grow">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Purchase Order Returns</h2>
          
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm">
            <p><span className="text-gray-500">Returned Purchase Order ID:</span> <span className="font-semibold">RP{String(details.purchase_return_id).padStart(3, '0')}</span></p>
            <p>
              <span className="text-gray-500">Returned Date:</span> 
              <span className="font-semibold">
                {details.purchase_return_date ? (
                        new Date(details.purchase_return_date).toLocaleString('en-GB', { 
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
              </span>
            </p>
            <p><span className="text-gray-500">Purchase Order ID:</span> <span className="font-semibold">{details.purchase_order?.po_number}</span></p>
            <p><span className="text-gray-500">Supplier Name:</span> <span className="font-semibold">{details.purchase_order?.supplier?.supplier_name}</span></p>
          </div>

          {/* Details Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4">No</th>
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Refunded Qty</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {details.details?.map((item, index) => (
                  <tr key={index}>
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{item.product?.product_code || item.product?.product_id}</td>
                    <td className="p-4">{item.product?.product_name}</td>
                    <td className="p-4">{item.returned_qty}</td>
                    <td className="p-4">{item.unit_price?.toLocaleString()}</td>
                    <td className="p-4">{(Number(item.returned_qty) * Number(item.unit_price)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{details.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Refunded Payment Method:</span>
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