import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const TeacherStatistics = () => {
  const { course } = useOutletContext();
  const [exams, setExams] = useState([]);
  const [viewMode, setViewMode] = useState('LIST'); 
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (course?.id && viewMode === 'LIST') {
      const fetchExams = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/api/teacher/exams?courseId=${course.id}`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setExams(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Lỗi tải đề thi:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchExams();
    }
  }, [course, viewMode]);

  const fetchExamResults = async (exam) => {
      setLoading(true);
      try {
          const res = await axios.get(`/api/teacher/exams/${exam.id}/results`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setResults(res.data);
          setSelectedExam(exam);
          setViewMode('DETAIL');
      } catch (error) {
          alert("Lỗi tải bảng điểm: " + (error.response?.data?.message || error.message));
      } finally {
          setLoading(false);
      }
  };

  const handleExportExcel = async () => {
      if (!selectedExam) return;
      try {
          const response = await axios.get(`/api/teacher/exams/${selectedExam.id}/export`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              responseType: 'blob',
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `KQ ${selectedExam.title}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          alert("Lỗi xuất file: " + error.message);
      }
  };

  const filteredResults = results.filter(r => 
      (r.fullName && r.fullName.toLowerCase().includes(keyword.toLowerCase())) || 
      (r.studentCode && r.studentCode.toLowerCase().includes(keyword.toLowerCase())) ||
      (r.classCode && r.classCode.toLowerCase().includes(keyword.toLowerCase()))
  );

  const renderExamList = () => (
      <div>
          <h3 style={{marginBottom: '20px'}}>Chọn đề thi để xem thống kê</h3>
          
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '600px' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <tr>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Tên đề thi</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Thời lượng</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Lượt thi</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Thời gian mở</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Thời gian đóng</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '150px', color: '#4b5563' }}>Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {exams.length === 0 ? (
                          <tr><td colSpan="6" style={{padding:'20px', textAlign:'center', color:'#666'}}>Chưa có đề thi nào</td></tr>
                      ) : (
                          exams.map(e => (
                              <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => fetchExamResults(e)}>
                                  <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2563eb' }}>{e.title}</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>{e.durationMinutes} phút</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>{e.maxAttempts}</td>
                                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', color:'#555' }}>
                                      {new Date(e.startTime).toLocaleString('vi-VN')}
                                  </td>
                                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', color:'#555' }}>
                                        {new Date(e.endTime).toLocaleString('vi-VN')}
                                    </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <button className="modern-btn btn-blue" style={{padding: '5px 15px', fontSize:'0.85rem'}}>
                                          Xem điểm
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

  const renderDetail = () => (
      <div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                  <button className="modern-btn btn-gray" onClick={() => setViewMode('LIST')}>Quay lại</button>
                  <div>
                      <h2 style={{margin:0, color: '#111'}}>{selectedExam?.title}</h2>
                      <span style={{color:'#666', fontSize:'0.9rem'}}>Thống kê kết quả làm bài</span>
                  </div>
              </div>

              <button 
                className="modern-btn" 
                style={{backgroundColor: '#10b981', color: 'white', border: 'none'}}
                onClick={handleExportExcel}
              >
                  Xuất Excel
              </button>
          </div>

          <div className="modern-card" style={{ padding: '15px', margin: '0 0 20px 0', maxWidth: '100%' }}>
              <input 
                  type="text" 
                  className="modern-input" 
                  placeholder="Tìm kiếm theo tên, mã sinh viên hoặc lớp..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
              />
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '900px' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <tr>
                          <th style={{ padding: '15px', textAlign: 'center', width: '50px' }}>STT</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Mã SV</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Họ và tên</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Lớp</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Số câu đúng</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Thời gian làm</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Thời gian nộp</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Điểm số</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Vi phạm</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredResults.length === 0 ? (
                          <tr><td colSpan="9" style={{padding:'30px', textAlign:'center', color:'#666'}}>Không tìm thấy kết quả nào.</td></tr>
                      ) : (
                          filteredResults.map((r, index) => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{index + 1}</td>
                                  <td style={{ padding: '15px', textAlign: 'center'}}>{r.studentCode}</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>{r.fullName || r.studentName}</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>{r.classCode}</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      {r.correctCount} / {r.totalQuestions}
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
                                      {r.startTime}
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', color: '#555' }}>
                                      {r.submitTime}
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <span style={{
                                          fontWeight: 'bold', fontSize: '1rem',
                                          color: '#000000'
                                      }}>
                                          {r.score}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      {r.invalidAction > 0 ? (
                                          <span style={{color: '#ef4444', fontWeight: '600'}}> {r.invalidAction}</span>
                                      ) : (
                                          <span style={{color: '#02fe39'}}>0</span>
                                      )}
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
        {loading ? <div style={{textAlign:'center', padding:'50px'}}>Đang tải dữ liệu...</div> : (
            viewMode === 'LIST' ? renderExamList() : renderDetail()
        )}
    </div>
  );
};

export default TeacherStatistics;