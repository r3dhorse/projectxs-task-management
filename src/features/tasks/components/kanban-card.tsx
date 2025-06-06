"use client";

import { Draggable } from "@hello-pangea/dnd";
import { PopulatedTask } from "../types";
import { MoreHorizontal } from "lucide-react";
import { TaskDate } from "./task-date";
import { TaskActions } from "./task-actions";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface KanbanCardProps {
  task: PopulatedTask;
  index: number;
}

export const KanbanCard = ({ task, index }: KanbanCardProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: members } = useGetMembers({ workspaceId });

  // Find the single assignee (not multiple assignees)
  const assignee = members?.documents?.find((member) => 
    member.$id === task.assigneeId
  );

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent drag events from interfering
    e.stopPropagation();
    
    // Validate task ID format before navigation
    if (!task.$id || task.$id.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(task.$id)) {
      console.error("Invalid task ID format:", task.$id);
      return;
    }
    
    router.push(`/workspaces/${workspaceId}/tasks/${task.$id}`);
  };

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    // Prevent drag events from interfering
    e.stopPropagation();
    
    // Validate task ID format before navigation
    if (!task.$id || task.$id.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(task.$id)) {
      console.error("Invalid task ID format:", task.$id);
      return;
    }
    
    router.push(`/workspaces/${workspaceId}/tasks/${task.$id}`);
  };

  return (
    <Draggable draggableId={task.$id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={handleCardClick}
          onDoubleClick={handleCardDoubleClick}
          className={`group bg-white rounded-lg shadow-sm border-2 border-neutral-200/80 overflow-hidden cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg hover:border-blue-300/60 hover:bg-blue-50/30 touch-manipulation ${
            snapshot.isDragging ? "opacity-75 rotate-1 shadow-xl border-blue-400" : ""
          }`}
        >
          {/* Card Header */}
          <div className="p-3 pb-2">
            <div className="flex items-start justify-between gap-x-2 mb-2">
              <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 flex-1 leading-snug">
                {task.name}
              </h3>
              <TaskActions id={task.$id} projectId={task.projectId}>
                <div className="opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200 p-2 hover:bg-neutral-100 rounded touch-manipulation">
                  <MoreHorizontal className="size-4 text-neutral-500" />
                </div>
              </TaskActions>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-3 pb-3">
            {/* Due Date */}
            <div className="mb-3">
              <TaskDate value={task.dueDate} className="text-xs font-medium" />
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between">
              {/* Assignee */}
              {assignee ? (
                <div className="flex items-center gap-x-2">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-xs font-medium bg-neutral-100 text-neutral-700 border">
                      {assignee.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-neutral-600 font-medium">
                    {assignee.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-x-2">
                  <div className="size-5 rounded-full bg-neutral-100 border border-dashed border-neutral-300" />
                  <span className="text-xs text-neutral-400 font-medium">
                    Unassigned
                  </span>
                </div>
              )}

              {/* Task Status Indicator */}
              <div className={`h-2 w-2 rounded-full ${
                task.status === 'BACKLOG' ? 'bg-neutral-400' :
                task.status === 'TODO' ? 'bg-blue-400' :
                task.status === 'IN_PROGRESS' ? 'bg-yellow-400' :
                task.status === 'IN_REVIEW' ? 'bg-purple-400' :
                task.status === 'DONE' ? 'bg-green-400' : 'bg-neutral-400'
              }`} />
            </div>
          </div>

          {/* Subtle hover indicator */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100" />
        </div>
      )}
    </Draggable>
  );
};