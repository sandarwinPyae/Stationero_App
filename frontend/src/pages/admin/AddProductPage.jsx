import React, { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    unit_price: '',
    selling_price: '',
    current_qty: '',
    product_img_url: null, 
    description: ''        
  });

  useEffect(() => {
    const fetchCategories = async () => {
        try {
        const response = await axios.get('http://localhost:8000/categories'); // သင့် backend route အတိုင်း
        setCategories(response.data);
        } catch (error) {
        console.error('Error fetching categories:', error);
        }
    };
    fetchCategories();
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, product_img_url: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();
  data.append("product_name", formData.product_name);
  data.append("category_id", formData.category_id);
  data.append("unit_price", formData.unit_price);
  data.append("selling_price", formData.selling_price);
  data.append("current_qty", formData.current_qty);
  data.append("description", formData.description);
  if (formData.product_img_url) {
    data.append("image", formData.product_img_url); 
  }

  try {
    await axios.post('http://localhost:8000/products/add', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert('Product added successfully!');
    navigate('/products');
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    alert("Error: " + JSON.stringify(error.response?.data));
  }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 flex items-center justify-between px-8 bg-[#F8FAFC] border-b border-gray-200">
        <button 
          onClick={() => navigate('/products')}
          className="text-gray-600 hover:text-[#F25278] transition-colors font-medium flex items-center"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Back
        </button>
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
        
        <form 
            onSubmit={handleSubmit} 
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-4xl"
            >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                
                {/* Product Name */}
                <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Product Name</label>
                <input 
                    type="text" name="product_name" value={formData.product_name} onChange={handleChange}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 outline-none transition" 
                    placeholder="e.g. Apolo Drawing Book" required
                />
                </div>

                {/* Category */}
                <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Category</label>
                <select 
                    name="category_id" value={formData.category_id} onChange={handleChange}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 outline-none transition"
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                </select>
                </div>

                {/* Unit Price & Quantity */}
                <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Unit Price</label>
                <input 
                  type="number" 
                  name="unit_price" 
                  value={formData.unit_price} 
                  onChange={handleChange} 
                  min="0"
                  onKeyDown={(e) => {
                    const invalidChars = ["-", "+", "e", "E"];
                    if (invalidChars.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 outline-none transition" 
                  placeholder="0.00" 
                  required
                />
                </div>
                
                <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Quantity</label>
                <input 
                    type="number" name="current_qty" value={formData.current_qty} onChange={handleChange}
                    min="0"
                    onKeyDown={(e) => {
                      const invalidChars = ["-", "+", "e", "E"];
                      if (invalidChars.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 outline-none transition" 
                    placeholder="0" required
                />
                </div>

                {/* Selling Price */}
                <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Selling Price</label>
                <input 
                    type="number" name="selling_price" value={formData.selling_price} onChange={handleChange}
                    min="0"
                    onKeyDown={(e) => {
                      const invalidChars = ["-", "+", "e", "E"];
                      if (invalidChars.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 outline-none transition" 
                    placeholder="0.00" required
                />
                </div>

                {/* Image Upload */}
                <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Product Image</label>
                <input 
                    type="file" onChange={handleFileChange}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition" 
                />
                </div>

                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea 
                    rows="4" name="description" value={formData.description} onChange={handleChange}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 outline-none transition"
                    placeholder="Write product details here..."
                ></textarea>
                </div>
            </div>
            
            <div className="mt-10 flex">
                <button 
                type="submit" 
                className="bg-[#F25278] hover:bg-pink-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-pink-200 transition-all transform hover:scale-105"
                >
                Add Product
                </button>
            </div>
            </form>
      </div>
    </div>
    
  );
};

export default AddProductPage;