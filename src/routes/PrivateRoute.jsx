import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar'; 

const PrivateRoute = ({ roles, checkLayout = false }) => {
  const { user, loading } = useAuth();

  //loading thông tin user 
  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  // chưa đăng nhập thì chuyển về login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // sai quyền thì báo lỗi
  if (roles && !roles.includes(user.roleName)) {
    
    const ErrorContent = (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
        <h2>Quyền truy cập bị từ chối</h2>
        <p>Bạn không có quyền truy cập vào khu vực này.</p>
      </div>
    );

    // Nếu là trang Admin cần Layout giả để hiện Navbar
    if (checkLayout) {
      return (
        <>
          <Navbar toggleSidebar={() => {}} /> 
          {ErrorContent}
        </>
      );
    }

    // Nếu là trang con (Student/Teacher) thì hiện lỗi ngay trong MainLayout
    return ErrorContent;
  }

  // đúng quyền thì cho đi tiếp
  return <Outlet />;
};

export default PrivateRoute;