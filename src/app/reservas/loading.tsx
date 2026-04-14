import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="h-12 md:h-16 w-64 bg-jungle-800/60 animate-pulse rounded-sm" />
          <div className="mt-3 w-20 h-0.5 bg-jungle-700/60" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  );
}
