"use client";

import { useState, type ReactNode } from "react";
import Menu from "@/components/Icons/Menu";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar/Navbar";
import SideBar from "@/components/navbar/Sidebar";
import SmoothScroll from "./SmoothScrolling";

interface WrapperProps {
  children: JSX.Element | ReactNode;
  closeSidebar?: boolean;
}

export default function Wrapper({ children }: WrapperProps) {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [closeSidebar, setCloseSidebar] = useState(true);

  return (
    <>
      <Navbar>
        <button
          type="button"
          onClick={() => {
            setSideBarOpen(true);
            setCloseSidebar(false);
          }}
          className="-mx-2 inline-flex items-center justify-center rounded-md p-2 focus:outline-none"
        >
          <Menu className="h-6 w-6 stroke-gray-500" aria-hidden="true" />
        </button>
      </Navbar>
      <SideBar
        isOpen={sideBarOpen}
        setSidebarOpen={setSideBarOpen}
        closeSidebar={closeSidebar}
        setCloseSideBar={setCloseSidebar}
      />
      <div className="lg:hidden">{/* <Footer /> */}</div>
      <SmoothScroll>
        <div className={cn("lg:pl-56 mt-[4.35rem]", { "lg:pl-20": closeSidebar })}>
          <main className="container py-4 max-sm:p-0">
            {children}

            <div></div>
          </main>
        </div>
      </SmoothScroll>
    </>
  );
}
