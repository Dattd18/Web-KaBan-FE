const { baseURL } = require("@/utils/baseURL");

export const getBoardByManager = async () => {
    const response = await baseURL.get("/boards/manager");
    return response.data;
}
export const createBoardByManager = async (data) => {
    const response = await baseURL.post("/boards/create", data);
    return response.data;
}
export const createTaskByManager = async (data) => {
    const response = await baseURL.post("/tasks/create", data);
    return response.data;
}
export const getCommentTaskByManager = async (id) => {
    const response = await baseURL.get(`/comments/${id}`);
    return response.data;
}

export const getTasksByManager = async (boardId) => {
    const response = await baseURL.get(`/tasks/boards/${boardId}/tasks`);
    return response.data;
}
export const createCommentByManager = async (data, id) => {
    const response = await baseURL.post(`comments/create/${id}`, data);
    return response.data;
}
export const updateStatusByManager = async (id, data) => {
    const response = await baseURL.put(`tasks/${id}/move`, data);
    return response.data;
}