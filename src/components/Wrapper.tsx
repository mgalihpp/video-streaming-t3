"use client";

import { useState } from "react";
import { Footer, Navbar, SideBar } from ".";
import Menu from "./Icons/Menu";
import { cn } from "@/lib/utils";

interface WrapperProps {
  children: JSX.Element;
  closeSidebar?: boolean;
}

export default function Wrapper({ children, closeSidebar }: WrapperProps) {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  return (
    <>
      <Navbar>
        <button
          type="button"
          onClick={() => setSideBarOpen(true)}
          className="-mx-2 inline-flex items-center justify-center rounded-md
        p-2 focus:outline-none
        "
        >
          <Menu className="h-6 w-6 stroke-gray-500" aria-hidden="true" />
        </button>
      </Navbar>
      <SideBar
        isOpen={sideBarOpen}
        setSidebarOpen={setSideBarOpen}
        closeSidebar={closeSidebar}
      />
      <div className='lg:hidden'>
        <Footer />
      </div>
      <div className={cn("lg:pl-56", { "lg:pl-20": closeSidebar })}>
        <main className="py-24">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-x-4">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}
