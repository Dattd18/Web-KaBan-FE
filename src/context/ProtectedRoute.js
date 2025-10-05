import { useEffect } from "react";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
    allowedRoles,
    children,
}) {
    const { isAuthenticated, role } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            // Nếu chưa login -> redirect login
            router.push("/");
            return;
        }

        if (role && !allowedRoles.includes(role)) {
            // Nếu đã login nhưng sai role -> redirect về trang role tương ứng
            router.push(`/${role}`);
        }
    }, [isAuthenticated, role, router, allowedRoles]);

    // Tránh render nội dung khi chưa xác định xong quyền truy cập
    if (!isAuthenticated || (role && !allowedRoles.includes(role))) {
        return null;
    }

    return <>{children}</>;
}