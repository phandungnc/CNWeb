import { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import PrivateRoute from './routes/PrivateRoute';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Admin/Sidebar'; 

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManager from './pages/admin/UserManager';
import CourseManager from './pages/admin/CourseManager';
import ClassManager from './pages/admin/ClassManager';
import { CreateAccountForm, ResetPasswordForm } from './pages/admin/AccountTools'; 

// Layout dùng chung cho Student, Teacher và các trang cá nhân
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mặc định đóng
  const { user } = useAuth(); 

  return (
    <>
      {/* Truyền hàm toggle để menu hđ */}
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {/* Chỉ render Sidebar ở MainLayout nếu là ADMIN */}
      {user?.roleName === 'ADMIN' && (
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} />
      )}

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

      {/* route cha ktra đăng nhập */}
      <Route element={<PrivateRoute />}>
        
        {/* Chung cho user*/}
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          <Route element={<PrivateRoute roles={['STUDENT']} />}>
            <Route path="/student/*" element={<StudentDashboard />} />
          </Route>

          <Route element={<PrivateRoute roles={['TEACHER']} />}>
            <Route path="/teacher/*" element={<TeacherDashboard />} />
          </Route>
        </Route>

        {/* ADMIN*/}
        <Route element={<PrivateRoute roles={['ADMIN']} checkLayout={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManager />} />
            <Route path="courses" element={<CourseManager />} />
            <Route path="classes" element={<ClassManager />} />
            <Route path="create-account" element={<CreateAccountForm />} />
            <Route path="reset-password" element={<ResetPasswordForm />} />
          </Route>
        </Route>

      </Route>
    </Routes>
  );
}

export default App;