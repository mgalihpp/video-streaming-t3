import { Suspense } from "react";

export default async function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
