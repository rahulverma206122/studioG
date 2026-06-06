export default function TaskCard() {
  return (
    <li className="bg-white p-4 rounded-xl shadow border">
      <h3 className="font-semibold">Sample Task</h3>

      <p className="text-gray-500 text-sm mt-1">
        This is a sample description
      </p>

      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 bg-green-500 text-white rounded">
          Done
        </button>

        <button className="px-3 py-1 bg-blue-500 text-white rounded">
          Edit
        </button>

        <button className="px-3 py-1 bg-red-500 text-white rounded">
          Delete
        </button>
      </div>
    </li>
  );
}