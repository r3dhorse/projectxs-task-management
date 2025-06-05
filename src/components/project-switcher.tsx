"use client";

import { useGetProjects } from "@/features/projects/api/use-get-project";
import { RiAddCircleFill } from "react-icons/ri";
import {
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

export const ProjectSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();
  const router = useRouter();
  const { data: projects, isLoading, isError } = useGetProjects({ workspaceId });
  const { open } = useCreateProjectModal();
  
  const onSelect = (id: string) => {
    if (id === "all-projects") {
      router.push(`/workspaces/${workspaceId}`);
    } else {
      router.push(`/workspaces/${workspaceId}/projects/${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        <RiAddCircleFill 
          onClick={open} 
          className="size-6 text-neutral-950 cursor-pointer hover:opacity-75 transition" 
        />
      </div>

      {isLoading ? (
        <div className="w-full h-9 rounded bg-neutral-100 flex items-center justify-center">
          <LoadingSpinner variant="minimal" size="sm" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load projects.</p>
      ) : (
        <Select onValueChange={onSelect} value={projectId || "all-projects"}>
          <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all-projects"
              className="flex items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold">
                  All
                </div>
                All Projects
              </span>
            </SelectItem>
            {projects?.documents?.length ? (
              projects.documents.map((project) => (
                <SelectItem
                  key={project.$id}
                  value={project.$id}
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {project.name.charAt(0)}
                    </div>
                    {project.name}
                  </span>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-neutral-500">
                No projects available
              </div>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};