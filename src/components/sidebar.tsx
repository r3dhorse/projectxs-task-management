"use client";

import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { ServiceSwitcher } from "./service-switcher";
import { useLogout } from "@/features/auth/api/use-logout";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";




export const Sidebar = () => {
  const { mutate: logout } = useLogout();

  return (
    <aside
      className="h-full w-64 sm:w-72 lg:w-64 bg-neutral-100 p-4 sm:p-6 flex flex-col justify-between border-r"
      aria-label="Sidebar"
    >
      <div>
        <Link href="/" className="block mb-4 sm:mb-6">
          <Image 
            src="/logo.svg" 
            alt="Task Management - Go to homepage" 
            width={200} 
            height={60} 
            className="h-12 sm:h-15 w-auto"
            priority
          />
        </Link>

        <DottedSeparator className="my-3 sm:my-4" />
        <WorkspaceSwitcher />
        <DottedSeparator className="my-3 sm:my-4" />
        < Navigation />
        <DottedSeparator className="my-3 sm:my-4" />
        < ServiceSwitcher />
      </div>

      <div className="flex flex-col gap-4">
        <Button
          onClick={() => logout()}
          variant="outline"
          className="w-full bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100 hover:border-red-300 text-red-700 hover:text-red-800 shadow-sm transition-all duration-200"
        >
          <LogOutIcon className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </aside>
  );
};
