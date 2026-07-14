import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseReturnsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundMethod, setRefundMethod] = useState(''); 
  const [returnQtys, setReturnQtys] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // const [refundMethod, setRefundMethod] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/purchase-orders/${id}`);
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order:", err);
      setLoading(false);
    }
  };

  const calculateTotalRefunded = () => {
    if (!order?.items) return 0;
    return order.items.reduce((total, item) => {
      const qty = returnQtys[item.product_id] || 0;
      return total + (qty * item.unit_price);
    }, 0);
  };

  const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
            <i className="fa-solid fa-question"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Return?</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to process this return? This action will update your stock.</p>
          
          <div className="flex gap-3 justify-center">
            <button 
              onClick={onCancel}
              className="px-6 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="px-6 py-2 rounded-lg bg-[#F25278] text-white "
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
        <i className="fa-solid fa-circle-exclamation mr-3"></i>
        {message}
      </div>
    );
  };

 const handleConfirmReturn = async () => {
    setErrorMessage('');
    const itemsToReturn = Object.keys(returnQtys).map(productId => {
      const item = order.items.find(i => i.product_id === parseInt(productId));
      return {
        product_id: parseInt(productId),
        returned_qty: returnQtys[productId],
        unit_price: item ? item.unit_price : 0
      };
    }).filter(item => item.returned_qty > 0);

    if (itemsToReturn.length === 0) {
      setErrorMessage("Please enter at least one return quantity.");
      return;
    }

    if (!refundMethod) {
      setErrorMessage("Please select a Refund Payment Method.");
      return;
    }

    try {
      const payload = {
        refund_payment_method: refundMethod,
        items: itemsToReturn
      };

      await axios.post(`http://localhost:8000/purchase/return/${id}`, payload);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/purchase');
      }, 2000);
    } catch (err) {
      console.error("Return failed:", err);
      const errorMsg = err.response?.data?.detail || "Failed to confirm return.";
      setErrorMessage(errorMsg);
    }
  };

  const handleConfirmClick = () => {
    setErrorMessage('');
    if (Object.keys(returnQtys).length === 0) {
      setErrorMessage("Please enter at least one return quantity.");
      return;
    }
    if (!refundMethod) {
      setErrorMessage("Please select a Refund Payment Method.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteReturn = async () => {
    setShowConfirmModal(false);
    try {
      const itemsToReturn = Object.keys(returnQtys).map(productId => {
        const item = order.items.find(i => i.product_id === parseInt(productId));
        return {
          product_id: parseInt(productId),
          returned_qty: returnQtys[productId],
          unit_price: item ? item.unit_price : 0
        };
      }).filter(item => item.returned_qty > 0);

      const payload = { refund_payment_method: refundMethod, items: itemsToReturn };

      await axios.post(`http://localhost:8000/purchase/return/${id}`, payload);
      navigate('/purchase'); 
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to confirm return.");
    }
  };
  const handleReturnQtyChange = (itemId, value, maxQty) => {
    setErrorMessage(''); 

    if (value === '') {
      setReturnQtys(prev => ({
        ...prev,
        [itemId]: ''
      }));
      return;
    }
    const qty = Number(value);
    if (qty <= maxQty) {
      setReturnQtys(prev => {
        const newState = {
          ...prev,
          [itemId]: qty
        };
        console.log("newState =", newState);
        return newState;
      });
    } else {
      setErrorMessage("Return quantity cannot exceed ordered quantity.");
    }
  };

  const removeProductRow = (indexToRemove) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      items: prevOrder.items.filter((_, index) => index !== indexToRemove)
    }));
    
    const productId = order.items[indexToRemove].product_id;
    setReturnQtys(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="py-4 bg-gray-50 min-h-screen">
      {/* header */}
      <div className="fixed top-0 left-64 right-0 h-16 flex justify-between items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <button 
          onClick={() => navigate('/purchase')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500 text-sm" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </div>
      <div className="max-w-5xl mx-auto bg-white p-8 pt-24 rounded-3xl shadow-sm border border-gray-100">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Purchase Order Returns</h2>
        
        
        {/* Updated Header Information */}
        {order && (
          <div className="grid grid-cols-2 gap-y-4 gap-x-12 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p><strong className="text-gray-600">PO ID:</strong> {order.po_number}</p>
            <p>
              <strong className="text-gray-600">Order Date:</strong> 
              {order.purchase_order_date ? (
                        new Date(order.purchase_order_date).toLocaleString('en-GB', { 
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
            </p>
            <p><strong className="text-gray-600">Supplier:</strong> {order.supplier?.supplier_name}</p>
            <p><strong className="text-gray-600">PO Status:</strong> {order.purchase_order_status}</p>
            <p><strong className="text-gray-600">Supplier Email:</strong> {order.supplier?.supplier_email || 'N/A'}</p>
            <p><strong className="text-gray-600">Supplier Phone:</strong> {order.supplier?.supplier_phone_no || 'N/A'}</p>
          </div>
        )}

        <table className="w-full text-left border-collapse mb-8">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">No</th>
              <th className="p-4 border-b">Product ID</th>
              <th className="p-4 border-b">Product Name</th>
              <th className="p-4 border-b">Ordered Qty</th>
              <th className="p-4 border-b">Refunded Qty</th>
              <th className="p-4 border-b">Unit Price</th>
              <th className="p-4 border-b">Total Refunded Amount</th>
              <th className="p-4 border-b">Action</th>

            </tr>
          </thead>
          <tbody>
            {order?.items?.map((item, index) => (
              <tr key={index} className="border-b">
              <td className="p-4">{index + 1}</td>
              <td className="p-4">{item.product_id}</td>
              <td className="p-4">{item.product_name}</td>
              <td className="p-4">{item.quantity}</td>
              <td className="p-4">
                <input 
                    type="number" 
                    className="w-20 border rounded px-2 py-1"
                    min="0"
                    max={item.quantity} 
                    value={returnQtys[item.product_id] || ''} 
                    onChange={(e) => {
                      console.log("typed =", e.target.value);
                      handleReturnQtyChange(item.product_id, e.target.value, item.quantity)}
                    }
                />

              </td>
              <td className="p-4">{item.unit_price}</td>
              <td className="p-4 font-semibold">
                {((returnQtys[item.product_id] || 0) * item.unit_price).toLocaleString()} MMK
              </td>
              <td className="p-4">
                <button 
                  type="button" 
                  onClick={() => removeProductRow(index)} 
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <i className="fa-solid fa-circle-minus"></i>
                </button>
              </td>
            </tr>
            ))}
          </tbody>
        </table>

        {/* Updated Footer Actions */}
        <div className="bg-white p-6 mb-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Total Section */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Total Refunded</p>
              <p className="text-3xl font-bold text-[#F25278]">
                {calculateTotalRefunded().toLocaleString()} <span className="text-xl">MMK</span>
              </p>
            </div>

            {/* Payment Method Section */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <label className="text-sm font-semibold text-gray-700 ml-1">Select Refund Method</label>
              <div className="relative">
                <select 
                    className="w-full px-4 py-2 pr-2 border border-gray-300 rounded-lg outline-none bg-white focus:border-[#F25278]"
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                  >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Kpay">KBZ pay</option>
                  <option value="Bank Transfer">AYA Pay</option>
                  <option value="Credit">Bank Transfer</option>
                </select>
                {/* Dropdown Icon */}
                
              </div>
            </div>
          </div>
        </div>
        <ErrorMessage message={errorMessage} />
        <div className="flex gap-4">
          
          <button 
            onClick={handleConfirmClick} 
            className="px-6 py-2.5 bg-[#F25278] text-white rounded-lg"
          >
            Confirmed Returned
          </button>
          <ConfirmationModal 
            isOpen={showConfirmModal} 
            onConfirm={handleExecuteReturn} 
            onCancel={() => setShowConfirmModal(false)} 
          />
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnsPage;