import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const TeacherExamManager = () => {
  const { course } = useOutletContext();
  const [exams, setExams] = useState([]);
  const [viewMode, setViewMode] = useState('LIST'); 
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);

  // các modal
  const [showExamModal, setShowExamModal] = useState(false); // Thêm/Sửa đề
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false); // Thêm câu hỏi thủ công
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false); // Tạo đề tự động

  //menu 3 chấm
  const [activeMenuId, setActiveMenuId] = useState(null);

  // State Form Đề thi
  const [isEditExam, setIsEditExam] = useState(false);
  const [examForm, setExamForm] = useState({
      id: null, title: '', durationMinutes: 60, maxAttempts: 1, startTime: '', endTime: ''
  });

  //State Form Thêm câu hỏi thủ công
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [searchQuestionKey, setSearchQuestionKey] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // State Form Auto Generate
  const [autoGenForm, setAutoGenForm] = useState({ numberOfSingleChoice: '', numberOfMultipleChoice: '' });


  const getStatusPriority = (startStr, endStr) => {
      const now = new Date();
      const start = new Date(startStr);
      const end = new Date(endStr);

      if (now < start) return 2; // Sắp diễn ra
      if (now > end) return 3;   // Đã kết thúc
      return 1;                  // Đang diễn ra 
  };

  const sortExams = (list) => {
      return list.sort((a, b) => {
          const priorityA = getStatusPriority(a.startTime, a.endTime);
          const priorityB = getStatusPriority(b.startTime, b.endTime);
          return priorityA - priorityB;
      });
  };


  // lấy ds đề thi
  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher/exams?courseId=${course.id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const rawData = Array.isArray(res.data) ? res.data : [];
      setExams(sortExams(rawData));
    } catch (error) {
      console.error("Lỗi tải đề thi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) fetchExams();
  }, [course]);

  // lấy câu hỏi trong đề
  const fetchExamQuestions = async (examId) => {
      setLoading(true);
      try {
          const res = await axios.get(`/api/teacher/exams/${examId}/questions`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setExamQuestions(res.data);
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  // lấy câu hỏi chưa có trong đề
  const fetchAvailableQuestions = async (keyword = '') => {
      if (!selectedExam) return;
      try {
          const res = await axios.get(`/api/teacher/exams/${selectedExam.id}/available-questions`, {
              params: { keyword },
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setAvailableQuestions(res.data);
      } catch (error) {
          console.error(error);
      }
  };

  

  //Quản lý đè thi
  const handleSaveExam = async (e) => {
      e.preventDefault();
      const payload = {
          ...examForm,
          courseId: course.id,
          startTime: examForm.startTime.replace('T', ' ') + ':00',
          endTime: examForm.endTime.replace('T', ' ') + ':00'
      };

      try {
          if (isEditExam) {
              await axios.put(`/api/teacher/exams/${examForm.id}`, payload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              alert("Cập nhật thành công!");
          } else {
              await axios.post(`/api/teacher/exams`, payload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              alert("Tạo đề thi thành công!");
          }
          setShowExamModal(false);
          fetchExams();
      } catch (error) {
          alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
  };

  const handleDeleteExam = async (id) => {
      if(!window.confirm("Bạn chắc chắn xóa đề thi này?")) return;
      try {
          await axios.delete(`/api/teacher/exams/${id}`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert("Đã xóa đề thi!");
          fetchExams();
      } catch (error) {
          alert("Lỗi xóa đề thi");
      }
      setActiveMenuId(null);
  };

  const openEditExam = (exam) => {
      const toInputTime = (str) => str ? str.replace(' ', 'T').substring(0, 16) : '';
      setExamForm({
          id: exam.id,
          title: exam.title,
          durationMinutes: exam.durationMinutes,
          maxAttempts: exam.maxAttempts,
          startTime: toInputTime(exam.startTime),
          endTime: toInputTime(exam.endTime)
      });
      setIsEditExam(true);
      setShowExamModal(true);
      setActiveMenuId(null);
  };

  // quản lý câu hỏi trong đề thi
  const handleViewDetail = (exam) => {
      setSelectedExam(exam);
      fetchExamQuestions(exam.id);
      setViewMode('DETAIL');
      setActiveMenuId(null);
  };

  const handleRemoveQuestion = async (qId) => {
      if(!window.confirm("Xóa câu hỏi này khỏi đề?")) return;
      try {
          await axios.delete(`/api/teacher/exams/${selectedExam.id}/questions/${qId}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          fetchExamQuestions(selectedExam.id);
      } catch (error) {
          alert("Lỗi xóa câu hỏi");
      }
  };

  //thêm bằng checkbox
  const handleAddManualSubmit = async () => {
      if (selectedQuestionIds.length === 0) return alert("Chưa chọn câu hỏi nào!");
      try {
          await axios.post(`/api/teacher/exams/${selectedExam.id}/questions`, {
              questionIds: selectedQuestionIds
          }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert(`Đã thêm ${selectedQuestionIds.length} câu hỏi!`);
          setShowAddQuestionModal(false);
          fetchExamQuestions(selectedExam.id);
      } catch (error) {
          alert("Lỗi thêm câu hỏi");
      }
  };

  // tạo tự động
  const handleAutoGenerateSubmit = async (e) => {
      e.preventDefault();
      const payload = {
          numberOfSingleChoice: parseInt(autoGenForm.numberOfSingleChoice) || 0,
          numberOfMultipleChoice: parseInt(autoGenForm.numberOfMultipleChoice) || 0
      };

      if (payload.numberOfSingleChoice === 0 && payload.numberOfMultipleChoice === 0) {
          return alert("Vui lòng nhập số lượng câu hỏi!");
      }

      try {
          await axios.post(`/api/teacher/exams/${selectedExam.id}/auto-generate`, payload, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert("Đã tạo câu hỏi ngẫu nhiên thành công!");
          setShowAutoGenerateModal(false);
          fetchExamQuestions(selectedExam.id);
      } catch (error) {
          alert("Lỗi: " + (error.response?.data?.message || "Không đủ câu hỏi trong ngân hàng"));
      }
  };


//danh sách đề thi
  const renderExamList = () => (
      <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
             <h3 style={{margin: 0}}>Danh sách đề thi ({exams.length})</h3>
             <button className="modern-btn btn-blue" onClick={() => {
                 setExamForm({id: null, title: '', durationMinutes: 60, maxAttempts: 1, startTime: '', endTime: ''});
                 setIsEditExam(false);
                 setShowExamModal(true);
             }}>Thêm đề thi</button>
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '800px' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <tr>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Tên đề thi</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Thời lượng</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Số lần thi</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Thời gian mở</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Trạng thái</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '80px', color: '#4b5563' }}>Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {exams.length === 0 ? <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>Chưa có đề thi nào</td></tr> : 
                      exams.map(e => {
                          const now = new Date();
                          const start = new Date(e.startTime);
                          const end = new Date(e.endTime);
                          let status = { label: 'Đang diễn ra', color: '#10b981', bg: '#d1fae5' };
                          
                          if (now < start) status = { label: 'Sắp diễn ra', color: '#f59e0b', bg: '#fef3c7' };
                          else if (now > end) status = { label: 'Đã kết thúc', color: '#6b7280', bg: '#f3f4f6' };

                          return (
                              <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td 
                                    style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#2563eb', cursor: 'pointer' }}
                                    onClick={() => handleViewDetail(e)}
                                  >
                                      {e.title}
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>{e.durationMinutes} phút</td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>{e.maxAttempts}</td>
                                  <td style={{ padding: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#555' }}>
                                      <div>Bắt đầu: {new Date(e.startTime).toLocaleString('vi-VN')}</div>
                                      <div style={{color: '#ef4444'}}>Kết thúc: {new Date(e.endTime).toLocaleString('vi-VN')}</div>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <span style={{ 
                                          padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600',
                                          backgroundColor: status.bg, color: status.color, whiteSpace: 'nowrap'
                                      }}>
                                          {status.label}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                       <div style={{position:'relative', display: 'inline-block'}}>
                                          <button 
                                              style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', padding:'5px', color: '#6b7280'}}
                                              onClick={() => setActiveMenuId(activeMenuId === e.id ? null : e.id)}
                                          >
                                              ⋮
                                          </button>
                                          {activeMenuId === e.id && (
                                              <div className="card-menu" style={{right: 0, top: '100%', textAlign:'left'}}>
                                                  <div onClick={() => openEditExam(e)}>Sửa thông tin</div>
                                                  <div onClick={() => handleDeleteExam(e.id)} style={{color:'#ef4444'}}>Xóa đề thi</div>
                                              </div>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
  );

  // quản lý đề thi
  const renderExamDetail = () => (
      <div>
          <div className="modern-card" style={{padding: '20px', marginBottom: '20px'}}>
              
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h2 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '1.6rem' }}>
                      {selectedExam.title}
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '1rem', color: '#4b5563', flexWrap: 'wrap' }}>
                      <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                          Số lượng: <b style={{color: '#2563eb'}}>{examQuestions.length}</b> câu
                      </span>
                      <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                          Thời gian: <b style={{color: '#2563eb'}}>{selectedExam.durationMinutes}</b> phút
                      </span>
                      <span style={{display:'flex', alignItems:'center', gap:'5px'}}>
                          Số lần thi: <b>{selectedExam.maxAttempts}</b>
                      </span>
                  </div>
              </div>

              {/*thêm, tạo, quay lại*/}
              <div style={{ 
                  marginTop: '15px', 
                  paddingTop: '15px', 
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex', 
                  justifyContent: 'space-between', // Tách 2 bên
                  alignItems: 'center'
              }}>
                  {/* Nút Quay lại bên trái */}
                  <button 
                    className="modern-btn btn-gray" 
                    onClick={() => setViewMode('LIST')}
                    style={{padding: '8px 15px'}}
                  >
                    Quay lại
                  </button>

                  {/* Nhóm nút chức năng bên phải */}
                  <div style={{display: 'flex', gap: '10px'}}>
                      <button className="modern-btn btn-blue" onClick={() => {
                          setAutoGenForm({ numberOfSingleChoice: '', numberOfMultipleChoice: '' });
                          setShowAutoGenerateModal(true);
                      }}>
                        Tạo tự động
                      </button>
                      <button className="modern-btn btn-blue" onClick={() => {
                          setSearchQuestionKey('');
                          setSelectedQuestionIds([]);
                          setShowAddQuestionModal(true);
                          fetchAvailableQuestions('');
                      }}>
                          Thêm câu hỏi
                      </button>
                  </div>
              </div>
          </div>

          {/* Bảng danh sách câu hỏi */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '700px' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <tr>
                          <th style={{ padding: '15px', textAlign: 'center', width: '50px', color:'#4b5563' }}>STT</th>
                          <th style={{ padding: '15px', textAlign: 'left', color:'#4b5563' }}>Nội dung câu hỏi</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '150px', color:'#4b5563' }}>Loại</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '100px', color:'#4b5563' }}>Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {examQuestions.length === 0 ? (
                          <tr><td colSpan="4" style={{padding:'30px', textAlign:'center', color:'#666'}}>Đề thi chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</td></tr>
                      ) : (
                          examQuestions.map((q, index) => (
                              <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{index + 1}</td>
                                  <td style={{ padding: '15px', fontWeight: '500' }}>
                                      <div style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                          {q.content}
                                      </div>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <span style={{ 
                                          padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600',
                                          backgroundColor: q.questionType === 'SINGLE' ? '#eff6ff' : '#fef3c7',
                                          color: q.questionType === 'SINGLE' ? '#2563eb' : '#d97706',
                                          whiteSpace: 'nowrap'
                                      }}>
                                          {q.questionType === 'SINGLE' ? 'Một đáp án' : 'Nhiều đáp án'}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <button 
                                          onClick={() => handleRemoveQuestion(q.id)}
                                          className="modern-btn"
                                          style={{
                                              background: '#fee2e2', color: '#ef4444', border: 'none', 
                                              fontWeight: '600', cursor: 'pointer', padding: '6px 12px', fontSize: '0.85rem'
                                          }}
                                      >
                                          Xóa
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

  return (
    <div>
      {viewMode === 'LIST' && renderExamList()}
      {viewMode === 'DETAIL' && renderExamDetail()}

      {/* modal thêm/sửa đề thi */}
      {showExamModal && (
        <div className="modal-overlay">
            <div className="modern-card" style={{width:'500px', margin:0}}>
                <h3 className="card-title">{isEditExam ? 'Cập nhật đề thi' : 'Tạo đề thi mới'}</h3>
                <form onSubmit={handleSaveExam}>
                    <div className="form-group">
                        <label className="form-label">Tên đề thi</label>
                        <input type="text" className="modern-input" required 
                               value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} />
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <div className="form-group">
                            <label className="form-label">Thời gian (phút)</label>
                            <input type="number" className="modern-input" required min="1"
                                value={examForm.durationMinutes} onChange={e => setExamForm({...examForm, durationMinutes: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Số lần thi tối đa</label>
                            <input type="number" className="modern-input" required min="1"
                                value={examForm.maxAttempts} onChange={e => setExamForm({...examForm, maxAttempts: e.target.value})} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Thời gian bắt đầu</label>
                        <input type="datetime-local" className="modern-input" required
                               value={examForm.startTime} onChange={e => setExamForm({...examForm, startTime: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Thời gian kết thúc</label>
                        <input type="datetime-local" className="modern-input" required
                               value={examForm.endTime} onChange={e => setExamForm({...examForm, endTime: e.target.value})} />
                    </div>
                    <div className="btn-actions">
                        <button type="button" className="modern-btn btn-gray" onClick={() => setShowExamModal(false)}>Hủy</button>
                        <button type="submit" className="modern-btn btn-blue">Lưu lại</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* modal thêm câu hỏi thủ công */}
      {showAddQuestionModal && (
        <div className="modal-overlay">
            <div className="modern-card" style={{width:'700px', margin:0, maxHeight:'90vh', display:'flex', flexDirection:'column', padding:0}}>
                <div style={{padding:'20px', borderBottom:'1px solid #eee'}}>
                    <h3 className="card-title" style={{margin:0, border:'none', padding:0}}>Chọn câu hỏi từ Ngân hàng</h3>
                    <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                        <input type="text" className="modern-input" placeholder="Tìm nội dung câu hỏi..."
                               value={searchQuestionKey} onChange={e => setSearchQuestionKey(e.target.value)} />
                        <button className="modern-btn btn-blue" onClick={() => fetchAvailableQuestions(searchQuestionKey)}>Tìm</button>
                    </div>
                </div>
                <div style={{flex:1, overflowY:'auto', padding:'10px 20px'}}>
                    {availableQuestions.length === 0 ? <p style={{textAlign:'center', color:'#999'}}>Không tìm thấy câu hỏi nào.</p> :
                    availableQuestions.map(q => (
                        <label key={q.id} className="user-item" style={{display:'flex', gap:'10px', padding:'10px', borderBottom:'1px solid #f0f0f0', cursor:'pointer'}}>
                            <input type="checkbox" style={{width:'18px'}}
                                   checked={selectedQuestionIds.includes(q.id)}
                                   onChange={e => {
                                       if(e.target.checked) setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                                       else setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== q.id));
                                   }} />
                            <div style={{flex:1}}>
                                <div style={{fontWeight:500}}>{q.content}</div>
                                <div style={{fontSize:'0.85rem', color:'#666', marginTop:'4px'}}>
                                    <span style={{background:'#f3f4f6', padding:'2px 6px', borderRadius:'4px', marginRight:'10px'}}>
                                        {q.questionType === 'SINGLE' ? 'Một đáp án' : 'Nhiều đáp án'}
                                    </span>
                                    Người tạo: {q.createdBy}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="btn-actions" style={{padding:'20px', borderTop:'1px solid #eee', margin:0}}>
                    <button className="modern-btn btn-gray" onClick={() => setShowAddQuestionModal(false)}>Đóng</button>
                    <button className="modern-btn btn-blue" onClick={handleAddManualSubmit}>Thêm ({selectedQuestionIds.length})</button>
                </div>
            </div>
        </div>
      )}

      {/* modal tạo đề tự động */}
      {showAutoGenerateModal && (
        <div className="modal-overlay">
            <div className="modern-card" style={{width:'400px', margin:0}}>
                <h3 className="card-title">Tạo đề thi tự động</h3>
                <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'15px'}}>
                    Hệ thống sẽ lấy ngẫu nhiên câu hỏi từ ngân hàng để thêm vào đề thi này.
                </p>
                <form onSubmit={handleAutoGenerateSubmit}>
                    <div className="form-group">
                        <label className="form-label">Số câu Một đáp án</label>
                        <input 
                            type="number" className="modern-input" min="0" placeholder="0"
                            value={autoGenForm.numberOfSingleChoice} 
                            onChange={e => setAutoGenForm({...autoGenForm, numberOfSingleChoice: e.target.value})} 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số câu Nhiều đáp án</label>
                        <input 
                            type="number" className="modern-input" min="0" placeholder="0"
                            value={autoGenForm.numberOfMultipleChoice} 
                            onChange={e => setAutoGenForm({...autoGenForm, numberOfMultipleChoice: e.target.value})} 
                        />
                    </div>
                    <div className="btn-actions">
                        <button type="button" className="modern-btn btn-gray" onClick={() => setShowAutoGenerateModal(false)}>Hủy</button>
                        <button type="submit" className="modern-btn btn-blue">Tạo ngay</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0,0,0,0.5); z-index: 1100;
            display: flex; justify-content: center; align-items: center; padding: 15px;
        }
        .card-menu {
            position: absolute; top: 100%; right: 0;
            background: white; border: 1px solid #eee;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 6px; z-index: 10; width: 140px; text-align: left;
        }
        .card-menu div {
            padding: 10px 15px; font-size: 0.9rem; cursor: pointer;
        }
        .card-menu div:hover { background: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default TeacherExamManager;