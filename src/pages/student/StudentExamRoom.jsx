import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useAuth } from '../../context/AuthContext';
import '../../styles/DashboardForms.css';

const StudentExamRoom = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // state dữ liệu về bài thi
  const [questions, setQuestions] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); 
  // UI state
  const [showRulesModal, setShowRulesModal] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal xác nhận nộp bài
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  //về dữ liệu bài làm
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [submittedStatus, setSubmittedStatus] = useState({}); 
  const [violationCount, setViolationCount] = useState(0);
  // Refs
  const stompClientRef = useRef(null);
  const timerRef = useRef(null);
  // Hàm hiển thị thông báo
  const showToast = (msg, type = 'info') => {
      setNotification({ show: true, message: msg, type });
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const handleStartExam = async () => {
    if (!isAgreed) return;
    
    // Bật Fullscreen an toàn
    try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) await elem.requestFullscreen();
    } catch (err) {
        console.warn("Fullscreen blocked:", err);
    }

    setLoading(true);
    initExamData();
  };

  const initExamData = async () => {
    try {
        const token = localStorage.getItem('token');
        
        //bắt đầu hoặc lấy lại bài thi đang làm dở
        const resStart = await axios.post(`/api/student/exams/${examId}/start`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const { submissionId, endTime, currentViolations, currentAnswers } = resStart.data;
        setSubmissionId(submissionId);
        setViolationCount(currentViolations || 0);

        //đồng bộ dữ liệu đã làm nếu làm dở
        if (currentAnswers && currentAnswers.length > 0) {
            const restoredAnswers = {};
            const restoredStatus = {};
            
            currentAnswers.forEach(item => {
                restoredAnswers[item.questionId] = item.selectedOptionIds;
                restoredStatus[item.questionId] = true; 
            });
            setSelectedAnswers(restoredAnswers);
            setSubmittedStatus(restoredStatus);
        }
        
        // tính thời gian còn lại
        const endMs = new Date(endTime).getTime();
        const diffSec = Math.floor((endMs - new Date().getTime()) / 1000);
        setTimeLeft(diffSec > 0 ? diffSec : 0);

        //lấy đề thi
        const resContent = await axios.get(`/api/student/exams/${examId}/content`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(resContent.data);

        //kết nối socket
        connectWebSocket(user.userCode);
        setShowRulesModal(false);
        setLoading(false);

    } catch (error) {
        setLoading(false);
        showToast("Lỗi vào phòng thi: " + (error.response?.data?.message || error.message), 'error');
        setTimeout(() => navigate('/student'), 2000);
    }
  };

  // websocket và bộ đếm thời gian

  const connectWebSocket = (userCode) => {
      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = Stomp.over(socket);
      stompClient.debug = null; 

      stompClient.connect({ 'Authorization': `Bearer ${localStorage.getItem('token')}` }, () => {
          stompClientRef.current = stompClient;
          stompClient.subscribe(`/user/${userCode}/queue/exam-status`, (msg) => {
              const payload = JSON.parse(msg.body);
              if (payload.type === 'FORCE_SUBMIT') {
                  showToast("Hết giờ! Hệ thống đang thu bài...", "error");
                  handleFinishExam(true);
              }
          });
      });
  };

  // Bộ đếm thời gian
  useEffect(() => {
      if (!showRulesModal && timeLeft > 0) {
          timerRef.current = setInterval(() => {
              setTimeLeft(prev => {
                  if (prev <= 1) {
                      clearInterval(timerRef.current);
                      handleFinishExam(true);
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(timerRef.current);
  }, [showRulesModal, timeLeft]);

  const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      const pad = (n) => n < 10 ? '0'+n : n;
      return `${h > 0 ? h + ':' : ''}${pad(m)}:${pad(s)}`;
  };

  //đếm vi phạm

  const recordViolation = async () => {
      setViolationCount(prev => prev + 1);
      showToast("Bạn vừa có thao tác không hợp lệ!", "error");
      
      if (submissionId) {
          try {
              await axios.post(`/api/student/exams/${submissionId}/report-violation`, {}, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
          } catch (err) {}
      }
  };

  useEffect(() => {
      if (showRulesModal) return;
      const preventDefault = (e) => e.preventDefault();
      const handleKeyDown = (e) => {
          if (['F12', 'F5'].includes(e.key) || (e.ctrlKey && ['r','c','v','a','p','u','s'].includes(e.key.toLowerCase())) || (e.altKey && e.key === 'Tab')) {
              e.preventDefault();
          }
      };
      
      const handleVisibilityChange = () => { if (document.hidden) recordViolation(); };
      const handleBlur = () => recordViolation();
      const handleFullscreenChange = () => { if (!document.fullscreenElement) recordViolation(); };

      window.addEventListener('contextmenu', preventDefault);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('selectstart', preventDefault);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
          window.removeEventListener('contextmenu', preventDefault);
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('selectstart', preventDefault);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          window.removeEventListener('blur', handleBlur);
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
  }, [showRulesModal, submissionId]);

  // logic khi làm bài thi

  const handleOptionSelect = (questionId, optionId, type) => {
      setSelectedAnswers(prev => {
          const current = prev[questionId] || [];
          if (type === 'SINGLE') return { ...prev, [questionId]: [optionId] };
          else {
              return { ...prev, [questionId]: current.includes(optionId) 
                  ? current.filter(id => id !== optionId) 
                  : [...current, optionId] 
              };
          }
      });
      setSubmittedStatus(prev => ({ ...prev, [questionId]: false }));
  };

  const handleSubmitSingle = async (questionId) => {
      const options = selectedAnswers[questionId];
      if (!options || options.length === 0) return showToast("Hãy chọn đáp án!", "error");

      try {
          await axios.post(`/api/student/exams/submit-answer`, {
              submissionId, questionId, selectedOptionIds: options
          }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setSubmittedStatus(prev => ({ ...prev, [questionId]: true }));
      } catch (error) {
          showToast("Lỗi kết nối server", "error");
      }
  };

  const handleFinishExam = async (isForce = false) => {
      setShowConfirmModal(false);

      try {
          await axios.post(`/api/student/exams/${submissionId}/finish`, {}, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (document.fullscreenElement) {
              try { await document.exitFullscreen(); } catch (e) { console.log("Thoát fullscreen tự động"); }
          }
          
          const cid = questions[0]?.courseId || ''; 
          navigate(cid ? `/student/courses/${cid}` : '/student'); 
      } catch (error) {
          showToast("Lỗi nộp bài", "error");
      }
  };

  const scrollToQuestion = (qId) => {
      const el = document.getElementById(`q-${qId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };



  return (
    <div className="exam-wrapper">
      {/* CSS */}
      <style>{`
        body { overflow: hidden; margin: 0; }
        .exam-wrapper { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; font-family: 'Segoe UI', sans-serif; user-select: none; }
            .exam-container { 
            display: flex; 
            width: 100%; 
            height: 100%; 
            overflow: hidden; 
        }

        /* SIDEBAR */
        .exam-sidebar {
            width: 280px; background: white; border-right: 1px solid #e2e8f0;
            display: flex; flex-direction: column; z-index: 20;
            flex-shrink: 0;
        }
        .user-section {
            padding: 20px; border-bottom: 1px solid #f1f5f9; background: #fff;
        }
        .user-name { font-weight: 700; font-size: 1.1rem; color: #1e293b; margin-bottom: 5px; }
        .user-meta { font-size: 0.9rem; color: #64748b; line-height: 1.4; }

        .palette-section {
            flex: 1; overflow-y: auto; padding: 15px;
        }
        .palette-title { font-size: 0.9rem; color: #64748b; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; }
        .palette-grid {
            display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
        }
        .q-box {
            height: 36px; border: 1px solid #cbd5e1; border-radius: 6px;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.85rem; cursor: pointer; color: #475569; background: #fff;
            transition: all 0.1s;
        }
        .q-box:hover { border-color: #3b82f6; color: #3b82f6; }
        .q-box.done { background: #2563eb; color: white; border-color: #2563eb; font-weight: 600; }
        
        .timer-section {
            padding: 15px; background: #fff1f2; text-align: center; border-top: 1px solid #fecdd3;
        }
        .timer-val { color: #e11d48; font-size: 1.6rem; font-weight: 800; font-family: monospace; }
        
        .violation-section {
            padding: 12px; background: #e1d93e; text-align: center; color: #000000; font-weight: 600; font-size: 1rem;
        }

        /* MAIN CONTENT */
        .exam-main {
            flex: 1; overflow-y: auto; padding: 30px; scroll-behavior: smooth; position: relative;
        }
        .question-card {
            background: white; border-radius: 10px; padding: 25px; margin-bottom: 25px;
            border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .q-idx { 
            display: inline-block; background: #eff6ff; color: #2563eb; 
            padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 0.9rem; margin-bottom: 10px;
        }
        .q-content { font-size: 1.05rem; color: #334155; margin-bottom: 20px; line-height: 1.6; }
        
        .option-row {
            display: flex; align-items: flex-start; gap: 12px; padding: 12px;
            border: 1px solid #f1f5f9; border-radius: 8px; margin-bottom: 10px; cursor: pointer; transition: 0.1s;
        }
        .option-row:hover { background: #f8fafc; border-color: #cbd5e1; }
        .option-row.selected { background: #eff6ff; border-color: #3b82f6; }
        .option-input { margin-top: 4px; transform: scale(1.1); cursor: pointer; }
        
        .action-row { margin-top: 15px; display: flex; align-items: center; gap: 15px; }
        .btn-send {
            background: #2563eb; color: white; border: none; padding: 8px 20px;
            border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem;
        }
        .btn-send:hover { background: #1d4ed8; }
        .status-text { color: #2563eb; font-size: 0.9rem; font-weight: 500; }

        .btn-submit-exam {
            display: block; width: 100%; max-width: 250px; margin: 40px auto; padding: 15px;
            background: #ef4444; color: white; border: none; border-radius: 8px;
            font-size: 1.1rem; font-weight: 700; cursor: pointer;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .btn-submit-exam:hover { background: #dc2626; }

        /* TOAST */
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 10000; }
        .toast {
            background: #333; color: white; padding: 12px 24px; border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
            font-size: 0.95rem; font-weight: 500;
        }
        .toast.success { background: #10b981; }
        .toast.error { background: #ef4444; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        /* MODAL */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 9999;
        }
        .modal-content {
            background: white; width: 90%; max-width: 500px; padding: 30px;
            border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
            /* 1. Chuyển container chính sang cột dọc */
            .exam-container { flex-direction: column; }
            
            /* 2. Sidebar nằm trên */
            .exam-sidebar { 
                width: 100%; height: auto; 
                flex-direction: row; flex-wrap: wrap; 
                border-right: none; border-bottom: 2px solid #e2e8f0; 
            }
            .user-section { 
                width: 100%; padding: 10px 15px; 
                display: flex; justify-content: space-between; align-items: center; 
                order: 1; border-bottom: 1px solid #f1f5f9;
            }
            .user-meta { display: none; }
            
            .palette-section { display: none; } 
            
            .timer-section { 
                width: 50%; padding: 8px; order: 2; 
                border-top: none; border-right: 1px solid #ddd; 
            }
            .timer-val { font-size: 1.2rem; }
            
            .violation-section { width: 50%; padding: 8px; order: 3; display: flex; align-items: center; justify-content: center; }
            
            /* 3. Main content tự co giãn chiếm phần còn lại */
            .exam-main { padding: 10px; flex: 1; }
        }
      `}</style>

      {/* TOAST */}
      {notification.show && (
          <div className="toast-container">
              <div className={`toast ${notification.type}`}>
                  {notification.message}
              </div>
          </div>
      )}

      {/* MODAL QUY CHẾ */}
      {showRulesModal && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2 style={{marginTop:0, textAlign:'center', color:'#dc2626'}}>Yêu cầu khi vào làm bài thi</h2>
                  <div style={{background:'#fef2f2', padding:'15px', borderRadius:'8px', margin:'20px 0', border:'1px solid #fecaca'}}>
                      <ul style={{margin:0, paddingLeft:'20px', color:'#991b1b', lineHeight:'1.6'}}>
                          <li>Bài thi sẽ bật chế độ <b>toàn màn hình</b>.</li>
                          <li>Cấm thoát màn hình, chuyển tab, mở ứng dụng khác.</li>
                          <li>Cấm sử dụng phím tắt (Ctrl, Alt, F5...).</li>
                          <li>Hệ thống tự động ghi nhận số lần vi phạm.</li>
                          <li>Nếu có vấn đề, cần báo ngay cho giám thị.</li>
                      </ul>
                  </div>
                  <div style={{textAlign:'center', marginBottom:'20px'}}>
                      <label style={{cursor:'pointer', fontWeight:'500', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                          <input type="checkbox" style={{width:'18px', height:'18px'}} onChange={e => setIsAgreed(e.target.checked)} />
                          Tôi đồng ý tuân thủ các quy định trên.
                      </label>
                  </div>
                  <button 
                    onClick={handleStartExam} 
                    disabled={!isAgreed || loading}
                    style={{
                        width:'100%', padding:'12px', borderRadius:'6px', border:'none',
                        background: isAgreed ? '#2563eb' : '#94a3b8', color:'white',
                        fontWeight:'bold', fontSize:'1rem', cursor: isAgreed?'pointer':'not-allowed'
                    }}
                  >
                      {loading ? 'Đang vào phòng thi...' : 'BẮT ĐẦU LÀM BÀI'}
                  </button>
              </div>
          </div>
      )}

      {/* MODAL XÁC NHẬN NỘP BÀI */}
      {showConfirmModal && (
          <div className="modal-overlay">
              <div className="modal-content" style={{textAlign:'center'}}>
                  <h3 style={{marginTop:0}}>Xác nhận nộp bài?</h3>
                  <p style={{color:'#64748b'}}>Bạn chắc chắn muốn kết thúc bài thi? <br/>Hành động này không thể hoàn tác.</p>
                  <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'25px'}}>
                      <button 
                        onClick={() => setShowConfirmModal(false)}
                        style={{padding:'10px 25px', borderRadius:'6px', border:'1px solid #cbd5e1', background:'white', cursor:'pointer'}}
                      >
                          Quay lại
                      </button>
                      <button 
                        onClick={() => handleFinishExam(false)}
                        style={{padding:'10px 25px', borderRadius:'6px', border:'none', background:'#ef4444', color:'white', fontWeight:'bold', cursor:'pointer'}}
                      >
                          Nộp bài ngay
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* GIAO DIỆN CHÍNH */}
      {!showRulesModal && (
          <div className="exam-container">
              
              {/* SIDEBAR */}
              <div className="exam-sidebar">
                  <div className="user-section">
                      <div className="user-name" style={{textAlign:"center"}}>{user.fullName}</div>
                      <div className="user-meta" style={{textAlign:"center"}}>{user.userCode}</div>
                      <div className="user-meta" style={{textAlign:"center"}}>{user.email}</div>
                  </div>

                  <div className="palette-section">
                      <div className="palette-title"></div>
                      <div className="palette-grid">
                          {questions.map((q, i) => (
                              <div 
                                key={q.questionId} 
                                className={`q-box ${submittedStatus[q.questionId] ? 'done' : ''}`}
                                onClick={() => scrollToQuestion(q.questionId)}
                              >
                                  {i + 1}
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="timer-section">
                      <div style={{fontSize:'0.8rem', color:'#881337', marginBottom:'5px'}}>THỜI GIAN CÒN LẠI</div>
                      <div className="timer-val">{formatTime(timeLeft)}</div>
                  </div>
                  <div className="violation-section">
                      Vi phạm: {violationCount} lần
                  </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="exam-main">
                  {questions.map((q, i) => (
                      <div key={q.questionId} id={`q-${q.questionId}`} className="question-card">
                          <div className="q-idx">Câu {i + 1}</div>
                          <div className="q-content">{q.content}</div>
                          
                          <div>
                              {q.options.map(opt => {
                                  const isSelected = selectedAnswers[q.questionId]?.includes(opt.id);
                                  return (
                                      <label key={opt.id} className={`option-row ${isSelected ? 'selected' : ''}`}>
                                          <input 
                                              type={q.questionType === 'SINGLE' ? 'radio' : 'checkbox'}
                                              className="option-input"
                                              checked={isSelected || false}
                                              onChange={() => handleOptionSelect(q.questionId, opt.id, q.questionType)}
                                          />
                                          <span>{opt.optionText}</span>
                                      </label>
                                  )
                              })}
                          </div>

                          <div className="action-row">
                              <button className="btn-send" onClick={() => handleSubmitSingle(q.questionId)}>
                                  Gửi
                              </button>
                              {submittedStatus[q.questionId] && (
                                  <span className="status-text">Câu trả lời đã được gửi</span>
                              )}
                          </div>
                      </div>
                  ))}

                  <button className="btn-submit-exam" onClick={() => setShowConfirmModal(true)}>
                      NỘP BÀI
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentExamRoom;