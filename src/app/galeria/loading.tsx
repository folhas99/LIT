import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="h-12 md:h-16 w-48 bg-jungle-800/60 animate-pulse rounded-sm" />
          <div className="mt-3 w-20 h-0.5 bg-jungle-700/60" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    </div>
  );
}
