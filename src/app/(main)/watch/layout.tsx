import { Suspense } from "react";

export default function WatchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Suspense>{children}</Suspense>;
}
