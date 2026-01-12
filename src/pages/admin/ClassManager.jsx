import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const ClassManager = () => {
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST', 'DETAIL'
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  // Modal Sửa Lớp
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, classCode: '' });
  // modal Thêm Thành Viên
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberRole, setAddMemberRole] = useState('STUDENT'); 
  const [searchUserKeyword, setSearchUserKeyword] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]); // Danh sách user có thể thêm
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]); // Danh sách mã user đã tích chọn
  //menu 3 chấm
  const [activeMenuId, setActiveMenuId] = useState(null);

  //api lấy danh sách lớp
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/all-classes?keyword=${keyword}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi tải lớp học:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetail = async (classId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/classes/${classId}/details`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedClass(res.data);
      setViewMode('DETAIL');
    } catch (error) {
      alert("Lỗi tải chi tiết lớp học");
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách user chưa vào lớp
  const fetchAvailableUsers = async (role = addMemberRole, key = searchUserKeyword) => {
    if (!selectedClass) return;
    try {
      const res = await axios.get(`/api/admin/classes/${selectedClass.info.id}/available-users`, {
        params: { role: role, keyword: key },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi tìm user:", error);
    }
  };

  // Tự động tải danh sách user khi mở modal hoặc đổi tab Role
  useEffect(() => {
    if (showAddMemberModal) {
        fetchAvailableUsers();
    }
  }, [showAddMemberModal, addMemberRole]); // Chạy lại khi Modal mở hoặc đổi Role

  useEffect(() => {
    if (viewMode === 'LIST') fetchClasses();
  }, [viewMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClasses();
  };

  const handleDeleteClass = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa lớp học này?")) return;
    try {
      await axios.delete(`/api/admin/classes/${id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Đã xóa lớp học!");
      fetchClasses();
    } catch (error) {
      alert("Xóa thất bại!");
    }
    setActiveMenuId(null);
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`/api/admin/classes/${editData.id}`, { classCode: editData.classCode }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert("Cập nhật thành công!");
        setShowEditModal(false);
        fetchClasses();
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || "Lỗi cập nhật"));
    }
  };

  const handleRemoveMember = async (userId) => {
    if(!window.confirm("Xóa thành viên này khỏi lớp?")) return;
    try {
        await axios.delete(`/api/admin/classes/${selectedClass.info.id}/members/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchClassDetail(selectedClass.info.id); // Reload lại chi tiết
    } catch (error) {
        alert("Lỗi xóa thành viên");
    }
  };

  const handleAddMembersSubmit = async () => {
    if (selectedUsersToAdd.length === 0) return alert("Bạn chưa tích chọn thành viên nào!");
    try {
        await axios.post('/api/admin/classes/members', {
            classId: selectedClass.info.id,
            userCodes: selectedUsersToAdd
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert(`Đã thêm ${selectedUsersToAdd.length} thành viên!`);
        setShowAddMemberModal(false);
        setSelectedUsersToAdd([]);
        fetchClassDetail(selectedClass.info.id);
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || "Thêm thất bại"));
    }
  };


  // view danh sách lớp học
  const renderList = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Quản lý lớp học</h2>
      </div>

      <div className="modern-card" style={{ maxWidth: '100%', margin: '0 0 20px 0', padding: '15px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" className="modern-input" placeholder="Tìm kiếm theo mã lớp..." 
            value={keyword} onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="modern-btn btn-blue" style={{whiteSpace: 'nowrap'}}>Tìm kiếm</button>
        </form>
      </div>

      {loading ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
        <div className="class-grid-main">
          {classes.map(c => (
             <div key={c.id} className="course-card" onClick={() => fetchClassDetail(c.id)}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '10px'}}>
                    <h3 style={{margin: 0, color: '#10b981', fontSize: '1.2rem'}}>{c.classCode}</h3>
                    
                    {/* Menu 3 chấm */}
                    <div style={{ position: 'relative' }}>
                        <button 
                            className="icon-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === c.id ? null : c.id);
                            }}
                        >
                            ⋮
                        </button>
                        {activeMenuId === c.id && (
                            <div className="card-menu">
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    setEditData({ id: c.id, classCode: c.classCode });
                                    setShowEditModal(true);
                                    setActiveMenuId(null);
                                }}>
                                    Sửa lớp học
                                </div>
                                <div onClick={(e) => handleDeleteClass(c.id, e)} style={{color: '#ef4444'}}>
                                    Xóa lớp học
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div style={{color: '#666', fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '10px'}}>
                     Khóa học: <br/> 
                    <b style={{color: '#333'}}>{c.course?.name}</b>
                </div>
             </div>
          ))}
        </div>
      )}
    </>
  );

  // view chi tiết 1 lớp học
  const renderDetail = () => {
    if(!selectedClass) return null;
    const { info, teachers, students } = selectedClass;

    return (
        <div>
            {/* Header */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <button onClick={() => setViewMode('LIST')} className="modern-btn btn-gray" style={{padding: '8px 15px'}}>⬅ Quay lại</button>
                    <div>
                        <h3 style={{margin: 0, color: '#059669', display: 'inline-block', marginRight: '10px'}}>Lớp: {info.classCode}</h3>
                        <span style={{color: '#666'}}>({info.course?.name})</span>
                    </div>
                </div>
                <button className="modern-btn btn-blue" onClick={() => {
                    setAvailableUsers([]); 
                    setSelectedUsersToAdd([]);
                    setShowAddMemberModal(true);
                }}>
                    Thêm thành viên
                </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                {/* GIÁO VIÊN */}
                <div className="modern-card" style={{margin: 0, maxWidth: '100%', padding: '20px'}}>
                    <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0}}>
                        Giáo viên ({teachers.length})
                    </h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {teachers.map(t => (
                            <li key={t.id} style={{padding: '10px 0', borderBottom: '1px solid #f9f9f9', display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                                <div>
                                    <div style={{fontWeight: 600}}>{t.fullName}</div>
                                    <div style={{fontSize: '0.85rem', color: '#666'}}>{t.userCode}</div>
                                    <div style={{fontSize: '0.85rem', color: '#666'}}>{t.email}</div>
                                </div>
                                <button onClick={() => handleRemoveMember(t.id)} className="modern-btn" style={{padding: '5px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#ef4444'}}>Xóa</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* HỌC SINH */}
                <div className="modern-card" style={{margin: 0, maxWidth: '100%', padding: '20px'}}>
                    <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0}}>
                        Học sinh ({students.length})
                    </h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {students.map(s => (
                            <li key={s.id} style={{padding: '10px 0', borderBottom: '1px solid #f9f9f9', display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                                <div>
                                    <div style={{fontWeight: 600}}>{s.fullName}</div>
                                    <div style={{fontSize: '0.85rem', color: '#666'}}>{s.userCode}</div>
                                    <div style={{fontSize: '0.85rem', color: '#666'}}>{s.email}</div>
                                </div>
                                <button onClick={() => handleRemoveMember(s.id)} className="modern-btn" style={{padding: '5px 10px', fontSize: '0.8rem', background: '#fee2e2', color: '#ef4444'}}>Xóa</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div>
      <style>{`
        /* Lưới lớp học: Desktop 4 cột, Mobile 2 cột */
        .class-grid-main {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        @media (max-width: 768px) {
            .class-grid-main { grid-template-columns: repeat(2, 1fr); }
            .modern-card { padding: 15px; }
            .user-select-item { flex-direction: column; align-items: flex-start; }
        }

        .course-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }
        .course-card:hover {
            border-color: #10b981;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .icon-btn {
            background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0 5px;
            line-height: 1; color: #555;
        }
        .icon-btn:hover { color: #000; }

        .card-menu {
            position: absolute; top: 100%; right: 0;
            background: white; border: 1px solid #eee;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 6px; z-index: 10; width: 140px;
        }
        .card-menu div {
            padding: 10px 15px; font-size: 0.9rem; cursor: pointer;
        }
        .card-menu div:hover { background: #f5f5f5; }

        .user-select-item {
            padding: 10px; border-bottom: 1px solid #f0f0f0; display: flex; gap: 10px; alignItems: center; cursor: pointer;
        }
        .user-select-item:hover { background: #f9faff; }
        .user-select-item input { transform: scale(1.2); cursor: pointer; }
      `}</style>

      {viewMode === 'LIST' && renderList()}
      {viewMode === 'DETAIL' && renderDetail()}

      {/* sửa code lớp */}
      {showEditModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div className="modern-card" style={{width: '400px', margin: 0}}>
                <h3 className="card-title">Sửa mã lớp</h3>
                <form onSubmit={handleEditClass}>
                    <div className="form-group">
                        <label className="form-label">Mã lớp mới</label>
                        <input type="text" className="modern-input" required 
                               value={editData.classCode} onChange={e => setEditData({...editData, classCode: e.target.value})} />
                    </div>
                    <div className="btn-actions">
                        <button type="button" className="modern-btn btn-gray" onClick={() => setShowEditModal(false)}>Hủy</button>
                        <button type="submit" className="modern-btn btn-blue">Lưu lại</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* modal thêm tv*/}
      {showAddMemberModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1150, display: 'flex', justifyContent: 'center', alignItems: 'center', padding:'10px'}}>
            <div className="modern-card" style={{width: '100%', maxWidth: '600px', margin: 0, maxHeight:'90vh', display:'flex', flexDirection:'column', padding: '0'}}>
                
                {/* Header Modal */}
                <div style={{padding: '20px', borderBottom: '1px solid #eee'}}>
                    <h3 className="card-title" style={{marginBottom:'15px', border:'none', padding:0}}>Thêm thành viên vào lớp</h3>
                    
                    {/* lọc theo role */}
                    <div style={{display:'flex', gap:'10px'}}>
                        <select className="modern-input" style={{width:'130px'}} value={addMemberRole} onChange={e => setAddMemberRole(e.target.value)}>
                            <option value="STUDENT">Học sinh</option>
                            <option value="TEACHER">Giáo viên</option>
                        </select>
                        <input 
                            type="text" className="modern-input" 
                            placeholder="Lọc theo tên hoặc mã..." 
                            value={searchUserKeyword} 
                            onChange={e => {
                                setSearchUserKeyword(e.target.value);
                                fetchAvailableUsers(addMemberRole, e.target.value); // Tìm kiếm live luôn
                            }} 
                        />
                    </div>
                </div>

                <div style={{flex: 1, overflowY: 'auto', padding: '10px 20px', background: '#fff'}}>
                    {availableUsers.length === 0 ? (
                        <p style={{textAlign:'center', color:'#999', marginTop: '20px'}}>
                            Không tìm thấy {addMemberRole === 'STUDENT' ? 'học sinh' : 'giáo viên'} nào khả dụng.
                        </p>
                    ) : (
                        <div>
                            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '10px'}}>
                                Tìm thấy <b>{availableUsers.length}</b> kết quả. Hãy tích chọn người cần thêm:
                            </p>
                            {availableUsers.map(u => (
                                <label key={u.userCode} className="user-select-item">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedUsersToAdd.includes(u.userCode)}
                                        onChange={e => {
                                            if(e.target.checked) setSelectedUsersToAdd([...selectedUsersToAdd, u.userCode]);
                                            else setSelectedUsersToAdd(selectedUsersToAdd.filter(code => code !== u.userCode));
                                        }}
                                    />
                                    <div style={{marginLeft: '5px'}}>
                                        <div style={{fontWeight:600}}>{u.fullName}</div>
                                        <div style={{fontSize:'0.85rem', color:'#666'}}>{u.userCode} - {u.email}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>



                <div className="btn-actions" style={{padding: '20px', margin: 0, background: '#f9f9f9', borderRadius: '0 0 12px 12px'}}>
                    <button type="button" className="modern-btn btn-gray" onClick={() => setShowAddMemberModal(false)}>Đóng</button>
                    <button 
                        type="button" 
                        className={`modern-btn btn-blue ${selectedUsersToAdd.length === 0 ? 'btn-disabled' : ''}`}
                        onClick={handleAddMembersSubmit}
                        disabled={selectedUsersToAdd.length === 0}
                    >
                        Thêm ({selectedUsersToAdd.length})
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ClassManager;