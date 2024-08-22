import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full items-center justify-center">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
