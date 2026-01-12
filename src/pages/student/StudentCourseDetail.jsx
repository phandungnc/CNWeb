import React, { useEffect, useState } from 'react';
import { useParams, NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin khóa học để hiển thị tên
    const fetchCourseInfo = async () => {
        try {
            const res = await axios.get('/api/student/courses', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const found = res.data.find(c => c.id === parseInt(courseId));
            if(found) setCourse(found);
            else navigate('/student');
        } catch (error) {
            console.error(error);
        }
    };
    fetchCourseInfo();
  }, [courseId, navigate]);

  if (!course) return <div>Đang tải...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', color: '#111', marginBottom: '5px' }}>{course.name}</h1>
        </div>

        <div className="course-nav-tabs">
            <NavLink to="exams" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Đề thi
            </NavLink>
            <NavLink to="class-info" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Lớp học
            </NavLink>
        </div>

        <div className="course-content-body">
            <Outlet context={{ course }} />
        </div>

        <style>{`
            .course-nav-tabs { display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 25px; gap: 30px; }
            .nav-tab { text-decoration: none; color: #6b7280; font-weight: 500; padding: 10px 5px; border-bottom: 3px solid transparent; }
            .nav-tab:hover { color: #2563eb; }
            .nav-tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
        `}</style>
    </div>
  );
};

export default StudentCourseDetail;