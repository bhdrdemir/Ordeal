import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="h-9 w-64 bg-zinc-100 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-48 bg-zinc-100 rounded animate-pulse" />
      </div>

      <div className="space-y-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-zinc-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center py-12 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading...
        </div>
      </div>
    </div>
  );
}
