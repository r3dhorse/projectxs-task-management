"use client";

import Image from "next/image";
import Link from "next/link";
import { DottedSeparator } from "./dotted-separator";
import { Navigation } from "./navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { ProjectSwitcher } from "./project-switcher";
import { useLogout } from "@/features/auth/api/use-logout";
import { Button } from "./ui/button";
import { LogOutIcon } from "lucide-react";




export const Sidebar = () => {
  const { mutate: logout } = useLogout();

  return (
    <aside
      className="h-full w-64 bg-neutral-100 p-6 flex flex-col justify-between border-r"
      aria-label="Sidebar"
    >
      <div>
        <Link href="/" className="block mb-6">
          <Image src="/logo.svg" alt="App Logo" width={164} height={48} />
        </Link>

        <DottedSeparator className="my-4" />
        <WorkspaceSwitcher />
        <DottedSeparator className="my-4" />
        < Navigation />
        <DottedSeparator className="my-4" />
        < ProjectSwitcher />
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
