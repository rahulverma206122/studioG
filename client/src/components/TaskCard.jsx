import { useState } from "react";

export default function TaskCard({
  task, onToggle, onEdit, onDelete, onStar,
  onDragStart, onDragOver, onDrop, onDragEnd
}) {

  const [confirming, setConfirming] = useState(false);

  if (!task) return null;

  // check if overdue
  let isOverdue = false;
  if (task.dueDate && !task.completed) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(task.dueDate) < today) {
      isOverdue = true;
    }
  }

  // format date nicely
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`
        group bg-white border rounded-xl px-4 py-3 shadow-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-150
        ${task.completed ? "opacity-60" : ""}
        ${isOverdue ? "border-l-4 border-l-amber-400 border-gray-200" : "border-gray-200"}
        ${task.starred ? "ring-1 ring-amber-300" : ""}
        hover:shadow-md hover:border-gray-300
      `}
    >
      <div className="flex items-start gap-3">

        {/* drag handle */}
        <span className="text-gray-300 mt-0.5 cursor-grab select-none text-lg leading-none opacity-0 group-hover:opacity-100 transition">
          ⠿
        </span>

        {/* checkbox */}
        <button
          onClick={() => onToggle(task._id)}
          className={`
            mt-0.5 w-5 h-5 min-w-[20px] rounded-md border-2 flex items-center justify-center transition
            ${task.completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 hover:border-indigo-400"
            }
          `}
        >
          {task.completed && (
            <svg viewBox="0 0 12 10" fill="none" width="10" height="10">
              <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* task text */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-500 ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
            {task.title}
          </p>

          {/* description - only if exists */}
          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{task.description}</p>
          )}

          {/* due date - only if exists */}
          {task.dueDate && (
            <p className={`text-xs mt-1 ${isOverdue ? "text-amber-500 font-500" : "text-gray-400"}`}>
              {isOverdue ? "⚠ Overdue · " : "📅 "}
              {formatDate(task.dueDate)}
            </p>
          )}
        </div>

        {/* action buttons - shown on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">

          {/* star button */}
          <button
            onClick={() => onStar(task._id)}
            title={task.starred ? "Unstar" : "Mark important"}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-amber-50 transition text-base"
          >
            {task.starred ? "★" : "☆"}
          </button>

          {/* edit button */}
          <button
            onClick={() => onEdit(task)}
            title="Edit"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
          >
            <span style={{ display: "inline-block", transform: "rotate(-20deg)", fontSize: "1rem" }}>✎</span>
          </button>

          {/* delete button */}
          <button
            onClick={() => setConfirming(true)}
            title="Delete"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-400 text-gray-400 transition text-xs"
          >
            ✕
          </button>
        </div>

      </div>

      {/* delete confirmation row */}
      {confirming && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-red-400 font-500 flex-1">Delete this task?</span>
          <button
            onClick={() => { onDelete(task._id); setConfirming(false); }}
            className="text-xs px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition font-500"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      )}

    </li>
  );
}