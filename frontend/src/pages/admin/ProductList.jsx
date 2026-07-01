import React, { useState, useEffect } from 'react';

import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Search Filter Logic
  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden bg-gray-50">
      {/* <Sidebar /> */}
      
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* Header Section */}
        <header className="h-16 flex justify-end items-center px-8 bg-white border-b border-gray-200 shadow-sm w-full">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
            <i className="fa-solid fa-user text-gray-500"></i>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
            <button className="bg-[#F25278] text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition">
              + Add New Product
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <input 
              type="text" 
              placeholder="Enter Product ID or Product Name" 
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25278]"
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="p-3 border border-gray-200 rounded-lg w-40 focus:outline-none">
              <option>Category</option>
            </select>
            <button className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition">
              Search
            </button>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                  <th className="px-6 py-4">Product ID</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Unit Price(Ks)</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Selling Price(Ks)</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-700">{p.product_id}</td>
                    <td className="px-6 py-4 text-gray-600">{p.product_name}</td>
                    <td className="px-6 py-4 text-gray-600">{p.category_name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{p.unit_price}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{p.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{p.selling_price}</td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button className="text-green-600 hover:text-green-800"><i className="fa-solid fa-pen"></i></button>
                      <button className="text-red-600 hover:text-red-800"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;