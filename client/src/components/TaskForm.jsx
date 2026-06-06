export default function TaskForm() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-3">New Task</h2>

      <input
        type="text"
        placeholder="Task title"
        className="w-full border p-2 rounded mb-2"
      />

      <textarea
        placeholder="Description"
        className="w-full border p-2 rounded"
      />
    </div>
  );
}