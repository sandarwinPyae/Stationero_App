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

 const handleConfirmReturn = async () => {
    const itemsToReturn = Object.keys(returnQtys).map(productId => {
      const item = order.items.find(i => i.product_id === parseInt(productId));
      return {
        product_id: parseInt(productId),
        returned_qty: returnQtys[productId],
        unit_price: item ? item.unit_price : 0
      };
    }).filter(item => item.returned_qty > 0);

    // ၂။ Validation
    if (itemsToReturn.length === 0) {
      alert("Please enter at least one return quantity.");
      return;
    }

    try {
      const payload = {
        refund_payment_method: refundMethod,
        items: itemsToReturn
      };

      await axios.post(`http://localhost:8000/purchase/return/${id}`, payload);
      alert("Successfully returned!");
      navigate('/purchase');
    } catch (err) {
      console.error("Return failed:", err);
      const errorMsg = err.response?.data?.detail || "Failed to confirm return.";
      alert(errorMsg);
    }
  };
  const handleReturnQtyChange = (itemId, value, maxQty) => {
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
      alert("Return quantity cannot exceed ordered quantity.");
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
        <div className="flex justify-between items-start bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div>
            <p className="font-semibold text-xl mb-4 text-[#F25278]">
              Total Refunded Amount: {calculateTotalRefunded().toLocaleString()} MMK
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Refund Payment Method</label>
              <input 
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none w-64"
                placeholder="e.g., Kpay, Bank Transfer"
                value={refundMethod}
                onChange={(e) => setRefundMethod(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          
          <button 
            onClick={handleConfirmReturn} 
            className="px-6 py-2.5 bg-[#F25278] text-white rounded-lg hover:bg-pink-600 shadow-sm transition"
          >
            Confirmed Returned
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturnsPage;