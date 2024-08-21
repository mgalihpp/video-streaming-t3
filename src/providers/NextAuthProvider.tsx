"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

export default function NextAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
  );
}
