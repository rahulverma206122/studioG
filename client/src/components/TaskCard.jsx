import { useState } from "react";

export default function TaskCard({  
  task, onToggle, onEdit, onDelete, onStar,
  onDragStart, onDragOver, onDrop, onDragEnd
}) {

  const [confirming, setConfirming] = useState(false);

  if (!task) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let isOverdue = false;
  let isDueToday = false;

  if (task.dueDate && !task.completed) {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
      isOverdue = true;
    } else if (due.getTime() === today.getTime()) {
      isDueToday = true;
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirming(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-80 mx-4 z-10">
            <div className="text-center">

              <div className="text-3xl mb-3">🗑️</div>

              <h3 className="text-sm font-600 text-gray-800 mb-1">
                Delete this task?
              </h3>

              <p className="text-xs text-gray-400 mb-5">
                "{task.title}" will be permanently deleted. This cannot be undone.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete(task._id); setConfirming(false); }}
                  className="flex-1 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition font-500"
                >
                  Yes, Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <li
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={`
          group bg-white border rounded-xl px-4 py-3 shadow-sm
          cursor-grab active:cursor-grabbing transition-all duration-150
          ${task.completed ? "opacity-60" : ""}
          ${isOverdue ? "border-l-4 border-l-red-400 border-gray-200" : "border-gray-200"}
          ${task.starred ? "ring-1 ring-amber-300" : ""}
          hover:shadow-md hover:border-gray-300
        `}
      >
        <div className="flex items-start gap-3">

          <button
            onClick={() => onToggle(task._id)}
            className={`
              mt-0.5 w-5 h-5 min-w-[20px] rounded-md border-2 flex items-center justify-center transition
              ${task.completed
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-gray-400 hover:border-indigo-600"
              }
            `}
          >
            {task.completed && (
                <span className="text-xs font-bold">
                  ✓
                </span>
              )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-500 ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
              {task.title}
            </p>

            {task.description && (
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{task.description}</p>
            )}

            {task.dueDate && (
              <p className={`text-xs mt-1 font-500 ${
                isOverdue ? "text-red-500" :
                isDueToday ? "text-red-400" :
                "text-gray-400 font-400"
              }`}>
                {isOverdue ? " Overdue " : isDueToday ? " Last day today " : "Due on "}
                {formatDate(task.dueDate)}
              </p>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => onStar(task._id)}
              title={task.starred ? "Unstar" : "Mark important"}
              className={`w-9 h-9 flex items-center justify-center rounded-md hover:bg-amber-50 transition text-base ${task.starred ? "text-amber-400" : "text-gray-300"}`}
            >
              {task.starred ? "★" : "☆"}
            </button>

            <button
              onClick={() => onEdit(task)}
              title="Edit"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
            >
              ✎
            </button>

            <button
              onClick={() => setConfirming(true)}
              title="Delete"
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-400 text-gray-400 transition text-xs"
            >
              ✕
            </button>
          </div>

        </div>
      </li>
    </>
  );
}