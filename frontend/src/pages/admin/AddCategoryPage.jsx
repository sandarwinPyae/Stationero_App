import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return alert("Please enter a category name");

    try {
      await axios.post('http://localhost:8000/categories/add', { 
        category_name: categoryName 
      });
      navigate('/categories'); 
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category. Please check your backend.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* --- MAIN CONTENT --- */}
      <div className="flex-1">
        {/* --- NAVBAR --- */}
        <div className="h-16 flex justify-between items-center px-8 shadow-sm bg-[#F8FAFC]">
          <button 
            onClick={() => navigate('/categories')}
            className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back
          </button>
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            <i className="fa-solid fa-user text-gray-600" onClick={() => navigate('/admin/dashboard')}></i>
          </div>
        </div>

        {/* --- FORM CONTENT --- */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Add New Category</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm max-w-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                <input 
                  type="text" 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#F25278]/20 focus:border-[#F25278] outline-none transition" 
                  placeholder="e.g. Stationery, Electronics" 
                />
              </div>
              
              <button 
                onClick={handleSave} 
                disabled={!categoryName.trim()}
                className={`text-white px-8 py-2 rounded-md font-semibold mt-4 w-full sm:w-auto transition-opacity ${
                  !categoryName.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
                style={{ backgroundColor: '#F25278' }}
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryPage;