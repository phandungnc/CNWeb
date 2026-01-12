import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Load thông tin user khi F5 trang
      userService.getMyProfile()
        .then(data => setUser(data))
        .catch(() => {
            // Nếu Token lỗi hoặc Session hết hạn Logout luôn
            logout(); 
        });
    }
  }, [token]);

  const login = (accessToken, refreshToken, role) => { 
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser({ roleName: role });

    // Điều hướng theo quyền
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'TEACHER') navigate('/teacher');
    else if (role === 'STUDENT') navigate('/student');
    else navigate('/');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);