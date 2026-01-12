import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardForms.css'; 

const ChangePassword = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  
  // State thông báo
  const [toast, setToast] = useState(null); 
  // Tự tắt Toast sau 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const validateForm = () => {
    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setToast({ type: 'error', title: 'Thiếu thông tin', msg: 'Vui lòng điền đầy đủ các trường!' });
      return false;
    }

    // kiểm tra độ dài tối thiểu 8 ký tự
    if (newPassword.length < 8) {
      setToast({ type: 'error', title: 'Mật khẩu yếu', msg: 'Mật khẩu mới phải có tối thiểu 8 ký tự!' });
      return false;
    }

    //kiểm tra Regex (Chữ hoa, thường, số, ký tự đặc biệt)
    const passwordRegex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#&()–[{}]:;',?/*~$^+=<>]).{8,}$");    
    if (!passwordRegex.test(newPassword)) {
      setToast({ 
        type: 'error', 
        title: 'Mật khẩu không đạt chuẩn', 
        msg: 'Phải chứa ít nhất: 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (!@#&...).' 
      });
      return false;
    }

    //Kiểm tra khớp mật khẩu
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', title: 'Lỗi xác nhận', msg: 'Mật khẩu xác nhận không khớp!' });
      return false;
    }

    //Kiểm tra trùng mật khẩu cũ
    if (newPassword === oldPassword) {
        setToast({ type: 'error', title: 'Trùng lặp', msg: 'Mật khẩu mới không được trùng mật khẩu cũ!' });
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setToast(null);

    try {
      await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      
      setToast({ type: 'success', title: 'Thành công', msg: 'Đổi mật khẩu thành công! Đang đăng xuất...' });
      setTimeout(() => logout(), 2000);

    } catch (err) {
      const serverMsg = err.response?.data?.message || 'Mật khẩu cũ không chính xác';
      setToast({ type: 'error', title: 'Lỗi hệ thống', msg: serverMsg });
      setLoading(false);
    }
  };

  const toggleShow = (field) => setShowPass(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <>
      {/* toast */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'toast-success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon">
             {toast.type === 'success' ? '' : ''}
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-msg">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="modern-card">
        <h2 className="card-title">Đổi Mật Khẩu</h2>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Mật khẩu cũ</label>
            <div className="password-wrapper">
              <input className="modern-input"
                type={showPass.old ? "text" : "password"} 
                value={formData.oldPassword}
                onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                placeholder="Nhập mật khẩu cũ"
              />
              <span className="toggle-text" onClick={() => toggleShow('old')}>{showPass.old ? "Ẩn" : "Hiện"}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu mới</label>
            <div className="password-wrapper">
              <input className="modern-input"
                type={showPass.new ? "text" : "password"} 
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                placeholder="Nhập mật khẩu mới"
              />
              <span className="toggle-text" onClick={() => toggleShow('new')}>{showPass.new ? "Ẩn" : "Hiện"}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <div className="password-wrapper">
              <input className="modern-input"
                type={showPass.confirm ? "text" : "password"} 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Xác nhận mật khẩu mới"
              />
              <span className="toggle-text" onClick={() => toggleShow('confirm')}>{showPass.confirm ? "Ẩn" : "Hiện"}</span>
            </div>
          </div>

          <div className="btn-actions">
              <button type="submit" className={`modern-btn btn-blue ${loading ? 'btn-disabled' : ''}`} disabled={loading} style={{width: '100%'}}>
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;