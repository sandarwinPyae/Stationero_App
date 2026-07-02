import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/admin/Sidebar';
import Pagination from '../../components/admin/Pagination';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);

    // Search Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "" || p.category_id.toString() === selectedCategory;
    
    const matchesTab = activeTab === 'active' ? p.del_flag === 0 : p.del_flag === 1;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.category_id] = cat.category_name;
      return acc;
    }, {});
  }, [categories]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(activeTab);
    setCurrentPage(1);
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  const fetchProducts = async (tab = activeTab) => {
    try {
      const isDeleted = tab === 'deleted';
      const response = await axios.get(`http://localhost:8000/products?include_deleted=${isDeleted}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [search, selectedCategory, activeTab]);

  const handleDelete = async (id) => {
    try {
      // 1. method ကို delete နဲ့ပြောင်းပါ
      // 2. URL ကို backend မှာရေးထားတဲ့အတိုင်း /products/${id} လို့ပြောင်းပါ
      await axios.delete(`http://localhost:8000/products/${id}`);
      
      alert("Product moved to deleted list!");
      setIsModalOpen(false);
      fetchProducts(); 
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden bg-gray-50">
      {/* <Sidebar /> */}
      
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* Header Section */}
        <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] border-b border-gray-200 shadow-sm w-full">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
            <i className="fa-solid fa-user text-gray-500"></i>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
            <button 
              onClick={() => navigate('/add-product')} 
              className="bg-[#F25278] text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
            >
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
            <select 
              className="p-3 border border-gray-200 rounded-lg w-40 focus:outline-none"
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)} 
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
           
            <div className="flex bg-gray-200 rounded-lg p-1">
              {[{label: 'Active', value: 'active'}, {label: 'Deleted', value: 'deleted'}].map((tab) => (
                <button 
                  key={tab.value} 
                  type="button"
                  onClick={() => setActiveTab(tab.value)} 
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    activeTab === tab.value 
                      ? 'bg-white text-[#F25278] shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
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
                  {currentItems.length > 0 ? (
                    currentItems.map((p) => (
                      <tr key={p.product_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-700">{p.product_id}</td>
                        <td className="px-6 py-4 text-gray-600">{p.product_name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {categoryMap[p.category_id] || "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">{p.unit_price}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{p.current_qty}</td>
                        <td className="px-6 py-4 text-right text-gray-600">{p.selling_price}</td>
                        <td className="px-6 py-4 flex justify-center gap-3">
                          {p.del_flag === 0 ? (
                            <>
                              {/* View Button */}
                              <button 
                                onClick={() => navigate(`/view-product/${p.product_id}`)}
                                className="text-[#405169] hover:text-[#2d3a4d] transition"
                              >
                                <i className="fa-solid fa-eye"></i>
                              </button>

                              {/* Edit Button */}
                              <button 
                                onClick={() => navigate(`/edit-product/${p.product_id}`)}
                                className="text-green-600 hover:text-green-800 transition"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>

                              {/* Delete Button */}
                              <button 
                                onClick={() => { setProductIdToDelete(p.product_id); setIsModalOpen(true); }}
                                className="text-red-600 hover:text-red-800 transition"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">
                              Removed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        <p>No products found matching your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
            </table>

            <Pagination 
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                  <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
                  <p className="mb-6 text-gray-600">This action will delete the product.</p>
                  <div className="flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        handleDelete(productIdToDelete);
                      }} 
                      className="px-4 py-2 bg-[#F25278] text-white rounded-md hover:bg-pink-600"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ProductList;