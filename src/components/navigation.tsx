"use client";

import { SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Home",
    href: "",
    icon: GoHome,
    activeIcon: GoHomeFill,
    projectAware: false, // Home always goes to workspace level
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
    projectAware: true, // Can be project-specific
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
    projectAware: true, // Can be project-specific
  },
   {
    label: "Setting",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    projectAware: true, // Can be project-specific
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  
  // Check if we're currently in a project context
  const isInProjectContext = pathname.includes('/projects/');
  const projectId = isInProjectContext ? pathname.match(/\/projects\/([^\/]+)/)?.[1] : null;

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        // Determine the href based on project context
        let fullHref: string;
        
        if (item.projectAware && isInProjectContext && projectId) {
          // Navigate to project-specific version
          fullHref = `/workspaces/${workspaceId}/projects/${projectId}${item.href}`;
        } else {
          // Navigate to workspace-level version
          fullHref = `/workspaces/${workspaceId}${item.href}`;
        }
        
        const isActive = pathname === fullHref || 
          (item.projectAware && isInProjectContext && pathname.startsWith(fullHref));
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500 min-h-[44px] touch-manipulation",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className={cn("size-5 flex-shrink-0", isActive ? "text-primary" : "text-neutral-500")} />
              <span className="text-sm sm:text-base truncate">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
