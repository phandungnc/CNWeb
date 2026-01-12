import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile'; 
import ChangePassword from './pages/ChangePassword';
import PrivateRoute from './routes/PrivateRoute'; 
import { useAuth } from './context/AuthContext';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="main-content" style={{ padding: '20px' }}>
        <Outlet /> 
      </div>
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          
          <Route element={<PrivateRoute roles={['STUDENT']} />}>
             <Route path="/student/*" element={<StudentDashboard />} />
          </Route>

          <Route element={<PrivateRoute roles={['TEACHER']} />}>
             <Route path="/teacher/*" element={<TeacherDashboard />} />
          </Route>

          <Route element={<PrivateRoute roles={['ADMIN']} />}>
             <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

        </Route>
      </Route>

    </Routes>
  );
}

export default App;