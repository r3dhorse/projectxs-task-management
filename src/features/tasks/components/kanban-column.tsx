"use client";

import { Droppable } from "@hello-pangea/dnd";
import { PopulatedTask } from "../types";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface KanbanColumnProps {
  board: {
    key: string;
    label: string;
    color: string;
  };
  tasks: PopulatedTask[];
}

export const KanbanColumn = ({ board, tasks }: KanbanColumnProps) => {
  const { open } = useCreateTaskModal();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className={`w-2 h-2 rounded-full ${board.color.replace('border-l-', 'bg-')}`} />
          <h3 className="text-sm font-medium">{board.label}</h3>
          <div className="size-5 flex items-center justify-center rounded text-xs text-neutral-700 bg-neutral-200 font-medium">
            {tasks.length}
          </div>
        </div>
        <Button
          onClick={() => open()}
          size="icon"
          variant="ghost"
          className="size-5"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      
      <Droppable droppableId={board.key}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-y-2 min-h-[200px]"
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.$id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};