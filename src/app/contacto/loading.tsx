import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <div className="h-12 md:h-16 w-48 bg-jungle-800/60 animate-pulse rounded-sm" />
          <div className="mt-3 w-20 h-0.5 bg-jungle-700/60" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <div className="space-y-3 mt-8">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
