import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/DashboardForms.css'; 

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalClasses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi tải thống kê dashboard:", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Tổng số Giáo viên', value: stats.totalTeachers, color: '#2563eb' },
    { label: 'Tổng số Học sinh', value: stats.totalStudents, color: '#10b981' },
    { label: 'Khóa học', value: stats.totalCourses, color: '#f59e0b' },
    { label: 'Lớp học', value: stats.totalClasses, color: '#8b5cf6' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#111827' }}>Tổng quan hệ thống</h2>
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
      
      <div className="modern-card" style={{ margin: '0', maxWidth: '100%' }}>
        <h3 className="card-title" style={{ textAlign: 'left', borderBottom: 'none', paddingBottom: '0' }}>
          Xin chào Quản trị viên!
        </h3>
        <p style={{ color: '#6b7280' }}>
          Sử dụng bảng điều khiển để quản lý người dùng, tài khoản và các chức năng khác của hệ thống.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;