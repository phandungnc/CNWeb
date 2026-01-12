import { useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import PrivateRoute from './routes/PrivateRoute';
import { useAuth } from './context/AuthContext';
// admin imports
import Sidebar from './components/Admin/Sidebar';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManager from './pages/admin/UserManager';
import CourseManager from './pages/admin/CourseManager';
import ClassManager from './pages/admin/ClassManager';
import { CreateAccountForm, ResetPasswordForm } from './pages/admin/AccountTools';
//student imports
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourseDetail from './pages/student/StudentCourseDetail';
import StudentClassManager from './pages/student/StudentClassManager';
import StudentExamList from './pages/student/StudentExamList';
//teacher imports
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourseDetail from './pages/teacher/TeacherCourseDetail';
import TeacherQuestionManager from './pages/teacher/TeacherQuestionManager';
import TeacherClassManager from './pages/teacher/TeacherClassManager';
import TeacherExamManager from './pages/teacher/TeacherExamManager';
import TeacherStatistics from './pages/teacher/TeacherStatistics';

// Layout chung
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* student */}
          <Route element={<PrivateRoute roles={['STUDENT']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses/:courseId" element={<StudentCourseDetail />}>
              <Route index element={<Navigate to="exams" replace />} />
              <Route path="exams" element={<StudentExamList />} />
              <Route path="class-info" element={<StudentClassManager />} />
            </Route>
            {/* <Route path="/student/exam/:examId" element={<StudentExamRoom />} /> */}
          </Route>

          {/* teacher */}
          <Route element={<PrivateRoute roles={['TEACHER']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/courses/:courseId" element={<TeacherCourseDetail />}>
              <Route index element={<Navigate to="exams" replace />} />
              <Route path="exams" element={<TeacherExamManager />} />
              <Route path="classes" element={<TeacherClassManager />} />
              <Route path="questions" element={<TeacherQuestionManager />} />
              <Route path="statistics" element={<TeacherStatistics />} />
            </Route>
          </Route>
        </Route>

        {/* admin*/}
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