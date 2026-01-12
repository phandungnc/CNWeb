import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-overlay">
        <div className="home-content">
          <h1 className="home-title">Chào Mừng Đến Với</h1>
          <h1 className="home-title">Website Thi Trực Tuyến</h1>
          <p className="home-subtitle">Hãy đăng nhập để bắt đầu làm bài thi</p>
          <button className="home-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;