import { useState, useEffect } from "react";

export default function TaskForm({ onSubmit, editTask, onCancel }) {

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [titleError, setTitleError] = useState("");

  // when editTask changes - fill the form with that task's data
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      if (editTask.dueDate) {
        const formatted = new Date(editTask.dueDate).toISOString().split("T")[0];
        setDueDate(formatted);
      } else {
        setDueDate("");
      }
    } else {
      // not editing - reset everything
      setTitle("");
      setDescription("");
      setDueDate("");
      setTitleError("");
    }
  }, [editTask]);

  // called when form is submitted
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Title can't be empty");
      return;
    }

    setTitleError("");

    await onSubmit({
      title: title.trim(),
      description: description,
      dueDate: dueDate || null,
    });

    setTitle("");
    setDescription("");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

      <h2 className="text-xs font-600 text-gray-400 uppercase tracking-widest mb-5">
        {editTask ? "Edit task" : "New task"}
      </h2>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-xs font-500 text-gray-500 mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          placeholder="What needs to be done?"
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
        />
        {titleError && (
          <p className="text-xs text-red-400 mt-1">{titleError}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-xs font-500 text-gray-500 mb-1.5">Description</label>
        <textarea
          value={description}
          placeholder="Optional notes..."
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition resize-none"
        />
      </div>

      {/* Due date */}
      <div className="mb-5">
        <label className="block text-xs font-500 text-gray-500 mb-1.5">Due date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-500 py-2 rounded-lg transition"
        >
          {editTask ? "Save changes" : "Add task"}
        </button>

        {/* cancel only shows when editing */}
        {editTask && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
        )}
      </div>

    </form>
  );
}