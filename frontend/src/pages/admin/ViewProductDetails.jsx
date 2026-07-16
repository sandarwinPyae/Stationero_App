import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewProductDetails = ({toggleSidebar}) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [productNameToDelete, setProductNameToDelete] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/products/${id}`);
      
      alert("Product deleted successfully!");
      setIsModalOpen(false);
      
      navigate('/products'); 
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  // if (!product) return <div className="p-8">Loading...</div>;
  if (!product) return (
  <div className="min-h-screen flex flex-col justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25278]"></div>
    <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
  </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 flex justify-between items-center px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          
          <button 
            onClick={() => navigate('/products')}
            className="hidden sm:flex text-gray-600 hover:text-[#F25278] transition-colors font-medium items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>
        </div>

        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-200">
          <i className="fa-solid fa-user text-gray-500" onClick={() => navigate('/admin/dashboard')}></i>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="p-6 pt-24">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10">
          
          {/* Image Side */}
          <div className="w-full md:w-1/2 bg-gray-100 rounded-2xl flex items-center justify-center h-80 overflow-hidden">
            {product.product_img_url ? (
              <img 
                src={`http://localhost:8000/${product.product_img_url}`} 
                alt={product.product_name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = '/placeholder.png'; }} 
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          
          {/* Details Side */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.product_name}</h1>
            
            {/* Price & Qty Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Unit Price</p>
                <p className="text-lg font-bold text-gray-800">{product.unit_price} MMK</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Selling Price</p>
                <p className="text-lg font-bold text-[#F25278]">{product.selling_price} MMK</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 col-span-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Current Quantity</p>
                <p className="text-lg font-bold text-gray-800">{product.current_qty}</p>
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description || "No description provided."}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => navigate(`/edit-product/${id}`)} 
                className="flex-1 bg-[#F25278] text-white py-3 rounded-xl font-semibold"
              >
                Edit
              </button>
              <button 
                onClick={() => { setProductIdToDelete(product.product_id);setProductNameToDelete(product.product_name); setIsModalOpen(true); }}
                className="flex-1 border border-[#F25278] text-[#F25278] py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                  <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
                  <p className="mb-6 text-gray-600">
                    Are you sure you want to delete <strong>{productNameToDelete}</strong>? 
                    This action cannot be undone.
                  </p>
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
      );
    };

export default ViewProductDetails;