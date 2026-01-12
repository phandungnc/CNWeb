import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar'; 
import Sidebar from '../../components/Admin/Sidebar'; 
import '../../components/Admin/Sidebar.css';

const AdminLayout = () => {
const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main style={{ 
        padding: '30px', 
        marginLeft: isSidebarOpen ? '260px' : '0', // Đẩy nội dung khi sidebar mở
        transition: 'margin 0.3s ease-in-out'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;