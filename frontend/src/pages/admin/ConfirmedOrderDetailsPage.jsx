import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. Modal Component
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-96 mx-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#F25278] text-white font-semibold rounded-lg">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const ConfirmedOrderDetailsPage = ({ toggleSidebar }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/confirm-orders/details/${id}`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleConfirmSale = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/confirm-sale/${id}`);
      if (response.status === 200) {
        setStatusMessage("Sale confirmed successfully!");
        setShowModal(false);
        fetchOrderDetails(); // Refresh order status
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "An error occurred during confirmation";
      setStatusMessage(errorMsg);
      setShowModal(false);
    }
  };

  if (loading) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );
  
  if (!order) return <div className="p-10">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          
          <button 
            onClick={() => navigate('/confirm-orders')}
            className="hidden sm:flex text-gray-600 hover:text-[#F25278] transition-colors font-medium items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>
        </div>

        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      {/* Success/Error Toast Message */}
      {statusMessage && (
        <div 
          className={`fixed top-16 left-0 md:left-64 right-0 z-40 p-4 border-b-4 flex items-center justify-between shadow-sm ${statusMessage.toLowerCase().includes("success") ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-[#F25278] text-[#F25278]"}`}
        >
          <p className="text-sm font-semibold">
            {statusMessage}
          </p>
          <button 
            onClick={() => setStatusMessage("")} 
            className="text-gray-500 hover:text-gray-700 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}
    

      {/* Content Area */}
      <div className="p-4 md:p-8 pt-20 md:pt-20 w-full max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
          
          {/* Header Info - Responsive Grid */}
          <div className="flex flex-col sm:flex-row justify-between border-b pb-6 mb-6 gap-4">
            <h2 className="text-2xl font-bold text-[#F25278]">Stationero</h2>
            <div className="text-left sm:text-right text-sm">
              <p>Invoice ID : <span className="font-semibold">{order.header.invoice_number}</span></p>
              <p>Sale Date : 
                <span className="font-semibold">
                  {new Date(order.header.order_date).toLocaleString('en-GB')}
                </span>
              </p>
            </div>
          </div>

          {/* Customer & Payment Info - Mobile Responsive */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-lg mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Customer Information :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>Name : <span className="font-medium">{order.header.customer.customer_name}</span></p>
              <p>Email : <span className="font-medium">{order.header.customer?.customer_email}</span></p>
              <p>Phone : <span className="font-medium">{order.header.customer?.customer_phone}</span></p>
              <p>Address : <span className="font-medium">{order.header.customer?.customer_address}</span></p>
            </div>
          </div>

          {/* Product Table (Scrollable on Mobile) */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full min-w-[500px] text-left">
              <thead className="text-gray-500 text-sm border-b">
                <tr>
                  <th className="py-2">NO</th>
                  <th className="py-2">Product</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {order.details.map((item, index) => (
                  <tr key={item.sale_order_detail_id} className="border-b">
                    <td className="py-3">{index + 1}</td>
                    <td className="py-3">{item.product_name}</td>
                    <td className="py-3 text-right">{item.qty}</td>
                    <td className="py-3 text-right">{item.selling_price}</td>
                    <td className="py-3 text-right">{item.sub_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Amount:</span> <span className="font-bold">{order.header.calculated_total_amount}</span></div>
              {order.header.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount Amount:</span> 
                  <span className="font-bold">{order.header.discount}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2 text-lg"><span>Net Amount:</span> <span className="font-bold">{order.header.total_amount - order.header.discount}</span></div>
            </div>
          </div>

          {/* Button */}
          <div className="flex justify-center mt-8">
            {order.header.status !== 'Confirmed' && (
              <button onClick={() => setShowModal(true)} className="w-full sm:w-auto px-8 py-2 bg-[#F25278] text-white rounded-lg">
                Confirm Sale
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={showModal}
        title="Confirm Sale"
        message="Are you sure you want to confirm this sale?"
        onConfirm={handleConfirmSale}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default ConfirmedOrderDetailsPage;