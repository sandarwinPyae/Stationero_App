import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ConfirmedOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/confirm-orders/details/${id}`);
      console.log("API Response Data:", response.data); 
      setOrder(response.data);
      setLoading(false);
    } 
    catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  fetchOrderDetails();
  }, [id]);


  const handleConfirmSale = async () => {
    if (!window.confirm("Are you sure you want to confirm this sale?")) return;

    try {
      const response = await axios.put(`http://localhost:8000/confirm-sale/${id}`);
      if (response.status === 200) {
        alert("Sale confirmed successfully!");
        window.location.reload(); 
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Something went wrong!";
      alert(errorMsg);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!order) return <div className="p-10">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 flex justify-between items-center px-8 bg-white border-b border-gray-200 shadow-sm w-full">
        <button 
          onClick={() => navigate('/confirm-orders')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center gap-1"
        >
          <i className="fa-solid fa-arrow-left"></i> 
          <span>Back</span>
        </button>

        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      {/* Content Area  */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          
          {/* Header Info */}
          <div className="flex justify-between border-b pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F25278]">Stationero</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Invoice ID : <span className="font-semibold text-gray-800">{order.header.invoice_number}</span></p>
              <p className="text-sm text-gray-500">Sale Date : 
                <span className="font-semibold text-gray-800">
                  {new Date(order.header.order_date).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Customer Information :</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>Customer Name : <span className="font-medium">{order.header.customer.customer_name}</span></p>
              <p>Customer Email : <span className="font-medium">{order.header.customer?.customer_email}</span></p>
              <p>Phone Number : <span className="font-medium">{order.header.customer?.customer_phone}</span></p>
              <p>Address : <span className="font-medium">{order.header.customer?.customer_address}</span></p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-bold text-gray-700 mb-2">Payment Information :</h3>
              <p className="text-sm">Payment Method : <span className="font-medium">{order.payments[0]?.payment_method}</span></p>
            </div>
          </div>

          {/* Product Table */}
          <table className="w-full text-left mb-8">
            <thead>
              <tr className="text-gray-500 text-sm border-b">
                <th className="py-2">NO</th>
                <th className="py-2">Product Name</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
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

          {/* Totals */}
          <div className="w-full flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Amount :</span> <span className="font-bold">{order.header.calculated_total_amount}</span></div>
              {order.header.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount :</span> 
                  <span className="font-bold">{order.header.discount}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2"><span>Net Amount :</span> <span className="font-bold text-lg">{order.header.total_amount - order.header.discount}</span></div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">  
            
            
            {order.header.status !== 'Confirmed' && (
              <button 
                onClick={handleConfirmSale}
                className="px-8 py-2 bg-[#F25278] text-white rounded-lg hover:bg-[#d64566]"
              >
                Confirm Sale
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmedOrderDetailsPage;