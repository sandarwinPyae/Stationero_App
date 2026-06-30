import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SupplierPage = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchSuppliers();
    setCurrentPage(1);
  }, [activeTab]);

  const fetchSuppliers = async () => {
    try {
      const isDeleted = activeTab === 'deleted';
      const response = await axios.get(`http://localhost:8000/suppliers?include_deleted=${isDeleted}`);
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.supplier_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.supplier_phone_no.includes(searchQuery)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSuppliers.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredSuppliers.length / recordsPerPage);

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/suppliers/${supplierToDelete}`);
      setActiveTab('active');
      fetchSuppliers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/suppliers/${id}`);
      alert("Supplier deleted successfully!");
      setIsModalOpen(false); // Modal ပိတ်ရန်
      // Data list ကို ပြန် refresh လုပ်ပေးပါ (ဥပမာ fetchSuppliers() ကို ပြန်ခေါ်ပါ)
      fetchSuppliers(); 
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Failed to delete.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="p-8"><h1 className="text-2xl font-bold text-[#F25278]">Stationero</h1></div>
        <nav className="mt-4 px-2 space-y-1">
          <NavItem icon="fa-solid fa-chart-line" label="Dashboard" />
          <NavItem icon="fa-solid fa-user" label="Customers" />
          <NavItem icon="fa-solid fa-check-double" label="Confirm Order" />
          <NavItem icon="fa-solid fa-users" label="Suppliers" active color="#F25278" />
          <NavItem icon="fa-solid fa-box" label="Products" />
          <NavItem icon="fa-solid fa-cart-shopping" label="Purchase" />
          <NavItem icon="fa-solid fa-chart-pie" label="Inventory Reports" />
          <NavItem icon="fa-solid fa-chart-column" label="Sale Reports" />
          <NavItem icon="fa-solid fa-clipboard-list" label="Purchase Reports" />
          <NavItem icon="fa-solid fa-right-from-bracket" label="Logout" className="mt-10 text-red-500" />
        </nav>
      </aside>

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* HEADER */}
        <header className="h-16 flex justify-end items-center px-8 bg-[#F8FAFC] shadow-sm w-full">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
            <i className="fa-solid fa-user text-gray-500"></i>
          </div>
        </header>

        <main className="p-8 w-full max-w-7xl mx-auto flex-grow">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Suppliers List</h2>

          {/* CONTROLS */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search suppliers..."
                className="p-2.5 border border-gray-200 rounded-lg outline-none w-72 focus:ring-2 focus:ring-[#F25278]/20"
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['active', 'deleted'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-md ${activeTab === tab ? 'bg-white text-[#F25278] shadow-sm' : 'text-gray-500'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => navigate('/add-supplier')} className="bg-[#F25278] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md">
              <i className="fa-solid fa-plus mr-2"></i> Add Supplier
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Created Date</th>

                  <th className="py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecords.map((s) => (
                  <tr key={s.supplier_id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6">{s.supplier_id}</td>
                    <td className="py-4 px-6 font-medium text-gray-800">{s.supplier_name}</td>
                    <td className="py-4 px-6">{s.supplier_phone_no}</td>
                    <td className="py-4 px-6">{s.supplier_email}</td>
                    <td className="py-4 px-6">{s.created_date}</td>
                    <td className="py-4 px-6">

                    {s.del_flag === 0 ? (
                      <div className="flex gap-4">

                        <button onClick={() => navigate(`/edit-supplier/${s.supplier_id}`)} className="text-blue-600 hover:text-blue-800"><i className="fa-solid fa-pen-to-square"></i></button>

                        <button onClick={() => { setSupplierToDelete(s.supplier_id); setIsModalOpen(true); }} className="text-[#F25278] hover:text-red-700"><i className="fa-solid fa-trash"></i></button>

                      </div>

                    ) : <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">Removed</span>}

                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

        {nPages > 1 && (

          <div className="flex justify-center mt-8 gap-2">

            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-left"></i></button>

            {[...Array(nPages)].map((_, i) => (

              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 border rounded-lg ${currentPage === i + 1 ? 'bg-[#F25278] text-white border-[#F25278]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>

            ))}

            <button disabled={currentPage === nPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"><i className="fa-solid fa-chevron-right"></i></button>

          </div>

        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
              <p className="mb-6 text-gray-600">This action will delete the supplier.</p>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(supplierToDelete)} 
                  className="px-4 py-2 bg-[#F25278] text-white rounded-md"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};


const NavItem = ({ icon, label, active = false, color = "", className = "" }) => (
  <div className={`flex items-center p-4 cursor-pointer ${className}`} style={{ backgroundColor: active ? '#E2E8F0' : 'transparent', borderRight: active ? `4px solid ${color}` : 'none' }}>
    <span className="mr-4 text-lg w-6 text-center"><i className={icon}></i></span>
    <span className="text-gray-700 font-medium">{label}</span>
  </div>
);



export default SupplierPage;