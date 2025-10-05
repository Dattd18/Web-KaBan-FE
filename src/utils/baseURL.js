import axios from "axios";
console.log(process.env.NEXT_PUBLIC_API_URL);

export const baseURL = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_PREFIX}`,
    // handle mọi lỗi trả về từ server

    validateStatus: () => true,
});
// mỗi khi req cần thêm token thì đã config sẵn không cần phải đưa vào thêm
baseURL.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem("token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);