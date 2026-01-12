import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/DashboardForms.css'; 

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('ALL'); // ca hs va gv
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = đóng modal
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  // Gọi API lấy users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/users?';
      if (keyword) url += `keyword=${keyword}&`;
      if (tab !== 'ALL') url += `role=${tab}`;

      const res = await axios.get(url, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
      alert("Đã xóa thành công!");
    } catch (error) {
      alert("Xóa thất bại!");
    }
  };
  const handleEditClick = (user) => {
    setEditingUser(user); // Lưu user đang sửa
    setEditFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '' // Nếu null thì để trống
    });
  };

  // lưu thay đổi user
  const handleUpdateUser = async (e) => {
      e.preventDefault();
      try {
          await axios.put(`/api/admin/users/${editingUser.id}`, editFormData, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert("Cập nhật thành công!");
          setEditingUser(null); // Đóng modal
          fetchUsers(); // Load lại danh sách
      } catch (error) {
          alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Quản lý người dùng</h2>

      {/* Thanh tìm kiếm */}
      <div className="modern-card" style={{ maxWidth: '100%', marginBottom: '20px', padding: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className="modern-input" 
            placeholder="Tìm theo tên, email, mã số..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button type="submit" className="modern-btn btn-blue">Tìm kiếm</button>
        </form>

        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {['ALL', 'TEACHER', 'STUDENT'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
                color: tab === t ? '#2563eb' : '#6b7280',
                fontWeight: tab === t ? '600' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {t === 'ALL' ? 'Tất cả' : (t === 'TEACHER' ? 'Giáo viên' : 'Học sinh')}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng danh sách*/}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>Mã số</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>Họ và tên</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>SĐT</th> {/* Đã thêm SĐT */}
              <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>Vai trò</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#4b5563' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>Đang tải...</td></tr>
            ) : (!users || users.length === 0) ? (
               <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>Không tìm thấy dữ liệu</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '15px' }}>{u.userCode}</td>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{u.fullName}</td>
                  <td style={{ padding: '15px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '15px' }}>{u.phoneNumber}</td> 
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                      backgroundColor: u.roleName === 'TEACHER' ? '#eff6ff' : '#ecfdf5',
                      color: u.roleName === 'TEACHER' ? '#2563eb' : '#059669'
                    }}>
                      {u.roleName}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button 
                        className="modern-btn btn-gray" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' }}
                        onClick={() => handleEditClick(u)} // Nút Sửa
                    >
                        Sửa
                    </button>
                    <button 
                      className="modern-btn" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#ef4444', color: 'white' }}
                      onClick={() => handleDelete(u.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* modal sửa người dùng */}
      {editingUser && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px'
        }}>
            <div className="modern-card" style={{ width: '100%', maxWidth: '500px', margin: 0 }}>
                <h3 className="card-title">Cập nhật thông tin</h3>
                <form onSubmit={handleUpdateUser}>
                    <div className="form-group">
                        <label className="form-label">Mã số</label>
                        <input type="text" className="modern-input" disabled value={editingUser.userCode} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input type="text" className="modern-input" required 
                            value={editFormData.fullName}
                            onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="modern-input" required 
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input type="text" className="modern-input" required 
                            value={editFormData.phoneNumber}
                            onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                        />
                    </div>
                    <div className="btn-actions">
                        <button type="button" className="modern-btn btn-gray" onClick={() => setEditingUser(null)}>Hủy</button>
                        <button type="submit" className="modern-btn btn-blue">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserManager;