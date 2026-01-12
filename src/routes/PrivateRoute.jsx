import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ roles }) => {
  const { user, isAuthenticated } = useAuth();

  // chưa đăng nhập thì về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <div>Loading...</div>; 
  }

  // check quyền
  if (roles && !roles.includes(user.roleName)) { 
    return <div className="unauthorized">Bạn không có quyền truy cập trang này!</div>;
  }

  return <Outlet />;
};

export default PrivateRoute;