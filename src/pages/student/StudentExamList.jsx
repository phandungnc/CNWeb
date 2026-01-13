import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const StudentExamList = () => {
  const { course } = useOutletContext();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null); 
  const navigate = useNavigate();

 // thống kê bài làm
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedExamTitle, setSelectedExamTitle] = useState('');

  // sắp xếp đề thi theo trạng thái
  const getExamStatus = (exam) => {
      const now = new Date();
      const start = new Date(exam.startTime);
      const end = new Date(exam.endTime);

      if (now < start) return { text: 'Chưa mở', color: '#f59e0b', priority: 2, canJoin: false };
      if (now > end) return { text: 'Đã kết thúc', color: '#6b7280', priority: 3, canJoin: false };
      return { text: 'Đang diễn ra', color: '#10b981', priority: 1, canJoin: true };
  };

  const sortExams = (list) => {
      return list.sort((a, b) => {
          const statusA = getExamStatus(a);
          const statusB = getExamStatus(b);
          return statusA.priority - statusB.priority;
      });
  };

  // api lấy danh sách đề thi
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/student/exams?courseId=${course.id}`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const rawList = Array.isArray(res.data) ? res.data : [];
        setExams(sortExams(rawList));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (course?.id) fetchExams();
  }, [course]);

  // Xử lý xổ/thu đề thi
  const handleToggle = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  const handleStartExam = (examId) => {
      if(window.confirm("Bạn có chắc chắn muốn bắt đầu làm bài không?")) {
          navigate(`/student/exam/${examId}`);
      }
  };

  const handleViewHistory = async (exam) => {
      try {
          const res = await axios.get(`/api/student/exams/${exam.id}/history`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setHistoryData(res.data);
          setSelectedExamTitle(exam.title);
          setShowHistoryModal(true);
      } catch (error) {
          alert("Lỗi tải lịch sử: " + error.message);
      }
  };

  return (
    <div>
        <h3 style={{marginBottom: '20px'}}>Danh sách đề thi</h3>
        {loading ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {exams.length === 0 ? <p style={{textAlign:'center', color:'#666'}}>Chưa có đề thi nào.</p> : 
                exams.map(exam => {
                    const status = getExamStatus(exam);
                    const isExpanded = expandedId === exam.id;

                    return (
                        <div key={exam.id} style={{
                            border: '1px solid #e5e7eb', borderRadius: '8px', 
                            background: 'white', overflow: 'hidden',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            {/*Click để xổ xuống*/}
                            <div 
                                onClick={() => handleToggle(exam.id)}
                                style={{
                                    padding: '15px 20px', 
                                    background: isExpanded ? '#f9fafb' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'
                                }}
                            >
                                <span style={{fontWeight: '600', fontSize: '1rem', color: '#1f2937'}}>
                                    {exam.title}
                                </span>
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    <span style={{
                                        fontSize: '0.85rem', fontWeight: '600', color: status.color,
                                        background: isExpanded ? 'white' : '#f3f4f6',
                                        padding: '4px 10px', borderRadius: '15px'
                                    }}>
                                        {status.text}
                                    </span>
                                    <span style={{color: '#9ca3af', fontSize: '0.8rem'}}>
                                        {isExpanded ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            {isExpanded && (
                                <div style={{padding: '20px'}}>
                                    {/* tthông tin chi tiết */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', 
                                        fontSize: '0.9rem', color: '#4b5563', marginBottom: '20px'
                                    }}>
                                        <div><b>Thời gian:</b> {exam.durationMinutes} phút</div>
                                        <div><b>Số câu hỏi:</b> {exam.totalQuestions} câu </div>
                                        <div><b>Bắt đầu:</b> {new Date(exam.startTime).toLocaleString('vi-VN')}</div>
                                        <div><b>Kết thúc:</b> {new Date(exam.endTime).toLocaleString('vi-VN')}</div>
                                        <div><b>Số lần làm tối đa:</b> {exam.maxAttempts} lần</div>
                                    </div>

                                    {/* các nút hđ */}
                                    <div style={{display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                                        {status.canJoin && (
                                            <button 
                                                className="modern-btn btn-blue"
                                                onClick={() => handleStartExam(exam.id)}
                                            >
                                                Bắt đầu làm bài
                                            </button>
                                        )}
                                        <button 
                                            className="modern-btn btn-gray"
                                            onClick={() => handleViewHistory(exam)}
                                        >
                                            Thống kê kết quả
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        {/* modal thống kê bài làm */}
        {showHistoryModal && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
                <div className="modern-card" style={{width: '700px', maxHeight: '80vh', overflowY: 'auto'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', alignItems:'center'}}>
                        <h3 style={{margin:0}}> {selectedExamTitle}</h3>
                        <button className="modern-btn btn-gray" onClick={() => setShowHistoryModal(false)}>Đóng</button>
                    </div>
                    
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                        <thead>
                            <tr style={{background: '#f9fafb', borderBottom: '2px solid #e5e7eb'}}>
                                <th style={{padding: '10px', textAlign: 'center'}}>STT</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Bắt đầu</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Nộp bài</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Số câu đúng</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Điểm</th>
                                <th style={{padding: '10px', textAlign: 'center'}}>Vi phạm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.map((h, index) => (
                                <tr key={h.submissionId} style={{borderBottom: '1px solid #f3f4f6'}}>
                                    <td style={{padding: '10px', textAlign: 'center'}}>#{historyData.length - index}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{h.startTime}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{h.submitTime}</td>
                                    <td style={{padding: '10px', textAlign: 'center'}}>{h.correctCount}/{h.totalQuestions}</td>
                                    <td style={{padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#000000'}}>
                                        {h.score}
                                    </td>
                                    <td style={{padding: '10px', textAlign: 'center', color: h.invalidAction > 0 ? '#ef4444' : '#0edd15'}}>
                                        {h.invalidAction > 0 ? h.invalidAction : '0'}
                                    </td>
                                </tr>
                            ))}
                            {historyData.length === 0 && <tr><td colSpan="6" style={{padding:'20px', textAlign:'center', color:'#666'}}>Chưa có bài làm nào.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
  );
};

export default StudentExamList;