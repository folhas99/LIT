import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="h-12 md:h-16 w-48 bg-jungle-800/60 animate-pulse rounded-sm" />
          <div className="mt-3 w-20 h-0.5 bg-jungle-700/60" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <div className="h-8" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    </div>
  );
}
