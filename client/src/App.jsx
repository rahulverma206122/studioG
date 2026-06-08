import { useState, useEffect, useRef } from "react";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";

const API = "https://studiog.onrender.com/api/tasks";

export default function App() {

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0 });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // drag and drop tracking
  const dragIndex = useRef(null);
  const dragOverIndex = useRef(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [filter, search]);

  async function fetchTasks() {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      if (search) params.append("search", search);

      const res = await fetch(`${API}?${params}`);
      const data = await res.json();

      // sort by the "order" field saved in DB so drag-drop position persists on refresh
      const sorted = (data.tasks || []).sort((a, b) => a.order - b.order);

      setTasks(sorted);
      setStats(data.stats);
      setError("");
    } catch {
      setError("Can't reach server. Is backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(formData) {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    fetchTasks();
  }

  async function handleUpdate(formData) {
    await fetch(`${API}/${editTask._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setEditTask(null);
    fetchTasks();
  }

  async function handleToggle(id) {
    await fetch(`${API}/${id}/toggle`, { method: "PATCH" });
    fetchTasks();
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  async function handleStar(id) {
    const task = tasks.find((t) => t._id === id);
    await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: !task.starred }),
    });
    fetchTasks();
  }

  // ── Drag and Drop ────────────────────────────────────────
  function handleDragStart(index) {
    dragIndex.current = index;
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    dragOverIndex.current = index;
  }

  async function handleDrop() {
    // reorder locally first so UI feels instant
    const newTasks = [...tasks];
    const draggedItem = newTasks.splice(dragIndex.current, 1)[0];
    newTasks.splice(dragOverIndex.current, 0, draggedItem);
    setTasks(newTasks);

    // save the new order to backend
    // backend stores an "order" number on each task
    // so when we fetch next time, we sort by order and get same position
    const orderedIds = newTasks.map((t) => t._id);
    await fetch(`${API}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });

    dragIndex.current = null;
    dragOverIndex.current = null;
  }

  function handleDragEnd() {
    dragIndex.current = null;
    dragOverIndex.current = null;
  }

  const activeCount = stats.active || 0;
  const completedCount = stats.completed || 0;
  const total = activeCount + completedCount;
  const starredCount = tasks.filter((t) => t.starred).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-500 to-blue-300 px-6 py-3">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-600 text-white tracking-tight">My Tasks</h1>
          <p className="text-indigo-200 text-sm mt-1">Stay organised. Get things done.</p>

          {total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-indigo-100 mb-2">
                <span>{progressPercent}% complete</span>
                <span>{completedCount} of {total} tasks done</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            ⚠ {error}
          </div>
        )}

        {/* Summary boxes */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-500 mb-2">Total</p>
            <p className="text-3xl font-700 text-gray-800">{total}</p>
            <p className="text-xs text-gray-400 mt-1">all tasks</p>
          </div>
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
            <p className="text-xs text-indigo-400 uppercase tracking-wider font-500 mb-2">Active</p>
            <p className="text-3xl font-700 text-indigo-600">{activeCount}</p>
            <p className="text-xs text-gray-400 mt-1">remaining</p>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
            <p className="text-xs text-emerald-500 uppercase tracking-wider font-500 mb-2">Done</p>
            <p className="text-3xl font-700 text-emerald-600">{completedCount}</p>
            <p className="text-xs text-gray-400 mt-1">completed</p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">

          {/* Left: form */}
          <div className="sticky top-6">
            <TaskForm
              onSubmit={editTask ? handleUpdate : handleCreate}
              editTask={editTask}
              onCancel={() => setEditTask(null)}
            />
          </div>

          {/* Right: list */}
          <div>

            {/* search + filters */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none select-none">⌕</span>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm focus:outline-none focus:border-indigo-400 transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {["all", "active", "completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                      px-4 py-1.5 rounded-full text-xs font-500 capitalize border transition
                      ${filter === f
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }
                    `}
                  >
                    {f}
                  </button>
                ))}

                <button
                  onClick={() => setFilter(filter === "starred" ? "all" : "starred")}
                  className={`
                    ml-auto px-4 py-1.5 rounded-full text-xs font-500 border transition
                    ${filter === "starred"
                      ? "bg-amber-400 text-white border-amber-400"
                      : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"
                    }
                  `}
                >
                  ★ Starred {starredCount > 0 && `(${starredCount})`}
                </button>
              </div>
            </div>

            {/* loading */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
              </div>

            ) : tasks.filter(t => filter === "starred" ? t.starred : true).length === 0 ? (
              <div className="text-center py-14 border border-dashed border-gray-200 rounded-2xl bg-white">
                <div className="text-3xl mb-3">
                  {filter === "completed" ? "🎉" : filter === "starred" ? "★" : search ? "🔍" : "📋"}
                </div>
                <p className="text-sm text-gray-500 font-500">
                  {search ? `No results for "${search}"` :
                   filter === "completed" ? "Nothing completed yet" :
                   filter === "starred" ? "No starred tasks" :
                   "No tasks yet"}
                </p>
                {filter === "all" && !search && (
                  <p className="text-xs text-gray-400 mt-1">Add your first task using the form</p>
                )}
              </div>

            ) : (
              <ul className="flex flex-col gap-2">
                {tasks
                  .filter((t) => filter === "starred" ? t.starred : true)
                  .map((task, index) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={setEditTask}
                      onDelete={handleDelete}
                      onStar={handleStar}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
              </ul>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}