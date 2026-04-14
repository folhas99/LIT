import { SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="h-12 md:h-16 w-64 bg-jungle-800/60 animate-pulse rounded-sm" />
          <div className="mt-3 w-20 h-0.5 bg-jungle-700/60" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
