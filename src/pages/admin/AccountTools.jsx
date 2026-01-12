import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/DashboardForms.css';

//cấp tk mới
const CreateAccountForm = () => {
  const [formData, setFormData] = useState({
    userCode: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    roleName: 'STUDENT' // Mặc định là học sinh
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/accounts', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Tạo tài khoản thành công!');
      //reset form
      setFormData({
        userCode: '', fullName: '', email: '', phoneNumber: '', password: '', roleName: 'STUDENT'
      });
    } catch (err) {
      console.error(err);
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modern-card">
      <h3 className="card-title">Cấp tài khoản mới</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Vai trò</label>
          <select name="roleName" className="modern-input" value={formData.roleName} onChange={handleChange}>
            <option value="STUDENT">Học sinh</option>
            <option value="TEACHER">Giáo viên</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Mã số</label>
            <input type="text" name="userCode" className="modern-input" required 
                   value={formData.userCode} onChange={handleChange} placeholder="Nhập mã số" />
          </div>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input type="text" name="fullName" className="modern-input" required 
                   value={formData.fullName} onChange={handleChange} placeholder="Nhập họ và tên" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="modern-input" required 
                   value={formData.email} onChange={handleChange} placeholder="Nhập email" />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input type="text" name="phoneNumber" className="modern-input" required 
                   value={formData.phoneNumber} onChange={handleChange} placeholder="Nhập số điện thoại" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu khởi tạo</label>
          <input type="text" name="password" className="modern-input" required 
                 value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu khởi tạo" />
        </div>
        
        <button type="submit" className="modern-btn btn-blue" style={{ width: '100%', marginTop: '10px' }}>
            Tạo tài khoản
        </button>
      </form>
    </div>
  );
};

// cấp lại mật khẩu
const ResetPasswordForm = () => {
    const [data, setData] = useState({ userCode: '', newPassword: '' });
    
    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/admin/accounts/reset-password', data, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Đã cấp lại mật khẩu thành công!');
            setData({ userCode: '', newPassword: '' });
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || 'Không tìm thấy người dùng hoặc lỗi hệ thống'));
        }
    };

    return (
        <div className="modern-card">
             <h3 className="card-title">Cấp lại mật khẩu</h3>
             <form onSubmit={handleReset}>
                <div className="form-group">
                    <label className="form-label">Mã số người dùng</label>
                    <input type="text" className="modern-input" required 
                           value={data.userCode} onChange={e => setData({...data, userCode: e.target.value})} 
                           placeholder="Nhập mã số" />
                </div>
                <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <input type="text" className="modern-input" required 
                           value={data.newPassword} onChange={e => setData({...data, newPassword: e.target.value})} 
                           placeholder="Nhập mật khẩu mới" />
                </div>
                <button type="submit" className="modern-btn btn-blue" style={{ width: '100%' }}>
                    Xác nhận cấp mật khẩu
                </button>
             </form>
        </div>
    )
}

export { CreateAccountForm, ResetPasswordForm };