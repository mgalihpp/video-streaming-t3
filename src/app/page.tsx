"use client"

import { Navbar, SideBar } from "@/components";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <Navbar />
      <SideBar />
    </SessionProvider>
  );
}
