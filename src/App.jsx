import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CoursePage from "./pages/CoursePage";
import CreateCoursePage from "./pages/CreateCoursePage";
import CreateQuizPage from "./pages/CreateQuizPage";
import AssignmentPage from "./pages/AssignmentPage";
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/course/:id" element={<CoursePage />} />
                <Route path="/create-course" element={<CreateCoursePage />} />
                <Route path="/create-quiz" element={<CreateQuizPage />} />
                <Route path="/assignment/:id" element={<AssignmentPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/profile" element={<ProfilePage />} />

            </Routes>
        </Router>
    );
}

export default App;
