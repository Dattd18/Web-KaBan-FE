"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [role, setRole] = useState(null);
    const router = useRouter();

    // Khi load lại trang, kiểm tra token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setRole(decoded.role);
            setIsAuthenticated(true);
        }
        setIsInitializing(false); // Đã kiểm tra xong
    }, []);

    const login = (token) => {
        const decoded = jwtDecode(token);
        console.log(decoded);
        localStorage.setItem("userId", decoded._id);
        if (decoded.role == "Admin") {
            router.push("/admin/dashboard");
        } else if (decoded.role == "Manager") {
            router.push("/manager");
        } else if (decoded.role == "Member") {
            router.push("/member");
        }
        setRole(decoded.role);
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setRole(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, role }}>
            {!isInitializing && children} {/* Chỉ render khi context sẵn sàng */}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};