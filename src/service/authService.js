const { baseURL } = require("@/utils/baseURL");

export const loginEmail = async (data) => {
    const response = await baseURL.post("/auth/login", data);
    return response.data;
}
export const register = async (data) => {
    const response = await baseURL.post("/auth/register", data);
    return response.data;
}
export const googleLogin = async (data) => {
    const response = await baseURL.post("/auth/login-google", data);
    return response.data;
}
