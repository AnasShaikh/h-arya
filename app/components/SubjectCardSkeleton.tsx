export default function SubjectCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-100" />
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded-full w-3/4" />
              <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
            </div>
            <div className="w-14 h-8 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
