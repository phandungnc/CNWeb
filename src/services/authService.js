import axiosInstance from "../utils/axiosConfig";

const authService = {
    // API Login
    login: async (credentials) => {
        const response = await axiosInstance.post('/auth/login', credentials);
        return response.data; 
    },

    // API Đổi mật khẩu
    changePassword: async (data) => {
        const response = await axiosInstance.put('/auth/change-password', data);
        return response.data;
    }
};

export default authService;