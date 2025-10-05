"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MessageCircle,
  Send,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  FileText,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import {
  getMyBoard,
  getMyTasks,
  getUser,
  uploadResult,
} from "@/service/member";
import toast, { Toaster } from "react-hot-toast";
import {
  getCommentTaskByManager,
  getTasksByManager,
  updateStatusByManager,
} from "@/service/manager";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authcontext";

const STATUSES = [
  { id: "todo", name: "Todo", color: "bg-orange-500", icon: AlertCircle },
  { id: "progress", name: "In Progress", color: "bg-blue-500", icon: Clock },
  { id: "complete", name: "Done", color: "bg-green-500", icon: CheckCircle },
];

export default function MemberDashboard() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("my-tasks");
  const [currentUser, setCurrentUser] = useState(null);
  const [resultFiles, setResultFiles] = useState([]);
  const [uploadingResult, setUploadingResult] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://localhost:3001";

  useEffect(() => {
    loadCurrentUser();
    loadMyBoards();
    const websocket = new WebSocket(WS_URL);
    websocket.onopen = () => {
      console.log("Connected to WebSocket");
    };
    websocket.onmessage = (message) => {
      try {
        const userId = localStorage.getItem("userId");
        const data = JSON.parse(message.data);
        const { type, payload } = data;

        console.log(data);
        const isAssignedToMe = payload?.assignees?.some(
          (assigneeId) => assigneeId._id === userId
        );
        console.log(isAssignedToMe);

        if (isAssignedToMe) {
          if (type === "TASK_UPDATED") {
            if (activeView === "my-tasks") {
              setMyTasks((prevTasks) =>
                prevTasks.map((t) => (t._id === payload._id ? payload : t))
              );
              toast.success(`Task "${payload.title}" đã được cập nhật!`);
            } else {
              setAllTasks((prevTasks) =>
                prevTasks.map((t) => (t._id === payload._id ? payload : t))
              );
            }
          }
          if (type === "TASK_CREATED") {
            if (activeView === "my-tasks") {
              setMyTasks((prevTasks) => [...prevTasks, payload]);
              toast.success(`Task mới "${payload.title}" đã được tạo! 🎉`);
            } else {
              setAllTasks((prevTasks) => [...prevTasks, payload]);
            }
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    websocket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (selectedBoard && currentUser) {
      if (activeView === "my-tasks") {
        loadMyTasks(selectedBoard._id);
      } else {
        loadAllTasks(selectedBoard._id);
      }
    }
  }, [selectedBoard, activeView, currentUser]);

  const loadCurrentUser = async () => {
    try {
      const data = await getUser();
      if (data.status === "success") {
        setCurrentUser(data.data.result);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadMyBoards = async () => {
    try {
      const data = await getMyBoard();
      if (data.status === "success") {
        setBoards(data.data);
        if (data.data.length > 0) {
          setSelectedBoard(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading boards:", error);
    }
  };

  const loadMyTasks = async (boardId) => {
    try {
      setLoading(true);
      const data = await getMyTasks(boardId);
      if (data.status === "success") {
        setMyTasks(data.data);
      }
    } catch (error) {
      console.error("Error loading my tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllTasks = async (boardId) => {
    try {
      setLoading(true);
      const data = await getTasksByManager(boardId);
      if (data.status === "success") {
        setAllTasks(data.data);
      }
    } catch (error) {
      console.error("Error loading all tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (taskId) => {
    try {
      const data = await getCommentTaskByManager(taskId);
      if (data.status === "success") {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    }
  };

  const createComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    try {
      const data = await createComment(selectedTask._id, {
        content: newComment,
      });
      if (data.status === "success") {
        setComments([...comments, data.data]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const data = await updateStatusByManager(taskId, newStatus);
      if (data.status === "success") {
        if (activeView === "my-tasks") {
          setMyTasks(
            myTasks.map((t) =>
              t._id === taskId ? { ...t, status: newStatus } : t
            )
          );
        } else {
          setAllTasks(
            allTasks.map((t) =>
              t._id === taskId ? { ...t, status: newStatus } : t
            )
          );
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setResultFiles([]);
    loadComments(task._id);
  };

  const handleResultFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setResultFiles([...resultFiles, ...files]);
  };

  const handleUploadResult = async () => {
    if (!selectedTask || resultFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file");
      return;
    }

    try {
      setUploadingResult(true);
      const formData = new FormData();
      resultFiles.forEach((file) => {
        formData.append("attachments", file);
      });

      const data = await uploadResult(selectedTask._id, formData);

      if (data.status === "success") {
        toast.success("Upload kết quả thành công!");
        setResultFiles([]);

        if (activeView === "my-tasks") {
          setMyTasks(
            myTasks.map((t) => (t._id === selectedTask._id ? data.data : t))
          );
        } else {
          setAllTasks(
            allTasks.map((t) => (t._id === selectedTask._id ? data.data : t))
          );
        }
        setSelectedTask(data.data);
      }
    } catch (error) {
      console.error("Error uploading result:", error);
      toast.error("Upload thất bại!");
    } finally {
      setUploadingResult(false);
    }
  };

  const getTasksByStatus = (status) => {
    const tasks = activeView === "my-tasks" ? myTasks : allTasks;
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const getTaskStats = () => {
    const tasks = myTasks;
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      progress: tasks.filter((t) => t.status === "progress").length,
      complete: tasks.filter((t) => t.status === "complete").length,
    };
  };

  const stats = getTaskStats();
  console.log(currentUser);

  const isMyTask = (task) => {
    return task.assignees?.some((a) => a._id === currentUser?._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Workspace</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {currentUser?.fullName || "Member"}!
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-orange-50 px-4 py-2 rounded-lg">
                <p className="text-xs text-orange-600 font-medium">Todo</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.todo}
                </p>
              </div>
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.progress}
                </p>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Done</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.complete}
                </p>
              </div>
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

          {/* Board Selector */}
          {boards.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                My Boards ({boards.length})
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {boards.map((board) => (
                  <button
                    key={board._id}
                    onClick={() => setSelectedBoard(board)}
                    className={`px-5 py-3 rounded-lg whitespace-nowrap transition shadow-sm ${
                      selectedBoard?._id === board._id
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{board.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedBoard ? (
          <>
            {/* View Toggle */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedBoard.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveView("my-tasks")}
                    className={`px-4 py-2 rounded-lg transition ${
                      activeView === "my-tasks"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    My Tasks
                  </button>
                  <button
                    onClick={() => setActiveView("all-tasks")}
                    className={`px-4 py-2 rounded-lg transition ${
                      activeView === "all-tasks"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Tasks
                  </button>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">Loading tasks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATUSES.map((status) => {
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={status.id}
                      className="bg-white rounded-lg shadow-md p-4 min-h-[500px]"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-3 h-3 rounded-full ${status.color}`}
                        ></div>
                        <StatusIcon size={16} className="text-gray-600" />
                        <h3 className="font-semibold text-gray-700">
                          {status.name}
                        </h3>
                        <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {getTasksByStatus(status.id).length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {getTasksByStatus(status.id).map((task) => {
                          const isAssignedToMe = isMyTask(task);
                          return (
                            <div
                              key={task._id}
                              onClick={() => openTaskDetail(task)}
                              className={`rounded-lg p-4 border-2 cursor-pointer hover:shadow-lg transition ${
                                isAssignedToMe
                                  ? "bg-purple-50 border-purple-200 hover:border-purple-400"
                                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-800 flex-1">
                                  {task.title}
                                </h4>
                                {isAssignedToMe && (
                                  <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                                    Mine
                                  </span>
                                )}
                              </div>

                              {task.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    {new Date(task.dueDate).toLocaleDateString(
                                      "vi-VN"
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-2">
                                  <MessageCircle
                                    size={12}
                                    className="text-gray-400"
                                  />
                                  {task.assignees &&
                                    task.assignees.length > 0 && (
                                      <div className="flex items-center -space-x-1">
                                        {task.assignees
                                          .slice(0, 3)
                                          .map((assignee) => (
                                            <div
                                              key={assignee._id}
                                              className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                                              title={
                                                assignee.fullName ||
                                                assignee.email
                                              }
                                            >
                                              {(
                                                assignee.fullName ||
                                                assignee.email
                                              )
                                                .charAt(0)
                                                .toUpperCase()}
                                            </div>
                                          ))}
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Quick Status Update for My Tasks */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              You haven't been assigned to any boards yet.
            </p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {selectedTask.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      STATUSES.find((s) => s.id === selectedTask.status)?.color
                    } text-white`}
                  >
                    {STATUSES.find((s) => s.id === selectedTask.status)?.name}
                  </span>
                  {isMyTask(selectedTask) && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-600 text-white">
                      Assigned to me
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedTask.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.dueDate && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-1">
                      Due Date
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={16} />
                      {new Date(selectedTask.dueDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                )}

                {selectedTask.assignees &&
                  selectedTask.assignees.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">
                        Assignees
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedTask.assignees.map((assignee) => (
                          <span
                            key={assignee._id}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                          >
                            {assignee.fullName || assignee.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Task Attachments */}
              {selectedTask.attachments &&
                selectedTask.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Task Attachments
                    </h4>
                    <div className="space-y-2">
                      {selectedTask.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          {attachment.type === "image" ? (
                            <ImageIcon size={16} className="text-blue-500" />
                          ) : (
                            <FileText size={16} className="text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 flex-1 truncate">
                            {attachment.name}
                          </span>
                          <span className="text-xs text-blue-600">
                            Download
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              {selectedTask.result &&
                selectedTask.result.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Task Result
                    </h4>
                    <div className="space-y-2">
                      {selectedTask.result.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                        >
                          {attachment.type === "image" ? (
                            <ImageIcon size={16} className="text-blue-500" />
                          ) : (
                            <FileText size={16} className="text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 flex-1 truncate">
                            {attachment.name}
                          </span>
                          <span className="text-xs text-blue-600">
                            Download
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Upload Result Section - CODE UI MỚI */}
              {isMyTask(selectedTask) && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Upload size={18} />
                    Upload Kết Quả
                  </h4>

                  {/* File Input */}
                  <div className="mb-3">
                    <label className="flex items-center justify-center w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-lg border-2 border-dashed border-purple-300 cursor-pointer hover:bg-purple-100 transition">
                      <Upload size={20} className="mr-2" />
                      <span className="text-sm font-medium">
                        Chọn file kết quả
                      </span>
                      <input
                        type="file"
                        multiple
                        onChange={handleResultFileSelect}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      />
                    </label>
                  </div>

                  {/* Selected Files List */}
                  {resultFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {resultFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {file.type?.startsWith("image/") ? (
                              <ImageIcon
                                size={16}
                                className="text-blue-500 flex-shrink-0"
                              />
                            ) : (
                              <FileText
                                size={16}
                                className="text-gray-500 flex-shrink-0"
                              />
                            )}
                            <span className="text-sm text-gray-700 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setResultFiles(
                                resultFiles.filter((_, i) => i !== index)
                              );
                            }}
                            className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {resultFiles.length > 0 && (
                    <button
                      onClick={handleUploadResult}
                      disabled={uploadingResult}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploadingResult ? (
                        <>
                          <Clock size={18} className="animate-spin" />
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Kết Quả ({resultFiles.length} file)
                        </>
                      )}
                    </button>
                  )}

                  {/* Uploaded Results Display */}
                  {selectedTask.results && selectedTask.results.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">
                        Kết quả đã upload ({selectedTask.results.length})
                      </h5>
                      <div className="space-y-2">
                        {selectedTask.results.map((result, idx) => (
                          <a
                            key={idx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition border border-green-200"
                          >
                            {result.type === "image" ? (
                              <ImageIcon size={16} className="text-green-600" />
                            ) : (
                              <FileText size={16} className="text-green-600" />
                            )}
                            <span className="text-sm text-gray-700 flex-1 truncate">
                              {result.name}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              Xem
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comments */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Comments ({comments.length})
                </h4>

                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Start the conversation!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {comment.author?.fullName?.charAt(0) ||
                              comment.author?.email?.charAt(0) ||
                              "?"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-800">
                                {comment.author?.fullName ||
                                  comment.author?.email ||
                                  "Unknown"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        createComment();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={createComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
