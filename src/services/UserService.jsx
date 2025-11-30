import axiosInstance from './axiosInstance';

// Get user profile
export const getUserProfile = async () => {
  const response = await axiosInstance.get('/api/user/profile');
  return response.data.data;
};

// Update user profile (general - for admin use)
export const updateUserProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/user/profile', profileData);
  return response.data.data;
};

// Update student profile
export const updateStudentProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/student/update-info', profileData);
  return response.data.data;
};

// Update teacher profile
export const updateTeacherProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/teacher/update-info', profileData);
  return response.data.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put('/api/auth/change-password', passwordData);
  return response.data;
};

// Get user statistics (mock function - implement based on your needs)
export const getUserStats = async () => {
  // This is a mock implementation
  // Replace with actual API call when backend is ready
  return {
    examsTaken: 0,
    averageScore: 0,
    lastActive: null,
    recentExams: []
  };
};

export default {
  getUserProfile,
  updateUserProfile,
  updateStudentProfile,
  updateTeacherProfile,
  changePassword,
  getUserStats
}; 