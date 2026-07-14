import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddPurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]); 
  const [suppliers, setSuppliers] = useState([]); 
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/products');
      const suppRes = await axios.get('http://localhost:8000/suppliers'); 
      setAvailableProducts(res.data);
      setSuppliers(suppRes.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addProductRow = () => {
    setProducts([...products, { id: '', name: '', qty: 0, unitPrice: 0, sellingPrice: 0, total: 0 }]);
  };

  const removeProductRow = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    if (updated.length === 0) setIsFormVisible(false);
  };

  const handleProductSelect = (index, value, type) => {
    let selected;
    if (type === 'id') {
      selected = availableProducts.find(p => p.product_id.toString() === value);
    } else if (type === 'name') {
      selected = availableProducts.find(p => p.product_name === value);
    }

    const updated = [...products];
    updated[index] = {
      ...updated[index],
      id: selected ? selected.product_id.toString() : updated[index].id,
      name: selected ? selected.product_name : value,
      unitPrice: selected ? selected.unit_price : updated[index].unitPrice,
      sellingPrice: selected ? selected.selling_price : updated[index].sellingPrice,
      total: selected ? (selected.unit_price * updated[index].qty) : updated[index].total
    };
    setProducts(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    
    if (field === 'qty' || field === 'unitPrice') {
      updated[index].total = Number(updated[index].qty) * Number(updated[index].unitPrice);
    }
    setProducts(updated);
  };

  const calculateGrandTotal = () => {
    return products.reduce((sum, p) => sum + Number(p.total), 0);
  };

  const handleSaveOrder = async () => {
    if (!selectedSupplier) {
      alert("Supplier is needed to select.");
      return;
    }
    if (products.length === 0 || !products[0].id) {
      alert("At least One Product is required.");
      return;
    }

    const payload = {
      supplier_id: Number(selectedSupplier),
      payment_method: paymentMethod,
      items: products.map(p => ({
        product_id: Number(p.id),
        qty: Number(p.qty),
        unit_price: Number(p.unitPrice),
        selling_price: Number(p.sellingPrice || 0)
      }))
    };

    try {
      const res = await axios.post('http://localhost:8000/purchase-orders', payload);
      navigate(-1); 
    } catch (err) {
      console.error("Error creating PO:", err);
      alert("Error in Purchase Order Creation။");
    }
  };


  return (
    <div className="pt-4 pb-4 bg-gray-50 min-h-screen">
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
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-gray-100 pt-20">
        <h2 className="text-xl font-bold mb-6">Create Purchase Order</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="">Select a Supplier</option>
              {suppliers.map(s => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.supplier_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <input 
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
              value={paymentMethod}
              placeholder="Enter payment method (e.g. Kpay)"
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
        </div>

        {!isFormVisible ? (
          <button 
            onClick={() => { setIsFormVisible(true); addProductRow(); }} 
            className="bg-[#F25278] text-white border  px-6 py-2 rounded-xl mb-6 font-semibold shadow-sm"
          >
            + Add Products
          </button>
        ) : (
          <div className="border rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4">No</th>
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Order Qty</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p, index) => (
                  <tr key={index}>
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">
                      <select onChange={(e) => handleProductSelect(index, e.target.value, 'id')} value={p.id} className="border rounded px-2 py-1 w-28">
                        <option value="">Select ID</option>
                        {availableProducts.map(item => <option key={item.product_id} value={item.product_id}>{item.product_id}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <select onChange={(e) => handleProductSelect(index, e.target.value, 'name')} value={p.name} className="border rounded px-2 py-1 w-48">
                        <option value="">Select Product Name</option>
                        {availableProducts.map(item => <option key={item.product_id} value={item.product_name}>{item.product_name}</option>)}
                      </select>
                    </td>
                    <td className="p-4"><input type="number" value={p.qty} onChange={(e) => handleInputChange(index, 'qty', e.target.value)} className="w-16 border rounded px-1" /></td>
                    <td className="p-4"><input type="number" value={p.unitPrice} onChange={(e) => handleInputChange(index, 'unitPrice', e.target.value)} className="w-20 border rounded px-1" /></td>
                    <td className="p-4"><input type="number" value={p.sellingPrice} onChange={(e) => handleInputChange(index, 'sellingPrice', e.target.value)} className="w-20 border rounded px-1" /></td>
                    <td className="p-4 font-semibold">{p.total}</td>
                    <td className="p-4 flex gap-3 text-lg">
                      <button type="button" onClick={addProductRow} className="text-blue-600"><i className="fa-solid fa-circle-plus"></i></button>
                      <button type="button" onClick={() => removeProductRow(index)} className="text-red-500"><i className="fa-solid fa-circle-minus"></i></button>
                    </td>
                  </tr>
                ))}
                
              </tbody>
            </table>
          </div>

          
        )}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Total Amount</span>
            <span>{calculateGrandTotal()} MMK</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold">Payment Method</span>
            <span>{paymentMethod || "-"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold">Purchase Order Date</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {isFormVisible && (
          <div className="flex gap-4 mt-6">
            
            <button type="button" onClick={handleSaveOrder} className="bg-[#F25278] text-white px-8 py-2 rounded-lg font-semibold">
              Save Purchase Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPurchaseOrderPage;