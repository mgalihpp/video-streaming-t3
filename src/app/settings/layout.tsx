import { getServerAuthSession } from "@/server/auth";
import { ReactNode } from "react";

export async function generateMetadata() {
  const session = await getServerAuthSession();

  return {
    title: `Settings - ${session?.user.name ?? ""}`,
  };
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
