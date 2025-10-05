const { baseURL } = require("@/utils/baseURL");
export const getReport = async () => {
    const response = await baseURL.get("/reports/overview");
    return response.data;
}
export const getBoards = async () => {
    const response = await baseURL.get("/reports/boards")
    return response.data
}
export const getBoardStats = async (boardId) => {
    const response = await baseURL.get(`/reports/boards/${boardId}`)
    return response.data
}
export const getUserStatsForBoard = async (boardId) => {
    const response = await baseURL.get(`reports/boards/${boardId}/users`)
    return response.data
}
export const getUser = async () => {
    const response = await baseURL.get("/users/admin/all-user")
    return response.data
}
export const getUserAdmin = async () => {
    const response = await baseURL.get("/users/admin/all-user1")
    return response.data
}
export const updateRole = async (id, data) => {
    const response = await baseURL.put(`users/${id}`, { role: data })
    return response.data
}