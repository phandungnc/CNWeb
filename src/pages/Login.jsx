import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Login.css'; 

const Login = () => {
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const { login } = useAuth();
  //giải mã token
  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      //Gọi API đăng nhập
      const res = await authService.login({ userCode, password });

const accessToken =
  res.data?.accessToken || res.accessToken;

const refreshToken =
  res.data?.refreshToken;


      if (!accessToken) {
        throw new Error("Lỗi: Không nhận được Token từ server.");
      }

      //Giải mã Token để lấy Role 
      const decoded = parseJwt(accessToken);
      const role = decoded?.role;

      if (!role) {
        throw new Error("Lỗi: Token không chứa thông tin quyền hạn.");
      }

      console.log("Đăng nhập thành công với quyền:", role);

      //Gọi hàm login để điều hướng
await login(accessToken, refreshToken, role);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header của Card */}
        <div className="login-header">
          <img src="/logo.jpg" alt="Logo" className="login-logo" />
          <h2>Đăng Nhập</h2>
        </div>
        
        {/* Form */}
        <form onSubmit={handleLogin} className="login-form" autoComplete="off">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Tài khoản</label>
            <input 
              type="text" 
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Nhập mã số người dùng"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-input-wrapper" style={{position: 'relative'}}>
                <input 
                type={showPassword ? "text" : "password"} // Xử lý ẩn hiện
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
                className="form-input password-field"
                autoComplete="new-password"
                style={{paddingRight: '50px'}} 
                />
                <span 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: 'absolute', right: '15px', top: '50%', 
                        transform: 'translateY(-50%)', cursor: 'pointer', 
                        userSelect: 'none', fontSize: '0.8rem', color: '#666'
                    }}
                >
                    {showPassword ? "Ẩn" : "Hiện"}
                </span>
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <span className="loader"></span> : 'Đăng Nhập'}
          </button>
        </form>

        {/* Footer nhỏ */}
        <div className="login-footer">
          <p>Nếu gặp vấn đề gì về tài khoản, sử dụng email hoặc số điện thoại của bạn để liên hệ với Admin</p>
          <p>Email: Admin@test.com</p>
          <p>SĐT: 0123456789</p>
        </div>
      </div>
    </div>
  );
};

export default Login;