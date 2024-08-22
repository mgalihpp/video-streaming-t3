import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "a dashboard that contains your videos",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
