import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; 
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const handleItemClick = () => {
    // Chỉ đóng nếu sidebar đang mở
    if (isOpen && toggleSidebar) {
        toggleSidebar();
    }
  };
  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-menu">
          <NavLink to="/admin" end className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={handleItemClick}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={handleItemClick}>
            Quản lý người dùng
          </NavLink>
          <NavLink to="/admin/courses" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={handleItemClick}>
            Quản lý khóa học
          </NavLink>
          <NavLink to="/admin/classes" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={handleItemClick}>
            Quản lý lớp học
          </NavLink>
          <NavLink to="/admin/create-account" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={handleItemClick}>
            Cấp tài khoản
          </NavLink>
          <NavLink to="/admin/reset-password" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          onClick={handleItemClick}>
            Cấp lại mật khẩu
          </NavLink>
        </div>
      </aside>

      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div> //ấn ra ngoài cũng đóng dcd
      )}
    </>
  );
};

export default Sidebar;