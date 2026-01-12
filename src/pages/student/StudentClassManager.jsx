import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const StudentClassManager = () => {
  const { course } = useOutletContext();
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/student/classes/details?courseId=${course.id}`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setClassInfo(res.data);
      } catch (error) {
        setClassInfo(null);
      } finally {
        setLoading(false);
      }
    };
    if (course?.id) fetchClassDetail();
  }, [course]);

  if (loading) return <div style={{textAlign:'center', padding:'20px'}}>Đang tải thông tin lớp...</div>;
  if (!classInfo) return <div style={{textAlign:'center', padding:'20px', color:'#666'}}>Bạn chưa được xếp vào lớp nào trong khóa học này.</div>;

  // ds gv và hs
  const allMembers = [
      ...classInfo.teachers.map(t => ({ ...t, role: 'Giáo viên', roleColor: '#2563eb', bgColor: '#eff6ff' })),
      ...classInfo.students.map(s => ({ ...s, role: 'Học sinh', roleColor: '#4b5563', bgColor: '#f3f4f6' }))
  ];

  return (
    <div>
        <h2 style={{textAlign: 'center', color: '#1a1a1a', marginBottom: '25px'}}>
            Lớp: <span style={{color: '#000000'}}>{classInfo.classCode}</span>
        </h2>

        {/* bảng danh sách thành viên */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '700px' }}>
                <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                        <th style={{ padding: '15px', textAlign: 'center', width: '60px', color: '#4b5563' }}>STT</th>
                        <th style={{ padding: '15px', textAlign: 'center', width: '150px', color: '#4b5563' }}>Mã số</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Họ và tên</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Email</th>
                        <th style={{ padding: '15px', textAlign: 'center', width: '120px', color: '#4b5563' }}>Vai trò</th>
                    </tr>
                </thead>
                <tbody>
                    {allMembers.map((mem, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{index + 1}</td>
                            <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>{mem.userCode || '---'}</td>
                            <td style={{ padding: '15px', textAlign: 'center', fontWeight: '500' }}>{mem.fullName}</td>
                            <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{mem.email}</td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                <span style={{
                                    backgroundColor: mem.bgColor, color: mem.roleColor,
                                    padding: '4px 10px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: '600'
                                }}>
                                    {mem.role}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default StudentClassManager;