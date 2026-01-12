import axiosInstance from "../utils/axiosConfig";

const userService = {
    // GET /api/users/profile
    getMyProfile: async () => {
        const response = await axiosInstance.get('/users/profile');
        return response.data; // Trả về UserResponseDTO
    },

    // PUT /api/users/profile
    updateProfile: async (data) => {
        const response = await axiosInstance.put('/users/profile', data);
        return response.data;
    }
};

export default userService;