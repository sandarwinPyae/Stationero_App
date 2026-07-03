import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("active");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;


  useEffect(() => {
    fetchCategories();
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const fetchCategories = async () => {
    try {
      const isDeleted = filter === "deleted";
      const res = await axios.get(`http://localhost:8000/categories?include_deleted=${isDeleted}`);
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
  try {
    await axios.delete(`http://localhost:8000/categories/${id}`);
    alert("Category deleted successfully!");
    setIsModalOpen(false);
    fetchCategories(); // စာရင်းကို refresh လုပ်ရန်
  } catch (err) {
    console.error("Error deleting category:", err);
    alert("Failed to delete category.");
  }
  };

  // Search Logic 
  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "active" ? c.del_flag === 0 : c.del_flag === 1;
    return matchesSearch && matchesFilter;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCategories.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredCategories.length / recordsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="h-16 flex justify-end items-center px-8 bg-white border-b border-gray-100 shadow-sm mb-8">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200">
          <i className="fa-solid fa-user text-gray-500"></i>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <input 
              type="text"
              placeholder="Search category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-500/20 w-64" 
            />

            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setFilter("active")}
                className={`px-6 py-2 rounded-lg font-medium transition ${filter === "active" ? "bg-white shadow-sm text-[#F25278]" : "text-gray-500"}`}
              >Active</button>
              <button 
                onClick={() => setFilter("deleted")}
                className={`px-6 py-2 rounded-lg font-medium transition ${filter === "deleted" ? "bg-white shadow-sm text-[#F25278]" : "text-gray-500"}`}
              >Deleted</button>
            </div>
          </div>

          <button 
          onClick={() => navigate('/categories/add')}
          className="bg-[#F25278] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-pink-600 transition">
            + Add Category
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="p-5 font-semibold text-gray-600">Category Id</th>
                <th className="p-5 font-semibold text-gray-600">Category Name</th>
                <th className="p-5 font-semibold text-gray-600">Created Date</th>
                <th className="p-5 font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {currentRecords.length > 0 ? (
                currentRecords.map((c) => (
                <tr key={c.category_id} className="hover:bg-gray-50/50 transition">
                    <td className="p-5 text-gray-700">{c.category_id}</td>
                    <td className="p-5 font-medium text-gray-800">{c.category_name}</td>
                    <td className="p-5 text-gray-500">{c.created_date}</td>
                    <td className="p-5 flex justify-center gap-3">
                    <button 
                        onClick={() => navigate(`/categories/${c.category_id}`)} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                        <i className="fa-solid fa-pen text-sm"></i>
                    </button>
                    <button 
                        onClick={() => { setCategoryToDelete(c.category_id); setIsModalOpen(true); }} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                        <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400">
                    No category found matching your search.
                </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            {[...Array(nPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white' : 'bg-white'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
                <p className="mb-6 text-gray-600">This action will delete the category.</p>
                <div className="flex justify-end gap-4">
                    <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-4 py-2 bg-gray-200 rounded-md"
                    >
                    Cancel
                    </button>
                    <button 
                    onClick={() => handleDelete(categoryToDelete)} 
                    className="px-4 py-2 bg-[#F25278] text-white rounded-md"
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
export default CategoryList;