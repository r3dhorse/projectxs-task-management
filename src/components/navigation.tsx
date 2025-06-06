"use client";

import { Heart, SettingsIcon, UsersIcon } from "lucide-react";
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
    serviceAware: false, // Home always goes to workspace level
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
    serviceAware: true, // Can be service-specific
  },
  {
    label: "Followed Tasks",
    href: "/followed-tasks",
    icon: Heart,
    activeIcon: Heart,
    serviceAware: false, // Always workspace-level
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
    serviceAware: true, // Can be service-specific
  },
   {
    label: "Setting",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
    serviceAware: true, // Can be service-specific
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  
  // Check if we're currently in a service context
  const isInServiceContext = pathname.includes('/services/');
  const serviceId = isInServiceContext ? pathname.match(/\/services\/([^\/]+)/)?.[1] : null;

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        // Determine the href based on service context
        let fullHref: string;
        
        if (item.serviceAware && isInServiceContext && serviceId) {
          // Navigate to service-specific version
          fullHref = `/workspaces/${workspaceId}/services/${serviceId}${item.href}`;
        } else {
          // Navigate to workspace-level version
          fullHref = `/workspaces/${workspaceId}${item.href}`;
        }
        
        const isActive = pathname === fullHref || 
          (item.serviceAware && isInServiceContext && pathname.startsWith(fullHref));
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
