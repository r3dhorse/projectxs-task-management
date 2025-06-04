"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Task } from "../types";
import { MoreHorizontal } from "lucide-react";
import { TaskDate } from "./task-date";
import { TaskActions } from "./task-actions";
import { DottedSeparator } from "@/components/dotted-separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface KanbanCardProps {
  task: Task;
  index: number;
}

export const KanbanCard = ({ task, index }: KanbanCardProps) => {
  const workspaceId = useWorkspaceId();
  const { data: members } = useGetMembers({ workspaceId });

  const assignees = members?.documents?.filter((member) => 
    task.assigneeIds?.includes(member.$id)
  ) || [];

  return (
    <Draggable draggableId={task.$id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={`bg-white p-2.5 mb-1.5 rounded-md shadow-sm border border-neutral-200 cursor-grab active:cursor-grabbing transition ${
            snapshot.isDragging ? "opacity-75 rotate-5" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-x-2">
            <p className="text-sm line-clamp-2">{task.name}</p>
            <TaskActions id={task.$id} projectId={task.projectId}>
              <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition" />
            </TaskActions>
          </div>
          
          <DottedSeparator className="my-2.5" />
          
          <div className="flex items-center gap-x-1.5">
            <TaskDate value={task.dueDate} className="text-xs" />
          </div>
          
          <div className="flex items-center gap-x-1.5 mt-2">
            <div className="flex items-center gap-x-1 -space-x-1">
              {assignees.map((assignee) => (
                <Avatar key={assignee.$id} className="size-6 border-2 border-white">
                  <AvatarFallback className="text-xs font-medium bg-neutral-200 text-neutral-600">
                    {assignee.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignees.length > 3 && (
                <Avatar className="size-6 border-2 border-white">
                  <AvatarFallback className="text-xs font-medium bg-neutral-200 text-neutral-600">
                    +{assignees.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          
          {task.description && (
            <div className="mt-2">
              <p className="text-xs text-neutral-600 line-clamp-2">{task.description}</p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};