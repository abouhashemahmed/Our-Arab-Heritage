export default function ListingSkeleton({ count }) {
  return Array(count).fill().map((_, i) => (
    <div key={i} className="border rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  ));
}
