import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:8000/categories/${id}`) 
      .then(res => {
        setCategoryName(res.data.category_name); 
      })
      .catch(err => console.error("Error fetching data:", err));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:8000/categories/${id}`, { category_name: categoryName });
    navigate('/categories');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="h-16 flex items-center justify-between px-8 bg-[#F8FAFC] border-b border-gray-200">
        <button 
          onClick={() => navigate('/categories')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </div>

      <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Edit Category</h2>
        <form onSubmit={handleUpdate}>
          <label className="block text-sm font-medium text-gray-600 mb-2">Category Name</label>
          <input 
            value={categoryName} 
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-pink-500/20 outline-none" 
            required
          />
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="flex-1 bg-[#F25278] text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition"
            >
              Update
            </button>
            <button 
              type="button"
              onClick={() => setCategoryName("")} 
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdateCategoryPage;