import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      userService.getMyProfile()
        .then(data => {
          setUser(data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false); // Tắt loading dù thành công hay thất bại
        });
    } else {
      setLoading(false); // Không có token cũng tắt loading
    }
  }, [token]);

  const login = (accessToken, refreshToken, role) => { 
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser({ roleName: role });

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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);