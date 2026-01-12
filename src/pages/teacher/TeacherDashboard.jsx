import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/teacher/courses', {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const rawData = Array.isArray(res.data) ? res.data : [];
        // Sắp xếp dữ liệu ngay sau khi fetch
        setCourses(sortCourses(rawData));
      } catch (error) {
        console.error("Lỗi tải khóa học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Hàm tính trạng thái 
  const getStatusPriority = (startStr, endStr) => {
      const now = new Date();
      const start = startStr ? new Date(startStr) : null;
      const end = endStr ? new Date(endStr) : null;

      if (start && now < start) return 2; // Sắp diễn ra
      if (end && now > end) return 3;     // Đã kết thúc
      return 1;                           // Đang diễn ra 
  };

  // Hàm sắp xếp
  const sortCourses = (list) => {
      return list.sort((a, b) => {
          const priorityA = getStatusPriority(a.startTime, a.endTime);
          const priorityB = getStatusPriority(b.startTime, b.endTime);
          return priorityA - priorityB; // Tăng dần: 1 -> 2 -> 3
      });
  };

  // Hàm lấy label màu trạng thái
  const getStatusLabel = (startStr, endStr) => {
      const p = getStatusPriority(startStr, endStr);
      if (p === 2) return { label: 'Sắp diễn ra', color: '#f59e0b', bg: '#fef3c7' };
      if (p === 3) return { label: 'Đã kết thúc', color: '#6b7280', bg: '#f3f4f6' };
      return { label: 'Đang diễn ra', color: '#10b981', bg: '#d1fae5' };
  };

  // Lọc tìm kiếm
  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(keyword.toLowerCase()) || 
    (c.note && c.note.toLowerCase().includes(keyword.toLowerCase()))
  );

  const displayDate = (dateStr) => {
    if(!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#1a1a1a' }}>Khóa học của tôi</h2>

      {/* Thanh tìm kiếm */}
      <div className="modern-card" style={{ padding: '15px', marginBottom: '20px', maxWidth: '100%', margin: '0 0 20px 0' }}>
        <input 
            type="text" 
            className="modern-input" 
            placeholder="Tìm kiếm khóa học..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* Danh sách khóa học */}
      {loading ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredCourses.length === 0 ? (
            <p style={{textAlign:'center', color:'#666'}}>Không tìm thấy khóa học nào.</p>
          ) : (
            filteredCourses.map(course => {
              const status = getStatusLabel(course.startTime, course.endTime);
              
              return (
                <div 
                  key={course.id} 
                  className="course-card-teacher"
                  onClick={() => navigate(`/teacher/courses/${course.id}`)}
                >
                  <div className="course-img-wrapper">
                      <img src="/default.jpg" alt="Course" />
                  </div>

                  {/* Nội dung */}
                  <div className="course-content">
                      <div>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'5px'}}>
                              <h3 className="course-title">{course.name}</h3>
                              <span className="status-badge" style={{
                                  color: status.color, backgroundColor: status.bg,
                              }}>
                                  {status.label}
                              </span>
                          </div>
                          
                          <div className="course-note">
                              {course.note || 'Không có mô tả'}
                          </div>
                      </div>

                      <div>
                          <div className="course-dates">
                              <div style={{marginRight: '20px'}}>
                                  <span style={{color: '#666', marginRight: '5px'}}>Bắt đầu:</span>
                                  <span style={{fontWeight: 500}}>{displayDate(course.startTime)}</span>
                              </div>
                              <div>
                                  <span style={{color: '#666', marginRight: '5px'}}>Kết thúc:</span>
                                  <span style={{fontWeight: 500}}>{displayDate(course.endTime)}</span>
                              </div>
                          </div>

                          <button className="modern-btn btn-blue" style={{marginTop: '15px', width: '100%'}}>
                              Vào lớp học
                          </button>
                      </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CSS Responsive */}
      <style>{`
        .course-card-teacher {
            display: flex;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s;
            height: 200px;
        }
        .course-card-teacher:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            border-color: #2563eb;
        }
        .course-img-wrapper {
            width: 280px;
            flex-shrink: 0;
            background: #f3f4f6;
        }
        .course-img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .course-content {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .course-title {
            margin: 0;
            color: #111;
            font-size: 1.25rem;
            font-weight: 700;
            line-height: 1.4;
            flex: 1; /* Để tên chiếm chỗ, đẩy badge sang phải */
        }
        .status-badge {
            font-size: 0.8rem; 
            font-weight: 600;
            padding: 4px 10px; 
            border-radius: 15px;
            white-space: nowrap;
            margin-left: 10px;
        }
        .course-note {
            color: #6b7280;
            font-size: 0.95rem;
            margin-top: 5px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .course-dates {
            font-size: 0.9rem;
            color: #374151;
            background: #f9fafb;
            padding: 8px 12px;
            border-radius: 6px;
            display: flex;
            flex-wrap: wrap;
        }

        /* RESPONSIVE MOBILE */
        @media (max-width: 768px) {
            .course-card-teacher {
                height: auto;
                flex-direction: column;
            }
            /* Ẩn ảnh trên mobile */
            .course-img-wrapper {
                display: none; 
            }
            .course-content {
                padding: 15px;
            }
            .course-title {
                font-size: 1.1rem;
            }
            .course-dates {
                flex-direction: column;
                gap: 5px;
            }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;