import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../../styles/DashboardForms.css';

const TeacherQuestionManager = () => {
  const { course } = useOutletContext();
  const [questions, setQuestions] = useState([]);
  const [viewMode, setViewMode] = useState('LIST'); 
  const [loading, setLoading] = useState(false);
  
  // State cho Form
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    content: '',
    questionType: 'SINGLE', 
    options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
    ]
  });

  // menu hành động
  const [activeMenuId, setActiveMenuId] = useState(null);

  //api lấy danh sách câu hỏi
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/teacher/questions/course/${course.id}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQuestions(res.data);
    } catch (error) {
      console.error("Lỗi tải câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course?.id) fetchQuestions();
  }, [course]);

  //form xử lý thay đổi loại câu hỏi
  const handleTypeChange = (newType) => {
      let updatedOptions = [...formData.options];
      if (newType === 'SINGLE') {
          let foundCorrect = false;
          updatedOptions = updatedOptions.map(opt => {
              if (opt.isCorrect) {
                  if (!foundCorrect) {
                      foundCorrect = true;
                      return opt; 
                  } else {
                      return { ...opt, isCorrect: false }; 
                  }
              }
              return opt;
          });
      }
      setFormData({ ...formData, questionType: newType, options: updatedOptions });
  };

  const handleOptionChange = (index, field, value) => {
      const newOptions = [...formData.options];
      if (field === 'isCorrect') {
          if (formData.questionType === 'SINGLE') {
              newOptions.forEach((opt, i) => {
                  opt.isCorrect = (i === index) ? value : false;
              });
          } else {
              newOptions[index].isCorrect = value;
          }
      } else {
          newOptions[index][field] = value;
      }
      setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
      setFormData({
          ...formData,
          options: [...formData.options, { optionText: '', isCorrect: false }]
      });
  };

  const removeOption = (index) => {
      if (formData.options.length <= 2) {
          alert("Câu hỏi cần ít nhất 2 đáp án!");
          return;
      }
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
  };

  // xử lý chỉnh sửa câu hỏi
  const handleEditClick = async (q) => {
      try {
        const res = await axios.get(`/api/teacher/questions/${q.id}`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const detail = res.data;
        setFormData({
            id: detail.id,
            content: detail.content,
            questionType: detail.questionType,
            options: detail.options || []
        });
        setIsEdit(true);
        setViewMode('FORM');
        setActiveMenuId(null);
      } catch (err) {
          alert("Lỗi tải chi tiết câu hỏi");
      }
  };
  
  const handleViewClick = async (q) => {
       try {
        const res = await axios.get(`/api/teacher/questions/${q.id}`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFormData(res.data);
        setViewMode('VIEW_ONLY');
        setActiveMenuId(null);
      } catch (err) {
          alert("Lỗi tải chi tiết câu hỏi");
      }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;
      try {
          await axios.delete(`/api/teacher/questions/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          alert("Đã xóa!");
          fetchQuestions();
      } catch (err) {
          alert("Không thể xóa (có thể câu hỏi đang nằm trong đề thi)");
      }
      setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const correctCount = formData.options.filter(o => o.isCorrect).length;
      if (correctCount === 0) return alert("Vui lòng chọn ít nhất 1 đáp án đúng!");
      if (formData.questionType === 'SINGLE' && correctCount > 1) return alert("Câu hỏi 1 đáp án chỉ được chọn 1 đáp án đúng!");

      const payload = {
          courseId: course.id,
          content: formData.content,
          questionType: formData.questionType,
          options: formData.options
      };

      try {
          if (isEdit) {
              await axios.put(`/api/teacher/questions/${formData.id}`, payload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              alert("Cập nhật thành công!");
          } else {
              await axios.post(`/api/teacher/questions`, payload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              alert("Thêm mới thành công!");
          }
          setViewMode('LIST');
          fetchQuestions();
      } catch (err) {
          alert("Lỗi: " + (err.response?.data?.message || err.message));
      }
  };


  // danh sách câu hỏi
  const renderList = () => (
      <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
             <h3 style={{margin: 0}}>Ngân hàng câu hỏi ({questions.length})</h3>
             <button className="modern-btn btn-blue" onClick={() => {
                 setFormData({
                     id: null, content: '', questionType: 'SINGLE',
                     options: [ {optionText:'', isCorrect:false}, {optionText:'', isCorrect:false}, {optionText:'', isCorrect:false}, {optionText:'', isCorrect:false} ]
                 });
                 setIsEdit(false);
                 setViewMode('FORM');
             }}>Thêm câu hỏi</button>
          </div>

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', minWidth: '800px' }}>
                  <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <tr>
                          <th style={{ padding: '15px', textAlign: 'center', width: '50px', color: '#4b5563' }}>STT</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#4b5563' }}>Nội dung câu hỏi</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '140px', color: '#4b5563' }}>Loại</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '160px', color: '#4b5563' }}>Người tạo</th>
                          <th style={{ padding: '15px', textAlign: 'center', width: '100px', color: '#4b5563' }}>Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {questions.length === 0 ? (
                          <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#666'}}>Chưa có câu hỏi nào</td></tr>
                      ) : (
                          questions.map((q, index) => (
                              <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                  <td style={{ padding: '15px', textAlign: 'center', color: '#666' }}>{index + 1}</td>
                                  
                                  <td style={{ padding: '15px', fontWeight: '500', textAlign: 'left' }}>
                                      <div style={{
                                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'
                                      }}>
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

                                  <td style={{ padding: '15px', textAlign: 'center', color: '#374151' }}>
                                      {q.createdBy || '---'}
                                  </td>

                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                       <div style={{position:'relative', display: 'inline-block'}}>
                                          <button 
                                              style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', padding:'5px', color: '#6b7280'}}
                                              onClick={() => setActiveMenuId(activeMenuId === q.id ? null : q.id)}
                                          >
                                              ⋮
                                          </button>
                                          {activeMenuId === q.id && (
                                              <div className="card-menu" style={{right: 0, top: '100%', textAlign: 'left'}}>
                                                  <div onClick={() => handleViewClick(q)}>Xem chi tiết</div>
                                                  <div onClick={() => handleEditClick(q)}>Sửa câu hỏi</div>
                                                  <div onClick={() => handleDelete(q.id)} style={{color:'#ef4444'}}>Xóa câu hỏi</div>
                                              </div>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  //form thêm sửa xem dùng chung
  const renderForm = () => {
      const isViewOnly = viewMode === 'VIEW_ONLY';
      
      return (
          <div className="modern-card" style={{maxWidth:'800px', margin:'0 auto'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                  <h3>{isViewOnly ? 'Chi tiết câu hỏi' : (isEdit ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới')}</h3>
                  <button className="modern-btn btn-gray" onClick={() => setViewMode('LIST')}>Quay lại</button>
              </div>

              <form onSubmit={handleSubmit}>
                  {/*thôgn tin câu hỏi */}
                  <div style={{background:'#f9fafb', padding:'20px', borderRadius:'8px', marginBottom:'20px'}}>
                      <div className="form-group">
                          <label className="form-label">Nội dung câu hỏi</label>
                          <textarea 
                              className="modern-input" rows="3" required disabled={isViewOnly}
                              value={formData.content}
                              onChange={e => setFormData({...formData, content: e.target.value})}
                              placeholder="Nhập nội dung câu hỏi..."
                          />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Loại câu hỏi</label>
                          <select 
                              className="modern-input" disabled={isViewOnly}
                              value={formData.questionType}
                              onChange={e => handleTypeChange(e.target.value)}
                          >
                              <option value="SINGLE">Một đáp án</option>
                              <option value="MULTIPLE">Nhiều đáp án</option>
                          </select>
                      </div>
                  </div>

                  {/* các đáp án lựa chọn */}
                  <div>
                      <label className="form-label" style={{marginBottom:'15px'}}>Danh sách đáp án (Tích chọn đáp án đúng)</label>
                      
                      {formData.options.map((opt, idx) => (
                          <div key={idx} style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                              <input 
                                  type={formData.questionType === 'SINGLE' ? 'radio' : 'checkbox'}
                                  name="correctOption" 
                                  checked={opt.isCorrect || false}
                                  onChange={e => !isViewOnly && handleOptionChange(idx, 'isCorrect', e.target.checked)}
                                  style={{width:'20px', height:'20px', cursor: isViewOnly ? 'default' : 'pointer'}}
                                  disabled={isViewOnly}
                              />
                              
                              <input 
                                  type="text" className="modern-input" required disabled={isViewOnly}
                                  value={opt.optionText}
                                  onChange={e => handleOptionChange(idx, 'optionText', e.target.value)}
                                  placeholder={`Đáp án ${idx + 1}`}
                              />

                              {!isViewOnly && (
                                  <button 
                                    type="button" 
                                    onClick={() => removeOption(idx)} 
                                    style={{
                                        border:'none', background:'none', color:'#ef4444', 
                                        cursor:'pointer', fontSize:'0.9rem', fontWeight:'600',
                                        whiteSpace: 'nowrap', padding: '5px'
                                    }}
                                  >
                                      Xóa
                                  </button>
                              )}
                          </div>
                      ))}

                      {!isViewOnly && (
                          <button type="button" className="modern-btn btn-gray" onClick={addOption} style={{marginTop:'10px', fontSize:'0.9rem'}}>
                              Thêm đáp án
                          </button>
                      )}
                  </div>

                  {!isViewOnly && (
                      <div className="btn-actions" style={{marginTop:'20px'}}>
                          <button type="submit" className="modern-btn btn-blue">
                              {isEdit ? 'Lưu cập nhật' : 'Tạo câu hỏi'}
                          </button>
                      </div>
                  )}
              </form>
          </div>
      );
  };

  return (
      <div>
          <style>{`
            .card-menu {
                position: absolute; top: 100%; right: 0;
                background: white; border: 1px solid #eee;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-radius: 6px; z-index: 10; width: 140px;
                text-align: left;
            }
            .card-menu div {
                padding: 10px 15px; font-size: 0.9rem; cursor: pointer;
            }
            .card-menu div:hover { background: #f5f5f5; }
          `}</style>

          {viewMode === 'LIST' && renderList()}
          {(viewMode === 'FORM' || viewMode === 'VIEW_ONLY') && renderForm()}
      </div>
  );
};

export default TeacherQuestionManager;