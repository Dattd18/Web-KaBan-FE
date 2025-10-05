const { baseURL } = require("@/utils/baseURL");
export const getUser = async () => {
    const response = await baseURL.get(`/users/profile`)
    return response.data
}
export const getMyBoard = async () => {
    const response = await baseURL.get(`/boards/my-boards`)
    return response.data
}
export const getMyTasks = async (boardId) => {
    const response = await baseURL.get(`/tasks/boards/${boardId}/my-tasks`)
    return response.data
}
export const uploadResult = async (boardId, data) => {
    const response = await baseURL.put(`/tasks/${boardId}/upload-result`, data)
    return response.data
}

