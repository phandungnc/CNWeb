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

  //api lấy ds đề thi
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

  //api lấy kết quả thi
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

  //api tính điểm trung bình
  const getAverageScore = () => {
      if (results.length === 0) return 0;
      const total = results.reduce((acc, curr) => acc + curr.score, 0);
      return (total / results.length).toFixed(2);
  };

  const getPassCount = () => {
      return results.filter(r => r.score >= 5.0).length;
  };

  // Lọc danh sách theo từ khóa
  const filteredResults = results.filter(r => 
      r.studentName?.toLowerCase().includes(keyword.toLowerCase()) || 
      r.studentCode?.toLowerCase().includes(keyword.toLowerCase()) ||
      r.classCode?.toLowerCase().includes(keyword.toLowerCase())
  );

  // ds đề thi
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
                          <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#666'}}>Chưa có đề thi nào</td></tr>
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

  // bảng điểm chi tiết
  const renderDetail = () => (
      <div>
          <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
              <button className="modern-btn btn-gray" onClick={() => setViewMode('LIST')}>Quay lại</button>
              <div>
                  <h2 style={{margin:0, color: '#111'}}>{selectedExam?.title}</h2>
                  <span style={{color:'#666', fontSize:'0.9rem'}}>Thống kê kết quả làm bài</span>
              </div>
          </div>

          <div className="stats-cards-grid">
              <div className="stat-card" style={{borderTop: '4px solid #3b82f6'}}>
                  <span className="stat-value" style={{color: '#3b82f6'}}>{results.length}</span>
                  <span className="stat-label">Bài đã nộp</span>
              </div>
              <div className="stat-card" style={{borderTop: '4px solid #10b981'}}>
                  <span className="stat-value" style={{color: '#10b981'}}>{getAverageScore()}</span>
                  <span className="stat-label">Điểm trung bình</span>
              </div>
              <div className="stat-card" style={{borderTop: '4px solid #f59e0b'}}>
                  <span className="stat-value" style={{color: '#f59e0b'}}>
                      {results.length > 0 ? Math.max(...results.map(r => r.score)) : 0}
                  </span>
                  <span className="stat-label">Điểm cao nhất</span>
              </div>
              <div className="stat-card" style={{borderTop: '4px solid #ef4444'}}>
                  <span className="stat-value" style={{color: '#ef4444'}}>
                      {results.length > 0 ? ((getPassCount() / results.length) * 100).toFixed(0) : 0}%
                  </span>
                  <span className="stat-label">Tỷ lệ qua môn (≥5)</span>
              </div>
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

          {/* Bảng điểm */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '900px' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <tr>
                          <th style={{ padding: '15px', textAlign: 'center', width: '50px' }}>STT</th>
                          <th style={{ padding: '15px', textAlign: 'left' }}>Mã SV</th>
                          <th style={{ padding: '15px', textAlign: 'left' }}>Họ và tên</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Lớp</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Số câu đúng</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Điểm số</th>
                          <th style={{ padding: '15px', textAlign: 'left' }}>Thời gian nộp</th>
                          <th style={{ padding: '15px', textAlign: 'center' }}>Vi phạm</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredResults.length === 0 ? (
                          <tr><td colSpan="8" style={{padding:'30px', textAlign:'center', color:'#666'}}>Không tìm thấy kết quả nào.</td></tr>
                      ) : (
                          filteredResults.map((r, index) => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{index + 1}</td>
                                  <td style={{ padding: '15px', fontWeight: '600' }}>{r.studentCode}</td>
                                  <td style={{ padding: '15px' }}>{r.studentName}</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <span style={{background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600}}>
                                          {r.classCode}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      {r.correctCount} / {r.totalQuestions}
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <span style={{
                                          fontWeight: 'bold', fontSize: '1rem',
                                          color: r.score >= 5 ? '#10b981' : '#ef4444'
                                      }}>
                                          {r.score}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px', fontSize: '0.9rem', color: '#555' }}>
                                      {r.submitTime}
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      {r.invalidAction > 0 ? (
                                          <span style={{color: '#ef4444', fontWeight: '600'}}>⚠️ {r.invalidAction} lần</span>
                                      ) : (
                                          <span style={{color: '#d1d5db'}}>-</span>
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
        <style>{`
            .stats-cards-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                margin-bottom: 25px;
            }
            @media (max-width: 768px) {
                .stats-cards-grid { grid-template-columns: 1fr 1fr; }
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                border: 1px solid #f0f0f0;
            }
            .stat-value { font-size: 1.8rem; fontWeight: 700; margin-bottom: 5px; }
            .stat-label { font-size: 0.9rem; color: #6b7280; }
        `}</style>

        {loading ? <div style={{textAlign:'center', padding:'50px'}}>Đang tải dữ liệu...</div> : (
            viewMode === 'LIST' ? renderExamList() : renderDetail()
        )}
    </div>
  );
};

export default TeacherStatistics;