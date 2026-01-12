import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const TeacherClassManager = () => {
  const { course } = useOutletContext(); 
  const [classes, setClasses] = useState([]);
  const [viewMode, setViewMode] = useState('LIST'); 
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Modal Thêm học sinh
  const [showAddModal, setShowAddModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // UserCode của HS được chọn

  // api: Lấy danh sách lớp theo courseId
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher/classes?courseId=${course.id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi tải lớp:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) fetchClasses();
  }, [course]);

  // api: Xem chi tiết lớp 
  const handleViewClass = async (cls) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher/classes/${cls.id}/students`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(res.data);
      setSelectedClass(cls);
      setViewMode('DETAIL');
    } catch (error) {
      alert("Lỗi tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  // api lấy DS học sinh khả dụng để thêm
  const fetchAvailableStudents = async (searchKey = '') => {
    if (!selectedClass) return;
    try {
      const res = await axios.get(`/api/teacher/classes/${selectedClass.id}/available-students`, {
        params: { keyword: searchKey },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableStudents(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Khi mở modal, load lại ds học sinh khả dụng
  useEffect(() => {
    if (showAddModal) {
        setKeyword('');
        setSelectedIds([]);
        fetchAvailableStudents('');
    }
  }, [showAddModal]);


  // Xóa học sinh khỏi lớp
  const handleRemoveStudent = async (studentId) => {
      if(!window.confirm("Bạn có chắc muốn xóa học sinh này khỏi lớp?")) return;
      try {
          await axios.delete(`/api/teacher/classes/${selectedClass.id}/students/${studentId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert("Đã xóa học sinh thành công!");
          // Reload lại danh sách
          handleViewClass(selectedClass); 
      } catch (error) {
          alert("Lỗi: " + (error.response?.data?.message || "Không thể xóa"));
      }
  };

  // Thêm học sinh vào lớp
  const handleAddStudentsSubmit = async () => {
      if(selectedIds.length === 0) return alert("Vui lòng chọn ít nhất 1 học sinh!");
      
      try {
          await axios.post(`/api/teacher/classes/students`, {
              classId: selectedClass.id,
              userCodes: selectedIds
          }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert("Thêm thành công!");
          setShowAddModal(false);
          handleViewClass(selectedClass); // Reload lại danh sách lớp
      } catch (error) {
          alert("Lỗi thêm học sinh: " + (error.response?.data?.message || error.message));
      }
  };

  // ds lớp
  const renderClassList = () => (
    <div>
        <h3 style={{marginBottom: '20px'}}>Danh sách lớp học ({classes.length})</h3>
        
        {loading ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
            classes.length === 0 ? <p style={{textAlign:'center', color:'#666'}}>Chưa có lớp học nào được phân công.</p> :
            <div className="class-grid-teacher">
                {classes.map(cls => (
                    <div key={cls.id} className="modern-card hover-card" 
                         onClick={() => handleViewClass(cls)}
                         style={{cursor: 'pointer', padding: '20px', margin: 0}}
                    >
                        <h3 style={{margin: '0 0 10px 0', color: '#10b981', fontSize: '1.2rem'}}>
                            {cls.classCode}
                        </h3>
                        <div style={{fontSize: '0.9rem', color: '#666'}}>
                            <div>Khóa học: {course.name}</div>
                            {/* Nếu backend trả về sĩ số thì hiển thị, tạm thời ẩn */}
                            <div style={{marginTop: '10px', color: '#2563eb', fontWeight: 500}}>
                                Xem danh sách lớp
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  //chi tiết lớp
  const renderClassDetail = () => (
    <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <button className="modern-btn btn-gray" onClick={() => setViewMode('LIST')}>
                    Quay lại
                </button>
                <h3 style={{margin: 0}}>Lớp: <span style={{color: '#10b981'}}>{selectedClass.classCode}</span></h3>
            </div>
            <button className="modern-btn btn-blue" onClick={() => setShowAddModal(true)}>
                Thêm học sinh
            </button>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '600px' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                        <th style={{ padding: '15px', textAlign: 'center', width: '50px', color: '#4b5563' }}>STT</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Mã số</th>
                        <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>Họ và tên</th>
                        <th style={{ padding: '15px', textAlign: 'left', color: '#4b5563' }}>Email</th>
                        <th style={{ padding: '15px', textAlign: 'center', width: '100px', color: '#4b5563' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 ? (
                        <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#666'}}>Lớp chưa có học sinh nào.</td></tr>
                    ) : (
                        students.map((s, index) => (
                            <tr key={s.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{index + 1}</td>
                                <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>{s.userCode}</td>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{s.fullName}</td>
                                <td style={{ padding: '15px', color: '#666' }}>{s.email}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button 
                                        className="modern-btn" 
                                        style={{
                                            background: 'none', color: '#ef4444', border: 'none', 
                                            fontWeight: '600', cursor: 'pointer', padding: '5px'
                                        }}
                                        onClick={() => handleRemoveStudent(s.id)}
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
    </div>
  );

  return (
    <div>
      <style>{`
        .class-grid-teacher {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        @media (max-width: 1024px) {
            .class-grid-teacher { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
            .class-grid-teacher { grid-template-columns: 1fr; }
        }
        .hover-card { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-color: #10b981; }
        
        .user-item {
            display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #f0f0f0; cursor: pointer;
        }
        .user-item:hover { background: #f9f9f9; }
      `}</style>

      {viewMode === 'LIST' && renderClassList()}
      {viewMode === 'DETAIL' && renderClassDetail()}

      {/*thêm hs */}
      {showAddModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px'
        }}>
            <div className="modern-card" style={{ width: '100%', maxWidth: '600px', margin: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
                {/* Header */}
                <div style={{padding: '20px', borderBottom: '1px solid #eee'}}>
                    <h3 className="card-title" style={{margin: 0, border: 'none', padding: 0}}>Thêm học sinh vào lớp</h3>
                    <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                        <input 
                            type="text" className="modern-input" 
                            placeholder="Tìm theo tên hoặc mã sinh viên..." 
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                fetchAvailableStudents(e.target.value);
                            }}
                        />
                    </div>
                </div>

                {/*    Danh sách cuộn */}
                <div style={{flex: 1, overflowY: 'auto', padding: '10px 20px'}}>
                    {availableStudents.length === 0 ? (
                        <p style={{textAlign:'center', color:'#999', marginTop: '20px'}}>Không tìm thấy học sinh nào phù hợp.</p>
                    ) : (
                        availableStudents.map(u => (
                            <label key={u.userCode} className="user-item">
                                <input 
                                    type="checkbox" 
                                    style={{width: '18px', height: '18px', marginRight: '15px'}}
                                    checked={selectedIds.includes(u.userCode)}
                                    onChange={(e) => {
                                        if(e.target.checked) setSelectedIds([...selectedIds, u.userCode]);
                                        else setSelectedIds(selectedIds.filter(id => id !== u.userCode));
                                    }}
                                />
                                <div>
                                    <div style={{fontWeight: 600}}>{u.fullName}</div>
                                    <div style={{fontSize: '0.85rem', color: '#666'}}>{u.userCode} - {u.email}</div>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                <div className="btn-actions" style={{padding: '20px', borderTop: '1px solid #eee', margin: 0}}>
                    <button className="modern-btn btn-gray" onClick={() => setShowAddModal(false)}>Đóng</button>
                    <button className="modern-btn btn-blue" onClick={handleAddStudentsSubmit}>
                        Thêm ({selectedIds.length})
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassManager;