import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

export default function ProductActions({ product, onEdit, onDelete }) {
  return (
    <div className="relative group">
      <button 
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        aria-label="Product actions"
      >
        <EllipsisHorizontalIcon className="h-5 w-5" />
      </button>
      
      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
