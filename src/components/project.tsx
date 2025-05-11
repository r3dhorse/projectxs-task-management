"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useGetProject } from "@/features/project/api/use-get-project";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { RiAddCircleFill } from "react-icons/ri";

export const Projects = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  const { data, isLoading, error } = useGetProject({ workspaceId });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        <RiAddCircleFill
          onClick={() => {
            // Add project creation logic here
          }}
          className="size-6 text-neutral-950 cursor-pointer hover:opacity-75 transition"
        />
      </div>

      {isLoading && <p className="text-sm text-neutral-400 italic">Loading...</p>}
      {error && <p className="text-sm text-red-500">Failed to load projects.</p>}
      {data?.documents?.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No projects found.</p>
      )}

      {data?.documents?.map((project) => {
        const href = `/workspace/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link key={project.$id} href={href}>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500 px-2 py-1",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
