import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpdateProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    product_name: '', category_id: '', unit_price: '',
    selling_price: '', current_qty: '', description: ''
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [addedQty, setAddedQty] = useState(0); 

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/${id}`);
      setProduct(response.data);
      setPreview(`http://localhost:8000/${response.data.product_img_url}`);
    } catch (error) { console.error("Error:", error); }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8000/categories");
      setCategories(res.data);
    } catch (err) { console.error("Error:", err); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('product_name', product.product_name);
    formData.append('category_id', Number(product.category_id));
    formData.append('unit_price', Number(product.unit_price));
    formData.append('selling_price', Number(product.selling_price));
    formData.append('current_qty', Number(product.current_qty));
    formData.append('new_qty', Number(addedQty)); 
    formData.append('description', product.description);
    if (image) formData.append('image', image);

    try {
      await axios.put(`http://localhost:8000/products/edit/${id}`, formData);
      navigate('/products');
    } catch (error) { alert("Update Failed"); }
  };

  const handleKeyDown = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-800">Edit Product</h2>
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-[#F25278] font-medium">← Back</button>
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-48 h-48 rounded-3xl border-4 border-slate-100 overflow-hidden bg-slate-100 mb-4 shadow-inner">
                {preview ? <img src={preview} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">No Image</div>}
              </div>
              <input type="file" id="fileInput" className="hidden" onChange={(e) => { setImage(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); }} />
              <label htmlFor="fileInput" className="cursor-pointer px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition text-sm">Change Image</label>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                <input type="text" value={product.product_name} onChange={e => setProduct({...product, product_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unit Price (Ks)</label>
                  <input type="number" min="0" value={product.unit_price} onKeyDown={handleKeyDown} onChange={e => setProduct({...product, unit_price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Selling Price (Ks)</label>
                  <input type="number" min="0" value={product.selling_price} onKeyDown={handleKeyDown} onChange={e => setProduct({...product, selling_price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select value={product.category_id} onChange={e => setProduct({...product, category_id: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none bg-white">
                {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
              </select>
            </div>
            
            {/* Stock Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Stock</label>
                    <input type="number" disabled value={product.current_qty} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-emerald-600 mb-2">Add New Stock</label>
                    <input 
                        type="number" min="0" value={addedQty} onKeyDown={handleKeyDown} 
                        onChange={e => setAddedQty(e.target.value)} 
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none" 
                    />
                </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea rows="4" value={product.description} onChange={e => setProduct({...product, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none"></textarea>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 rounded-xl font-bold text-slate-600 border hover:bg-slate-100 transition">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-[#F25278] text-white rounded-xl font-bold shadow-lg shadow-pink-200 transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductPage;