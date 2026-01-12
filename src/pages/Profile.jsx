import { useState, useEffect } from 'react';
import userService from '../services/userService';
import '../styles/DashboardForms.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    userCode: '', roleName: '', fullName: '', email: '', phoneNumber: ''
  });
  const [backupData, setBackupData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State Toast
  const [toast, setToast] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadProfile = async () => {
    try {
      const data = await userService.getMyProfile();
      const profile = {
        userCode: data.userCode, roleName: data.roleName,
        fullName: data.fullName, email: data.email, phoneNumber: data.phoneNumber
      };
      setFormData(profile);
      setBackupData(profile);
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setToast({ type: 'error', title: 'Lỗi định dạng', msg: 'Địa chỉ Email không hợp lệ!' });
      return false;
    }
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!formData.phoneNumber || !phoneRegex.test(formData.phoneNumber)) {
      setToast({ type: 'error', title: 'Lỗi định dạng', msg: 'Số điện thoại phải từ 10-11 số!' });
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setToast(null);

    try {
      await userService.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      });
      setToast({ type: 'success', title: 'Thành công', msg: 'Cập nhật hồ sơ thành công!' });
      setBackupData(formData);
      setIsEditing(false);
    } catch (err) {
      setToast({ type: 'error', title: 'Thất bại', msg: err.response?.data?.message || 'Có lỗi xảy ra' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(backupData);
    setIsEditing(false);
    setToast(null);
  };

  return (
    <>
      {/* TOAST COMPONENT */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon">{toast.type === 'success' ? '' : ''}</div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-msg">{toast.msg}</div>
          </div>
        </div>
      )}

      <div className="modern-card">
        <h2 className="card-title">Hồ Sơ Cá Nhân</h2>
        
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Mã số</label>
                  <input className="modern-input" type="text" value={formData.userCode} disabled />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Vai trò</label>
                  <input className="modern-input" type="text" value={formData.roleName} disabled />
              </div>
          </div>

          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input className="modern-input" type="text" value={formData.fullName} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="modern-input" type="text" name="email"
              value={formData.email} onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input 
              className="modern-input" type="text" name="phoneNumber"
              value={formData.phoneNumber} onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="btn-actions">
            {!isEditing ? (
              <button type="button" className="modern-btn btn-blue" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button type="button" className="modern-btn btn-gray" onClick={handleCancel} disabled={loading}>
                  Hủy bỏ
                </button>
                <button type="submit" className={`modern-btn btn-blue ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;