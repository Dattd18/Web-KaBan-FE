"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Calendar,
  Users,
  MessageCircle,
  Send,
  LogOut,
  Paperclip,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import {
  createBoardByManager,
  createCommentByManager,
  createTaskByManager,
  getBoardByManager,
  getCommentTaskByManager,
  getTasksByManager,
  updateStatusByManager,
} from "@/service/manager";
import { getUser } from "@/service/adminService";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";

const STATUSES = [
  { id: "todo", name: "Todo", color: "bg-orange-500" },
  { id: "progress", name: "In Progress", color: "bg-blue-500" },
  { id: "complete", name: "Done", color: "bg-green-500" },
];

export default function TaskManagement() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingComment, setIsCreatingComment] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const [boardForm, setBoardForm] = useState({
    name: "",
    description: "",
    members: [],
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignees: [],
    dueDate: "",
    status: "todo",
    attachments: [],
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    loadUsers();
    loadBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      loadTasks(selectedBoard._id);
    }
  }, [selectedBoard]);

  const loadUsers = async () => {
    try {
      const data = await getUser();
      if (data.status === "success") {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadBoards = async () => {
    try {
      const response = await getBoardByManager();
      if (response.status === "success") {
        setBoards(response.data);
        if (response.data.length > 0 && !selectedBoard) {
          setSelectedBoard(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error loading boards:", error);
    }
  };

  const loadTasks = async (boardId) => {
    try {
      setLoading(true);
      const data = await getTasksByManager(boardId);
      if (data.status === "success") {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (taskId) => {
    try {
      setLoadingComments(true);
      const data = await getCommentTaskByManager(taskId);
      if (data.status === "success") {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const createComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    setIsCreatingComment(true);
    try {
      const formData = new FormData();
      formData.append("content", newComment);

      // Thêm attachments vào FormData
      commentAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const data = await createCommentByManager(formData, selectedTask._id);

      if (data.status === "success") {
        setComments([...comments, data.data]);
        setNewComment("");
        setCommentAttachments([]);
        toast.success("Comment Succesfully");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Error creating comment");
    } finally {
      setIsCreatingComment(false); // THÊM DÒNG NÀY
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
    loadComments(task._id);
  };

  const createBoard = async () => {
    if (!boardForm.name) {
      toast.error("Please enter board name");
      return;
    }
    setIsCreatingBoard(true);
    try {
      const data = await createBoardByManager(boardForm);

      if (data.status === "success") {
        setBoards([...boards, data.data]);
        setShowBoardModal(false);
        setBoardForm({ name: "", description: "", members: [] });
        if (!selectedBoard) {
          setSelectedBoard(data.data);
        }
        toast.success("Create Boards Successfully");
      }
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Error creating board");
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const createTask = async () => {
    if (!taskForm.title) {
      toast.error("Please enter task title");
      return;
    }
    setIsCreatingTask(true);
    if (!selectedBoard) {
      toast.error("Please select a board first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", taskForm.title);
      formData.append("description", taskForm.description);
      formData.append("boardId", selectedBoard._id);
      formData.append("status", taskForm.status);
      formData.append("dueDate", taskForm.dueDate);

      // Thêm assignees
      taskForm.assignees.forEach((assigneeId) => {
        formData.append("assignees", assigneeId);
      });

      // Thêm attachments
      taskForm.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const data = await createTaskByManager(formData);

      if (data.status === "success") {
        await loadTasks(selectedBoard._id);
        setShowTaskModal(false);
        setTaskForm({
          title: "",
          description: "",
          assignees: [],
          dueDate: "",
          status: "todo",
          attachments: [],
        });
        toast.success("Create Tasks Successfully");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error creating task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }
    try {
      console.log(draggedTask._id);

      const response = await updateStatusByManager(draggedTask._id, {
        status: newStatus,
      });
      if (response.status === "success") {
        setTasks(
          tasks.map((t) =>
            t._id === draggedTask._id ? { ...t, status: newStatus } : t
          )
        );
        toast.success("Update Status Tasks Successfully");
      }
    } catch (error) {
      console.error("Error moving task:", error);
      toast.error("Update Status Fail");
    } finally {
      setDraggedTask(null);
    }
  };

  const toggleMember = (userId, isTask = false) => {
    if (isTask) {
      setTaskForm((prev) => ({
        ...prev,
        assignees: prev.assignees.includes(userId)
          ? prev.assignees.filter((id) => id !== userId)
          : [...prev.assignees, userId],
      }));
    } else {
      setBoardForm((prev) => ({
        ...prev,
        members: prev.members.includes(userId)
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId],
      }));
    }
  };

  const getTasksByStatus = (status) => {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const boardMembers = selectedBoard ? selectedBoard.members : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Task Management
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBoardModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={20} />
                New Board
              </button>
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
                Select Board ({boards.length} total)
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {boards.map((board) => (
                  <button
                    key={board._id}
                    onClick={() => setSelectedBoard(board)}
                    className={`px-5 py-3 rounded-lg whitespace-nowrap transition shadow-sm ${
                      selectedBoard?._id === board._id
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{board.name}</span>
                      <span className="text-xs opacity-75">
                        ({board.members?.length || 0} members)
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedBoard ? (
          <>
            {/* Board Info */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedBoard.name}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedBoard.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {boardMembers.length} members
                  </span>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="ml-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add Task
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
                {STATUSES.map((status) => (
                  <div
                    key={status.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status.id)}
                    className="bg-white rounded-lg shadow-md p-4 min-h-[500px]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={`w-3 h-3 rounded-full ${status.color}`}
                      ></div>
                      <h3 className="font-semibold text-gray-700">
                        {status.name}
                      </h3>
                      <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {getTasksByStatus(status.id).length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {getTasksByStatus(status.id).map((task) => (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onClick={(e) => {
                            if (!e.defaultPrevented) openTaskDetail(task);
                          }}
                          className={`bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition ${
                            draggedTask?._id === task._id ? "opacity-50" : ""
                          }`}
                        >
                          <h4 className="font-medium text-gray-800 mb-2">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            {task.dueDate && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={14} />
                                {new Date(task.dueDate).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <MessageCircle
                                size={14}
                                className="text-gray-400"
                              />
                              {task.assignees && task.assignees.length > 0 && (
                                <div className="flex items-center -space-x-2">
                                  {task.assignees
                                    .slice(0, 3)
                                    .map((assignee) => (
                                      <div
                                        key={assignee._id}
                                        className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold border-2 border-white"
                                        title={
                                          assignee.fullName || assignee.email
                                        }
                                      >
                                        {(assignee.fullName || assignee.email)
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                    ))}
                                  {task.assignees.length > 3 && (
                                    <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold border-2 border-white">
                                      +{task.assignees.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Chưa có board nào</p>
            <button
              onClick={() => setShowBoardModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Tạo Board Đầu Tiên
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create New Board</h3>
              <button onClick={() => setShowBoardModal(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter board name"
                  value={boardForm.name}
                  onChange={(e) =>
                    setBoardForm({ ...boardForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={boardForm.description}
                  onChange={(e) =>
                    setBoardForm({ ...boardForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Members
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No users available
                    </p>
                  ) : (
                    users.map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={boardForm.members.includes(user._id)}
                          onChange={() => toggleMember(user._id)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="text-sm">
                          {user.fullName} ({user.email})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={createBoard}
                disabled={isCreatingBoard}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingBoard && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isCreatingBoard ? "Creating..." : "Create Board"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Create New Task</h3>
              <button onClick={() => setShowTaskModal(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={taskForm.status}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {boardMembers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No members in this board
                    </p>
                  ) : (
                    boardMembers.map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={taskForm.assignees.includes(user._id)}
                          onChange={() => toggleMember(user._id, true)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="text-sm">
                          {user.fullName || user.email}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (max 10 files)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length + taskForm.attachments.length > 10) {
                        alert("Maximum 10 files allowed");
                        return;
                      }
                      setTaskForm({
                        ...taskForm,
                        attachments: [...taskForm.attachments, ...files],
                      });
                    }}
                    className="hidden"
                    id="task-file-input"
                  />
                  <label
                    htmlFor="task-file-input"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Paperclip size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload files
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Images, PDF, DOC, TXT (Max 10 files)
                    </span>
                  </label>
                </div>

                {taskForm.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {taskForm.attachments.map((file, index) => (
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
                            setTaskForm({
                              ...taskForm,
                              attachments: taskForm.attachments.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                          className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={createTask}
                disabled={isCreatingTask}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingTask && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isCreatingTask ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal with Comments */}
      {showTaskDetailModal && selectedTask && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {selectedTask.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  in {STATUSES.find((s) => s.id === selectedTask.status)?.name}
                </p>
              </div>
              <button onClick={() => setShowTaskDetailModal(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Task Info */}
              <div className="space-y-4">
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
              </div>

              {/* Comments Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} />
                  Comments ({comments.length})
                </h4>

                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {loadingComments ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Loading comments...
                    </p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
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
                            <p className="text-sm text-gray-700 mb-2">
                              {comment.content}
                            </p>

                            {/* Display comment attachments */}
                            {comment.attachments &&
                              comment.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {comment.attachments.map(
                                    (attachment, idx) => (
                                      <div key={idx}>
                                        {attachment.type === "image" ? (
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                          >
                                            <img
                                              src={attachment.url}
                                              alt={attachment.name}
                                              className="max-w-xs rounded border"
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-xs bg-white p-2 rounded hover:bg-gray-100 transition"
                                          >
                                            <FileText
                                              size={14}
                                              className="text-gray-500"
                                            />
                                            <span className="text-gray-700 flex-1 truncate">
                                              {attachment.name}
                                            </span>
                                            <span className="text-blue-600">
                                              View
                                            </span>
                                          </a>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form with File Upload */}
                <div className="space-y-3">
                  {commentAttachments.length > 0 && (
                    <div className="space-y-2">
                      {commentAttachments.map((file, index) => (
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
                              setCommentAttachments(
                                commentAttachments.filter((_, i) => i !== index)
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

                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length + commentAttachments.length > 10) {
                          alert("Maximum 10 files allowed");
                          return;
                        }
                        setCommentAttachments([
                          ...commentAttachments,
                          ...files,
                        ]);
                      }}
                      className="hidden"
                      id="comment-file-input"
                    />
                    <label
                      htmlFor="comment-file-input"
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer flex items-center justify-center"
                      title="Attach files"
                    >
                      <Paperclip size={18} className="text-gray-500" />
                    </label>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          createComment();
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={createComment}
                      disabled={!newComment.trim() || isCreatingComment}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isCreatingComment ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
