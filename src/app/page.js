
"use client";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/authcontext";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin, loginEmail } from "@/service/authService";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, role } = useAuth();
  const [checking, setChecking] = useState(true);

  const router = useRouter()
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (storedToken && isAuthenticated && role) {
          // Redirect dựa trên role
          if (role === "Admin") {
            router.push("/admin/dashboard");
          } else if (role === "Manager") {
            router.push("/manager");
          } else if (role === "Member") {
            router.push("/member");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, role, router]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email && !password) {
      setEmailError("Vui lòng nhập email.");
      setPasswordError("Vui lòng nhập mật khẩu.");
      setLoading(false);
      return;
    } else if (!email) {
      setEmailError("Vui lòng nhập email.");
      setPasswordError("");
      setLoading(false);
      return;
    } else if (!password) {
      setEmailError("");
      setPasswordError("Vui lòng nhập mật khẩu.");
      setLoading(false);
      return;
    }

    try {
      console.log(email, password);
      const dataLogin = {
        email: email,
        password: password,
      };
      const result = await loginEmail(dataLogin);
      console.log(result);

      if (result.status === "sucess") {
        login(result.token); // login xong nó tự redirect
        setLoading(false);
      } else if (result.status === "fail") {
        setError(result.message);
        setLoading(false);
        return;
      } else {
        setError("Server đang bảo trì hoặc xảy ra lỗi vui lòng thử lại sau");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      const loginGoogle = await googleLogin({ idToken: response.credential });
      console.log(loginGoogle.token);

      if (loginGoogle.status === "sucess") {
        login(loginGoogle.token);
        setLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error.response?.data?.data?.message || "Đăng nhập Google thất bại"
      );
      setLoading(false);
    }

  };
  const handleGoogleLoginError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative elements */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-6">
              <Image
                src="/logo.png"
                alt="University Logo"
                width={150}
                height={50}
              />
            </div>
            <h2 className="text-3xl font-roboto font-bold text-center mb-4">
              Hệ Thống Quản Lí Công Việc
            </h2>
            <p className="text-center text-indigo-100 text-sm max-w-xs">
              Quản lý công việc hiệu quả, tối ưu năng suất làm việc của bạn
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Quản lý công việc dễ dàng</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Theo dõi tiến độ realtime</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Hợp tác nhóm hiệu quả</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 md:p-10">
            {/* Mobile Header */}
            <div className="md:hidden text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-2xl">
                  <Image
                    src="/logo.png"
                    alt="University Logo"
                    width={120}
                    height={40}
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Đăng nhập
              </h2>
            </div>

            <div className="hidden md:block mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Chào mừng trở lại!
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Đăng nhập để tiếp tục
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center animate-shake mb-4">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-3.5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      autoComplete="email"
                      className="text-black-700 appearance-none block w-full h-12 pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-black-700 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="text-black-700 appearance-none block w-full h-12 pl-10 pr-10 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-indigo-500 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 cursor-pointer"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full flex justify-center items-center h-12 px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    "Đăng nhập"
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Hoặc</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleLoginError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                  logo_alignment="left"
                />
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Hệ Thống Quản Lí Công Việc
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
