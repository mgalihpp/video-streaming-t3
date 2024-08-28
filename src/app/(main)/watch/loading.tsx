import { VideoLoading } from "./_components/VideoLoading";

// this fix the issue not getting re render when searchParams already changed -_-
export default function Loading() {
  return (
    <div className="mx-auto gap-4 lg:flex">
      <div className="lg:w-2/3">
        <VideoLoading />
      </div>
    </div>
  );
}
