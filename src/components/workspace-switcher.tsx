"use client";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
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
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: workspaces, isLoading, isError } = useGetWorkspaces();
  const { open } = useCreateWorkspaceModal();
  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill onClick={open} className="size-6 text-neutral-950 cursor-pointer hover:opacity-75 transition" />
      </div>

      {isLoading ? (
        <div className="w-full h-9 rounded bg-neutral-100 flex items-center justify-center">
          <LoadingSpinner variant="minimal" size="sm" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load workspaces.</p>
      ) : (
        <Select onValueChange={onSelect} value={workspaceId}>
          <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
            <SelectValue placeholder="No workspace selected" />
          </SelectTrigger>
          <SelectContent>
            {workspaces?.documents?.length ? (
              workspaces.documents.map((workspace) => (
                <SelectItem
                  key={workspace.$id}
                  value={workspace.$id}
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {workspace.name.charAt(0)}
                    </div>
                    {workspace.name}
                  </span>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-neutral-500">
                No workspaces available
              </div>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
