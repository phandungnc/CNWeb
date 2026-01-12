import React, { useEffect, useState } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeacherCourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin cơ bản của khóa học 
  useEffect(() => {
    // Tạm thời dùng API lấy list rồi find
    const fetchCourseInfo = async () => {
        try {
            const res = await axios.get('/api/teacher/courses', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const found = res.data.find(c => c.id === parseInt(courseId));
            if(found) setCourse(found);
            else {
                alert("Không tìm thấy khóa học hoặc bạn không có quyền truy cập");
                navigate('/teacher');
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchCourseInfo();
  }, [courseId, navigate]);

  if (!course) return <div>Đang tải thông tin khóa học...</div>;

  return (
    <div>
        {/* Header Khóa học */}
        <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#111', marginBottom: '5px' }}>
                {course.name}
            </h1>
        </div>

        {/* Thanh điều hướng */}
        <div className="course-nav-tabs">
            <NavLink to="exams" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Đề thi
            </NavLink>
            <NavLink to="classes" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Lớp học
            </NavLink>
            <NavLink to="questions" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Ngân hàng câu hỏi
            </NavLink>
            <NavLink to="statistics" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Thống kê bài làm
            </NavLink>
        </div>

        {/* CSS cho Tabs */}
        <style>{`
            .course-nav-tabs {
                display: flex;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 25px;
                gap: 30px;
            }
            .nav-tab {
                text-decoration: none;
                color: #6b7280;
                font-weight: 500;
                padding: 10px 5px;
                border-bottom: 3px solid transparent;
                transition: all 0.2s;
                font-size: 1rem;
            }
            .nav-tab:hover {
                color: #2563eb;
            }
            .nav-tab.active {
                color: #2563eb;
                border-bottom-color: #2563eb;
                font-weight: 600;
            }
        `}</style>

        <div className="course-content-body">
            <Outlet context={{ course }} /> 
        </div>
    </div>
  );
};

export default TeacherCourseDetail;