import axiosInstance from "../utils/axiosConfig";

const studentService = {
    // Lấy danh sách khóa học
    getMyCourses: async (keyword = '') => {
        const response = await axiosInstance.get(`/student/courses`, {
            params: { keyword }
        });
        return response.data;
    },

    // Lấy chi tiết lớp học
    getClassDetail: async (courseId) => {
        const response = await axiosInstance.get(`/student/classes/details`, {
            params: { courseId }
        });
        return response.data;
    },

    //lấy danh sách đề thi của môn học
    getExamsByCourse: async (courseId) => {
        const response = await axiosInstance.get(`/student/exams`, {
            params: { courseId }
        });
        return response.data;
    },

    // bắt đầu làm bài 
    startExam: async (examId) => {
        const response = await axiosInstance.post(`/student/exams/${examId}/start`);
        return response.data; // { submissionId, durationMinutes, endTime }
    },

    //Lấy nội dung đề thi 
    getExamContent: async (examId) => {
        const response = await axiosInstance.get(`/student/exams/${examId}/content`);
        return response.data; // List câu hỏi
    },

    // Gửi đáp án từng câu 
    submitAnswer: async (payload) => {
        const response = await axiosInstance.post(`/student/exams/submit-answer`, payload);
        return response.data;
    },

    //Nộp bài 
    finishExam: async (submissionId) => {
        const response = await axiosInstance.post(`/student/exams/${submissionId}/finish`);
        return response.data;
    },

    //Báo cáo vi phạm
    reportViolation: async (submissionId) => {
        const response = await axiosInstance.post(`/student/exams/${submissionId}/report-violation`);
        return response.data;
    },

    //Xem kq bài làm
    getExamHistory: async (examId) => {
        const response = await axiosInstance.get(`/student/exams/${examId}/history`);
        return response.data;
    }
};

export default studentService;