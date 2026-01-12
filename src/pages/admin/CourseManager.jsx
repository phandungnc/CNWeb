import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const CourseManager = () => {
  const [viewMode, setViewMode] = useState('COURSE_LIST'); 
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  //thêm sửa khóa học
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', note: '', startTime: '', endTime: '' });
  // tạo lớp học mới
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassCode, setNewClassCode] = useState('');
  //menu 3 chấm
  const [activeMenuId, setActiveMenuId] = useState(null);
  // api lấy danh sách khóa học
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/courses?keyword=${keyword}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetail = async (courseId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedCourse(res.data);
      setViewMode('COURSE_DETAIL');
    } catch (error) {
      alert("Lỗi tải chi tiết khóa học");
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
      setViewMode('CLASS_DETAIL');
    } catch (error) {
      alert("Lỗi tải chi tiết lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'COURSE_LIST') fetchCourses();
  }, [viewMode]);

  // xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const formatTimeForInput = (timeStr) => timeStr ? timeStr.replace(' ', 'T').substring(0, 16) : '';
  const formatTimeForSubmit = (timeStr) => timeStr ? timeStr.replace('T', ' ') + ':00' : null;

  // xử lý khóa học
  const handleAddNew = () => {
    setFormData({ id: null, name: '', note: '', startTime: '', endTime: '' });
    setIsEditMode(false);
    setShowModal(true);
    setActiveMenuId(null);
  };

  const handleEdit = (course, e) => {
    e.stopPropagation();
    setFormData({
      id: course.id,
      name: course.name,
      note: course.note || '',
      startTime: formatTimeForInput(course.startTime),
      endTime: formatTimeForInput(course.endTime)
    });
    setIsEditMode(true);
    setShowModal(true);
    setActiveMenuId(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Xóa khóa học này sẽ xóa toàn bộ lớp học bên trong. Tiếp tục?")) return;
    try {
      await axios.delete(`/api/admin/courses/${id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Đã xóa thành công!");
      fetchCourses();
    } catch (error) {
      alert("Xóa thất bại!");
    }
    setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      note: formData.note,
      startTime: formatTimeForSubmit(formData.startTime),
      endTime: formatTimeForSubmit(formData.endTime)
    };
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      if (isEditMode) {
        await axios.put(`/api/admin/courses/${formData.id}`, payload, config);
        alert('Cập nhật thành công');
      } else {
        await axios.post('/api/admin/courses', payload, config);
        alert('Thêm mới thành công');
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  // tạo lớp học mới
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassCode.trim()) return alert("Vui lòng nhập mã lớp!");

    try {
        const payload = {
            classCode: newClassCode,
            courseId: selectedCourse.info.id // Lấy ID từ khóa học đang xem
        };
        
        await axios.post('/api/admin/classes', payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        alert("Thêm lớp học thành công!");
        setShowClassModal(false);
        setNewClassCode('');
        // Tải lại chi tiết khóa học để cập nhật danh sách lớp
        fetchCourseDetail(selectedCourse.info.id);

    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || "Không thể tạo lớp học"));
    }
  };

  const displayDate = (dateStr) => {
      if(!dateStr) return '';
      const d = new Date(dateStr.replace(' ', 'T'));
      return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  };



  // ds các khóa học
  const renderCourseList = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Quản lý khóa học</h2>
        <button className="modern-btn btn-blue" onClick={handleAddNew}>Thêm mới</button>
      </div>

      <div className="modern-card" style={{ maxWidth: '100%', margin: '0 0 20px 0', padding: '15px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" className="modern-input" placeholder="Tìm kiếm khóa học..." 
            value={keyword} onChange={(e) => setKeyword(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="modern-btn btn-blue" style={{whiteSpace: 'nowrap'}}>Tìm kiếm</button>
        </form>
      </div>

      {loading ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
        <div className="course-grid">
          {courses.map(c => (
            <div key={c.id} className="course-card" onClick={() => fetchCourseDetail(c.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#2563eb', fontSize: '1.1rem' }}>{c.name}</h3>
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
                            <div onClick={(e) => handleEdit(c, e)}>Sửa khóa học</div>
                            <div onClick={(e) => handleDelete(c.id, e)} style={{color: '#ef4444'}}>Xóa khóa học</div>
                        </div>
                    )}
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '10px', minHeight: '40px' }}>
                {c.note || 'Không có ghi chú'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <div>Bắt đầu: {displayDate(c.startTime)}</div>
                <div>Kết thúc: {displayDate(c.endTime)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // chi tiết trong 1 khóa học là ds các lớp
  const renderCourseDetail = () => {
    if(!selectedCourse) return null;
    const { info, classes } = selectedCourse;

    return (
        <div>
            {/*  */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <button onClick={() => setViewMode('COURSE_LIST')} className="modern-btn btn-gray" style={{padding: '8px 15px'}}>
                        ⬅ Quay lại
                    </button>
                    <div>
                        <h3 style={{margin: 0, color: '#1a1a1a', display: 'inline-block', marginRight: '10px'}}>{info.name}</h3>
                        <span style={{color: '#666', fontSize: '0.95rem'}}>- {info.note}</span>
                    </div>
                </div>
                {/* thêm lớp học */}
                <button 
                    className="modern-btn btn-blue" 
                    onClick={() => {
                        setNewClassCode(''); 
                        setShowClassModal(true);
                    }}
                >
                     Thêm lớp học
                </button>
            </div>

            <h4 style={{marginBottom: '15px'}}>Danh sách lớp học ({classes.length})</h4>
            
            {classes.length === 0 ? <p>Chưa có lớp học nào.</p> : (
                <div className="class-grid">
                    {classes.map(cls => (
                        <div key={cls.id} className="course-card" onClick={() => fetchClassDetail(cls.id)} style={{borderLeft: '4px solid #10b981', padding: '15px'}}>
                            <h3 style={{margin: '0 0 5px 0', color: '#10b981', fontSize: '1rem'}}>{cls.classCode}</h3>
                            <span style={{fontSize: '0.85rem', color: '#888'}}>Xem chi tiết</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };

  // chi tiết trong 1 lớp học
  const renderClassDetail = () => {
    if(!selectedClass) return null;
    const { info, teachers, students } = selectedClass;

    return (
        <div>
             <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <button onClick={() => setViewMode('COURSE_DETAIL')} className="modern-btn btn-gray" style={{padding: '8px 15px'}}>
                    ⬅ Quay lại
                </button>
                <div>
                    <h3 style={{margin: 0, color: '#059669', display: 'inline-block', marginRight: '10px'}}>Lớp: {info.classCode}</h3>
                    <span style={{color: '#666'}}>({selectedCourse.info.name})</span>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                {/* Giáo viên */}
                <div className="modern-card" style={{margin: 0, maxWidth: '100%', padding: '20px'}}>
                    <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0}}>Giáo viên ({teachers.length})</h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {teachers.map(t => (
                            <li key={t.id} style={{padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: '0.95rem'}}>
                                <div style={{fontWeight: '600'}}>{t.fullName}</div>
                                <div style={{color: '#555'}}>{t.userCode}</div>
                                <div style={{color: '#555'}}>{t.email}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Học sinh */}
                <div className="modern-card" style={{margin: 0, maxWidth: '100%', padding: '20px'}}>
                    <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0}}>Học sinh ({students.length})</h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {students.map(s => (
                            <li key={s.id} style={{padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: '0.95rem'}}>
                                <div style={{fontWeight: '600'}}>{s.fullName}</div>
                                <div style={{color: '#555'}}>{s.userCode}</div>
                                <div style={{color: '#555'}}>{s.email}</div>
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
      {/* CSS Styles */}
      <style>{`
        /* Lưới Khóa học: Máy tính 3 cột, Mobile 1 cột */
        .course-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }
        
        /* Lưới Lớp học: Máy tính 4 cột, Mobile 2 cột */
        .class-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }

        /* Responsive Mobile */
        @media (max-width: 768px) {
            .course-grid { grid-template-columns: 1fr; }
            .class-grid { grid-template-columns: repeat(2, 1fr); }
            .modern-card { padding: 15px; }
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
            border-color: #2563eb;
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
      `}</style>

      {viewMode === 'COURSE_LIST' && renderCourseList()}
      {viewMode === 'COURSE_DETAIL' && renderCourseDetail()}
      {viewMode === 'CLASS_DETAIL' && renderClassDetail()}

      {/*modal cho thêm sửa khóa học */}
      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px'
        }}>
            <div className="modern-card" style={{ width: '100%', maxWidth: '500px', margin: 0, maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 className="card-title">{isEditMode ? 'Cập nhật khóa học' : 'Thêm khóa học mới'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên khóa học</label>
                        <input type="text" className="modern-input" required 
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Ghi chú</label>
                        <textarea className="modern-input" rows="3"
                               value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Bắt đầu</label>
                        <input type="datetime-local" className="modern-input" required
                            value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Kết thúc</label>
                        <input type="datetime-local" className="modern-input" required
                            value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                    </div>
                    
                    <div className="btn-actions">
                        <button type="button" className="modern-btn btn-gray" onClick={() => setShowModal(false)}>Hủy</button>
                        <button type="submit" className="modern-btn btn-blue">Lưu lại</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* modal cho thêm lớp học mới */}
      {showClassModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1150,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px'
        }}>
            <div className="modern-card" style={{ width: '100%', maxWidth: '400px', margin: 0 }}>
                <h3 className="card-title">Tạo lớp học mới</h3>
                <form onSubmit={handleCreateClass}>
                    <div className="form-group">
                        <label className="form-label">Mã lớp học</label>
                        <input 
                            type="text" 
                            className="modern-input" 
                            required 
                            placeholder="VD: 123456"
                            value={newClassCode} 
                            onChange={e => setNewClassCode(e.target.value)} 
                        />
                        <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
                            Lớp sẽ được tạo trong khóa: <b>{selectedCourse?.info?.name}</b>
                        </small>
                    </div>
                    
                    <div className="btn-actions">
                        <button type="button" className="modern-btn btn-gray" onClick={() => setShowClassModal(false)}>Hủy</button>
                        <button type="submit" className="modern-btn btn-blue">Tạo lớp</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;