"use client";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/authcontext";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin, register } from "@/service/authService";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setLoading(true);

    // Validate form
    let hasError = false;

    if (!fullName) {
      setFullNameError("Vui lòng nhập họ tên.");
      hasError = true;
    }

    if (!email) {
      setEmailError("Vui lòng nhập email.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp.");
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const dataRegister = {
        fullname: fullName,
        email: email,
        password: password,
      };

      const result = await register(dataRegister);
      console.log(result);

      if (result.status === "success") {
        // Auto login after register
        toast.success("Đăng ký thành công 🎉");
        setTimeout(() => {
          router.push("/");
        }, 1500);
        setLoading(false);
      } else if (result.status === "fail") {
        setError(result.data.message);
        setLoading(false);
      } else {
        setError("Server đang bảo trì hoặc xảy ra lỗi vui lòng thử lại sau");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      const loginGoogle = await googleLogin({ idToken: response.credential });
      console.log(loginGoogle);

      if (loginGoogle.status === 200) {
        login(loginGoogle.data.data || loginGoogle.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error.response?.data?.data?.message || "Đăng nhập Google thất bại"
      );
      setLoading(false);
    }

    console.log(loginGoogle);
  };

  const handleGoogleLoginError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

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
              Tham gia cùng chúng tôi để quản lý công việc hiệu quả hơn
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Miễn phí đăng ký</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Giao diện thân thiện</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Bảo mật tuyệt đối</span>
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
                Đăng ký
              </h2>
            </div>

            <div className="hidden md:block mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Tạo tài khoản mới
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Điền thông tin để bắt đầu
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
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Họ và tên
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      className="appearance-none block w-full h-12 pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  {fullNameError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fullNameError}
                    </p>
                  )}
                </div>

                {/* Email */}
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
                      type="email"
                      autoComplete="email"
                      className="appearance-none block w-full h-12 pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="email@university.edu.vn"
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

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="appearance-none block w-full h-12 pl-10 pr-10 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
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

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="appearance-none block w-full h-12 pl-10 pr-10 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-indigo-500 focus:outline-none transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {confirmPasswordError}
                    </p>
                  )}
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
                    "Đăng ký"
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
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                  logo_alignment="left"
                />
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center pt-3 border-t border-gray-200 mt-4">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Đăng nhập ngay
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
