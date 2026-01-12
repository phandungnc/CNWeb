import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css'; 

const Navbar = ({ toggleSidebar }) => { // Nhận prop toggleSidebar trực tiếp ở đây
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Logo click về theo role
  const getHomeLink = () => {
    if (user?.roleName === 'ADMIN') return '/admin';
    if (user?.roleName === 'TEACHER') return '/teacher';
    return '/student';
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        {/* Chỉ hiện nếu là ADMIN */}
        {user?.roleName === 'ADMIN' && (
          <button 
            onClick={toggleSidebar}
            style={{
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '24px', 
              color: '#333',
              marginRight: '25px', 
              padding: '0 5px'    
            }}
          >
            ☰
          </button>
        )}
        
        <Link to={getHomeLink()} className="navbar-logo">
          <img src="/logo.jpg" alt="Logo" />
          <span>SmartExam</span>
        </Link>
      </div>

      {/* Thông tin User bên phải */}
      <div className="navbar-user" onClick={() => setShowDropdown(!showDropdown)}>
        <span className="user-name">{user?.fullName || 'User'}</span>
        <img src="/user.jpg" alt="User Icon" className="user-avatar" />
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="dropdown-menu">
            <Link to="/profile">Hồ sơ</Link>
            <Link to="/change-password">Đổi mật khẩu</Link>
            <div onClick={logout} className="dropdown-item logout">Đăng xuất</div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;