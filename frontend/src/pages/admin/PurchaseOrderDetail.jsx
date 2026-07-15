import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/purchase-orders/${id}`);
      setOrder(res.data);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: parseFloat(value) || 0 } : item
    );
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleUpdateOrder = async () => {
    try {
        await axios.put(`http://localhost:8000/purchase-orders/${id}/confirm`, {
            items: items.map(item => ({
                product_id: item.product_id, 
                quantity: item.quantity,
                unit_price: item.unit_price,
                selling_price: item.selling_price
        }))
        });
        
        navigate('/purchase'); 
    } catch (err) {
        console.error("Update failed:", err);
        alert("Error updating order");
    }
    };

  if (!order) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );
  const isConfirmed = order.purchase_order_status === 'Confirmed';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="fixed top-0 left-64 right-0 h-16 flex justify-between items-center px-8 bg-white border-b border-gray-100 shadow-sm z-50">
  
        {/* Back Button (Left side) */}
        <button 
          onClick={() => navigate('/purchase')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>

        {/* User Icon (Right side) */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
          <i className="fa-solid fa-user text-gray-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-24">

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Purchase Order Details</h2>
          
          {/* Order Info Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 bg-gray-100 p-6 rounded-2xl">
            <p><strong>Purchase Order ID:</strong> : {order.po_number}</p>
            <p>
              <strong>Order Date:</strong> : 
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
            <p><strong>Supplier Name:</strong> : {order.supplier?.supplier_name}</p>
            <p><strong>Supplier Email:</strong> : {order.supplier?.supplier_email || 'N/A'}</p>
            <p><strong>Phone No:</strong> : {order.supplier?.supplier_phone_no || 'N/A'}</p>
            <p><strong>PO Status:</strong> : {order.purchase_order_status}</p>
          </div>

          <table className="w-full text-left mb-8">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Product ID</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-3">{item.product_id}</td>
                  <td className="p-3">{item.product_name}</td>
                  <td className="p-3">
                    <input type="number" disabled={isConfirmed} className="w-16 border rounded p-1 disabled:bg-gray-100" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                  </td>
                  <td className="p-3">
                    <input type="number" disabled={isConfirmed} className="w-24 border rounded p-1 disabled:bg-gray-100" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} />
                  </td>
                  <td className="p-3">
                    <input type="number" disabled={isConfirmed} className="w-24 border rounded p-1 disabled:bg-gray-100" value={item.selling_price || 0} onChange={(e) => handleItemChange(index, 'selling_price', e.target.value)} />
                  </td>
                  <td className="p-3">{(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right border-t pt-4">
            <p className="text-l font-bold mb-4">Total Amount: {calculateTotal().toFixed(2)}</p>
            {!isConfirmed && (
              <button 
                onClick={handleUpdateOrder}
                className="bg-[#F25278] text-white px-8 py-2.5 rounded-xl hover:bg-pink-600 transition"
              >
                Confirmed Received
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;