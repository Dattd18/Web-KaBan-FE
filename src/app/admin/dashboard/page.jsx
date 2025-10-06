"use client";
import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  FolderKanban,
  AlertCircle,
  Calendar,
  Loader,
  LogOut,
  UserCog,
  Edit2,
  X,
  Save,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authcontext";
import {
  getBoards,
  getBoardStats,
  getReport,
  getUser,
  getUserAdmin,
  getUserStatsForBoard,
  updateRole,
} from "@/service/adminService";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [boardStats, setBoardStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const ROLES = ["Member", "Admin", "Manager"];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    fetchOverview();
    fetchBoards();
    fetchUsers();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await getReport();
      setOverviewData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê");
      setLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await getBoards();
      setBoards(response.data || []);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUserAdmin();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const fetchBoardStats = async (boardId) => {
    try {
      setLoading(true);
      const response = await getBoardStats(boardId);
      setBoardStats(response.data);
      await fetchUserStatsForBoard(boardId);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải thống kê board");
      setLoading(false);
    }
  };

  const fetchUserStatsForBoard = async (boardId) => {
    try {
      const response = await getUserStatsForBoard(boardId);
      setUserStats(response.data || []);
    } catch (err) {
      console.error("Error fetching user stats:", err);
      setUserStats([]);
    }
  };

  const handleEditRole = (userId, currentRole) => {
    setEditingUserId(userId);
    setSelectedRole(currentRole);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedRole("");
  };

  const handleUpdateRole = async (userId) => {
    if (!selectedRole) {
      setError("Vui lòng chọn role");
      return;
    }

    try {
      setUpdateLoading(true);
      const response = await updateRole(userId, selectedRole);
      if (response.status === "success") {
        await fetchUsers();
        setEditingUserId(null);
        setSelectedRole("");
        setError("");
        setUpdateLoading(false);
        toast.success("Update Role Successfully");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Không thể cập nhật role");
      setUpdateLoading(false);
    }
  };

  const handleBoardChange = (e) => {
    const boardId = e.target.value;
    setSelectedBoard(boardId);
    if (boardId) {
      fetchBoardStats(boardId);
    } else {
      setBoardStats(null);
      setUserStats([]);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "Manager":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Member":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading && !overviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Quản Trị
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Thống kê và báo cáo tổng quan hệ thống
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Overview Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Board</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overviewData?.totalBoards || 0}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FolderKanban className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng Công Việc
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overviewData?.totalTasks || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn Thành</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overviewData?.completedTasks || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tỷ Lệ Hoàn Thành
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {overviewData?.completionRate?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("projects")}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "projects"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FolderKanban className="h-5 w-5" />
                <span>Quản Lý Dự Án</span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "users"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <UserCog className="h-5 w-5" />
                <span>Quản Lý User</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "projects" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Thống Kê Theo Board
              </h2>
              <select
                value={selectedBoard}
                onChange={handleBoardChange}
                className="text-gray-900 w-full md:w-96 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">-- Chọn Board --</option>
                {boards.map((board) => (
                  <option key={board._id} value={board._id}>
                    {board.title || board.name}
                  </option>
                ))}
              </select>
            </div>

            {loading && selectedBoard && (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            )}

            {!loading && boardStats && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Tổng Công Việc
                      </span>
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {boardStats.totalTasks}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-900">
                        To Do
                      </span>
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-900">
                      {boardStats.todoTasks}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-900">
                        In Progress
                      </span>
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">
                      {boardStats.inProgressTasks}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">
                        Done
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {boardStats.completedTasks}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Tiến Độ Hoàn Thành
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {boardStats.completionRate?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${boardStats.completionRate}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Chưa Bắt Đầu</p>
                      <p className="text-sm font-semibold text-yellow-600">
                        {(
                          (boardStats.todoTasks / boardStats.totalTasks) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Đang Thực Hiện</p>
                      <p className="text-sm font-semibold text-orange-600">
                        {(
                          (boardStats.inProgressTasks / boardStats.totalTasks) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Hoàn Thành</p>
                      <p className="text-sm font-semibold text-green-600">
                        {boardStats.completionRate?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && userStats.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Thống Kê Theo Thành Viên
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Thành Viên
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tổng Task
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          To Do
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          In Progress
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Done
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Quá Hạn
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tỷ Lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userStats.map((user) => (
                        <tr
                          key={user.userId}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.userName?.charAt(0).toUpperCase() || "U"}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.userName || "Unknown User"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.userEmail || ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {user.totalTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {user.todoTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {user.inProgressTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {user.completedTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.overdueTasks > 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.overdueTasks}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-24">
                                <div className="flex items-center">
                                  <span className="text-xs font-semibold text-gray-700 mr-2">
                                    {user.completionRate}%
                                  </span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                      style={{
                                        width: `${user.completionRate}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                    <p className="text-xs text-indigo-900 font-medium mb-1">
                      Tổng Thành Viên
                    </p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {userStats.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-xs text-green-900 font-medium mb-1">
                      Tổng Task Hoàn Thành
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {userStats.reduce((sum, u) => sum + u.completedTasks, 0)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs text-orange-900 font-medium mb-1">
                      Đang Thực Hiện
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {userStats.reduce((sum, u) => sum + u.inProgressTasks, 0)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <p className="text-xs text-red-900 font-medium mb-1">
                      Tổng Quá Hạn
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {userStats.reduce((sum, u) => sum + u.overdueTasks, 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loading && boardStats && userStats.length === 0 && (
              <div className="mt-8 text-center py-8 bg-gray-50 rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">
                  Chưa có thành viên nào trong board này
                </p>
              </div>
            )}

            {!loading && !boardStats && selectedBoard && (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Không có dữ liệu cho board này</p>
              </div>
            )}

            {!selectedBoard && (
              <div className="text-center py-12 text-gray-500">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Vui lòng chọn một board để xem thống kê chi tiết</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Quản Lý Người Dùng
              </h2>
              <p className="text-sm text-gray-600">
                Quản lý quyền và vai trò của người dùng trong hệ thống
              </p>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Chưa có người dùng nào trong hệ thống</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Người Dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vai Trò
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.fullName?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {user.fullName || "Unknown User"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {editingUserId === user._id ? (
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="text-gray-900 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                            >
                              <option value="">-- Chọn Role --</option>
                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {user.role || "Member"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {editingUserId === user._id ? (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleUpdateRole(user._id)}
                                disabled={updateLoading}
                                className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                {updateLoading ? (
                                  <Loader className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="h-3 w-3 mr-1" />
                                    Lưu
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updateLoading}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleEditRole(user._id, user.role)
                              }
                              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Chỉnh sửa
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* User Statistics Summary */}
            {users.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Tổng Người Dùng
                    </span>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {users.length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">
                      Quản Lý
                    </span>
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {users.filter((u) => u.role === "Manager").length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-900">
                      Admin
                    </span>
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {users.filter((u) => u.role === "Admin").length}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
