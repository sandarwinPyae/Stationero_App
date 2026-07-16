import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';

const CustomerPage = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
    setCurrentPage(1);
  }, [activeTab]);

  const fetchCustomers = async () => {
    try {
      const isDeleted = activeTab === 'deleted';
      const response = await axios.get(`http://localhost:8000/customers?include_deleted=${isDeleted}`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone_number.includes(searchQuery)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCustomers.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredCustomers.length / recordsPerPage);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/customers/${customerToDelete.id}`);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* Main Content */}
      <div className="flex-1 w-full overflow-hidden">
        <header className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-gray-100 shadow-sm z-30">
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={toggleSidebar}
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <div className="flex-1"></div>

          <div className="flex-none">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50">
              <i 
                className="fa-solid fa-user text-gray-500 text-lg"
                onClick={() => navigate('/admin/dashboard')}
              ></i>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 pt-20 md:pt-20 w-full max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customers List</h2>

          {/* CONTROLS */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 gap-4">
            <input
              type="text"
              placeholder="Search customers..."
              className="p-2.5 border border-gray-200 rounded-lg outline-none w-full md:w-72 focus:ring-2 focus:ring-[#F25278]/20"
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            <div className="flex bg-gray-100 rounded-lg p-1 w-full md:w-auto">
              {['active', 'deleted'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:px-6 py-2 rounded-md ${activeTab === tab ? 'bg-white text-[#F25278] shadow-sm' : 'text-gray-500'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE - overflow-x-auto ထည့်ထားပေးတယ် */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecords.length > 0 ? (
                  currentRecords.map((c) => (
                    <tr key={c.customer_id} className="hover:bg-gray-50/50">
                      <td className="py-4 px-6">{c.customer_id}</td>
                      <td className="py-4 px-6 font-medium text-gray-800">{c.customer_name}</td>
                      <td className="py-4 px-6">{c.phone_number}</td>
                      <td className="py-4 px-6">{c.customer_email}</td>
                      <td className="py-4 px-6">{c.address}</td>
                      <td className="py-4 px-6">
                        {c.del_flag === 0 ? (
                          <button onClick={() => { setCustomerToDelete({ id: c.customer_id, name: c.customer_name }); setIsModalOpen(true); }} className="text-[#F25278] hover:text-red-700"><i className="fa-solid fa-trash"></i></button>
                        ) : <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">Removed</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-500">No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {nPages > 1 && (
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>
              {[...Array(nPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278]' : 'bg-white'}`}>{i + 1}</button>
              ))}
              <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerPage;