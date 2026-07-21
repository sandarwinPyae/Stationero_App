import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../../components/admin/Pagination';

const ProductList = ({toggleSidebar}) => {
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
  const [productNameToDelete, setProductNameToDelete] = useState("");

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const formattedId = `p${p.product_id.toString().padStart(3, '0')}`;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      p.product_name.toLowerCase().includes(searchLower) || 
      formattedId.includes(searchLower);
      
    const matchesCategory = selectedCategory === "" || p.category_id.toString() === selectedCategory;
    const matchesTab = activeTab === 'active' ? p.del_flag === 0 : p.del_flag === 1;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    } catch (error) { console.error(error); }
  };

  const fetchProducts = async (tab = activeTab) => {
    try {
      const isDeleted = tab === 'deleted';
      const response = await axios.get(`http://localhost:8000/products?include_deleted=${isDeleted}`);
      setProducts(response.data);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) { alert("Failed to delete."); }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col w-full">
        {/* Header - Adjusted for Mobile */}
        <header className="h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
          <button onClick={toggleSidebar} className="md:hidden text-gray-600 text-xl">
            <i className="fa-solid fa-bars"></i>
          </button>
          <div className="ml-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer">
            <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 md:p-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Product List</h2>
            <button 
              onClick={() => navigate('/add-product')} 
              className="bg-[#F25278] text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold w-full sm:w-auto"
            >
              + Add New Product
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <input 
              type="text" 
              placeholder="Search product..." 
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F25278]"
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2 w-full lg:w-auto">
              <select className="p-3 border border-gray-200 rounded-lg flex-1 lg:w-40" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
              </select>
              <div className="flex bg-gray-200 rounded-lg p-1">
                {[{label: 'Active', value: 'active'}, {label: 'Deleted', value: 'deleted'}].map((tab) => (
                  <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`px-4 py-2 rounded-md ${activeTab === tab.value ? 'bg-white text-[#F25278]' : 'text-gray-500'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                  <th className="px-6 py-4 text-right">Selling Price</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((p) => (
                    <tr key={p.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 align-top">
                        {`P${p.product_id.toString().padStart(3, '0')}`}
                      </td>
                      <td className="px-6 py-4 align-top">{p.product_name}</td>
                      <td className="px-6 py-4 align-top">{categoryMap[p.category_id]}</td>
                      <td className="px-6 py-4 align-top">{p.current_qty}</td>
                      <td className="px-6 py-4 align-top text-right">{p.unit_price}</td>
                      <td className="px-6 py-4 align-top text-right">{p.selling_price}</td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex justify-center gap-3">
                          {p.del_flag === 0 ? (
                            <>
                              <button onClick={() => navigate(`/view-product/${p.product_id}`)} className="text-[#405169]"><i className="fa-solid fa-eye"></i></button>
                              <button onClick={() => navigate(`/edit-product/${p.product_id}`)} className="text-blue-600"><i className="fa-solid fa-pen-to-square"></i></button>
                              <button onClick={() => { setProductIdToDelete(p.product_id); setProductNameToDelete(p.product_name); setIsModalOpen(true); }} className="text-red-600"><i className="fa-solid fa-trash"></i></button>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">Removed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (Moved out of table div) */}
          <div className="mt-6">
            <Pagination 
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      {/* Modal (Moved out of content div) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete <strong>{productNameToDelete}</strong>? 
              This action cannot be undone.</p>
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
  );
};

export default ProductList;