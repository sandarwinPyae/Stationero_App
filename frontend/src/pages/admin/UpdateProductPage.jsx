import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpdateProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState({
    product_name: '', category_id: '', unit_price: '',
    selling_price: '', current_qty: '', product_description: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}`);
      setProduct(response.data);
      setPreview(`http://localhost:8000/${response.data.product_img_url}`);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(product).forEach(key => formData.append(key, product[key]));
    if (image) formData.append('image', image);

    try {
      await axios.put(`http://localhost:8000/products/edit/${id}`, formData);
      alert("Product updated successfully!");
      navigate('/products');
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
    {/* Header Section */}
    <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] border-b border-gray-100 shadow-sm w-full mb-8">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
        <i className="fa-solid fa-user text-gray-500"></i>
        </div>
    </header>

    {/* Main Form Container */}
    <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>
        
        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
        
        {/* Image Upload Section */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Product Image</label>
            <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-100 shadow-inner">
                {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                <span className="text-gray-400 text-xs">No Image</span>
                )}
            </div>
            
            <div className="flex-1">
                <input 
                type="file" 
                id="fileInput"
                className="hidden"
                onChange={(e) => {
                    if (e.target.files[0]) {
                    setImage(e.target.files[0]);
                    setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                }} 
                />
                <label htmlFor="fileInput" className="cursor-pointer inline-block px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition">
                Change Image
                </label>
                <p className="text-xs text-gray-400 mt-3 italic">Recommended: 1:1 Aspect Ratio, Max 2MB</p>
            </div>
            </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" value={product.product_name} onChange={e => setProduct({...product, product_name: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition" />
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
            <input 
                type="number" 
                min="0"
                value={product.unit_price} 
                onChange={e => setProduct({...product, unit_price: e.target.value})}
                onKeyDown={handleKeyDown} // Function ကို ခေါ်သုံးခြင်း
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition" 
            />
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
            <input 
                type="number" 
                min="0"
                value={product.selling_price} 
                onChange={e => setProduct({...product, selling_price: e.target.value})}
                onKeyDown={handleKeyDown} 
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition" 
            />
            </div>

            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
            <input 
                type="number" 
                min="0"
                value={product.current_qty} 
                onChange={e => setProduct({...product, current_qty: e.target.value})}
                onKeyDown={handleKeyDown} 
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition" 
            />
            </div>

            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={product.product_description} onChange={e => setProduct({...product, product_description: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition" rows="4"></textarea>
            </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="flex-1 py-3.5 bg-[#F25278] text-white rounded-xl font-semibold hover:bg-pink-600 transition shadow-md">Save Changes</button>
        </div>
        </form>
    </div>
    </div>
    
        
    )};

export default UpdateProductPage;