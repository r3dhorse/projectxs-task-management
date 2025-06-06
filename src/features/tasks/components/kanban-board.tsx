"use client";

import React, { useState } from "react";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import { Task, TaskStatus, PopulatedTask } from "../types";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { useUpdateTask } from "../api/use-update-task";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface KanbanBoardProps {
  data: PopulatedTask[];
  onChange?: (tasks: PopulatedTask[]) => void;
}

const boards = [
  {
    key: TaskStatus.BACKLOG,
    label: "Backlog",
    color: "border-l-gray-400",
  },
  {
    key: TaskStatus.TODO,
    label: "Todo",
    color: "border-l-blue-400",
  },
  {
    key: TaskStatus.IN_PROGRESS,
    label: "In Progress",
    color: "border-l-yellow-400",
  },
  {
    key: TaskStatus.IN_REVIEW,
    label: "In Review",
    color: "border-l-purple-400",
  },
  {
    key: TaskStatus.DONE,
    label: "Done",
    color: "border-l-green-400",
  },
];

interface DoneColumnProps {
  board: {
    key: string;
    label: string;
    color: string;
  };
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  taskCount: number;
}

const DoneColumn = ({ board, tasks, isExpanded, onToggle, taskCount }: DoneColumnProps) => {
  const { open } = useCreateTaskModal();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-auto p-0 hover:bg-transparent"
          >
            <div className="flex items-center gap-x-2">
              {isExpanded ? (
                <ChevronDown className="size-4 text-neutral-500" />
              ) : (
                <ChevronRight className="size-4 text-neutral-500" />
              )}
              <div className={`w-2 h-2 rounded-full ${board.color.replace('border-l-', 'bg-')}`} />
              <h3 className="text-sm font-medium">{board.label}</h3>
              <div className="size-5 flex items-center justify-center rounded text-xs text-neutral-700 bg-neutral-200 font-medium">
                {taskCount}
              </div>
            </div>
          </Button>
        </div>
        {isExpanded && (
          <Button
            onClick={() => open()}
            size="icon"
            variant="ghost"
            className="size-5"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>
      
      {isExpanded && (
        <Droppable droppableId={board.key}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col gap-y-2 min-h-[200px] touch-manipulation"
            >
              {tasks.map((task, index) => (
                <KanbanCard key={task.$id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
      
      {!isExpanded && (
        <div className="flex items-center justify-center min-h-[60px] rounded-lg border-2 border-dashed border-neutral-300/80 bg-neutral-50/80 backdrop-blur-sm">
          <p className="text-xs text-neutral-500">
            {taskCount === 0 ? 'No completed tasks' : `${taskCount} completed task${taskCount === 1 ? '' : 's'}`}
          </p>
        </div>
      )}
    </div>
  );
};

export const KanbanBoard = ({ data, onChange }: KanbanBoardProps) => {
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const [isDoneExpanded, setIsDoneExpanded] = useState(false);

  const onDragEnd = React.useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      // Validate draggable ID format
      const taskId = result.draggableId;
      if (!taskId || taskId.length > 36 || !/^[a-zA-Z0-9_]+$/.test(taskId)) {
        console.error("Invalid task ID in drag operation:", taskId);
        return;
      }

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: { $id: string; status?: TaskStatus; position: number }[] = [];

      if (sourceStatus !== destStatus) {
        const tasksToUpdate = [...data];
        const taskToMove = tasksToUpdate.find((task) => task.$id === taskId);
        
        if (!taskToMove) {
          console.error("Task not found for ID:", taskId);
          return;
        }

        taskToMove.status = destStatus;
        
        updatesPayload.push({
          $id: taskToMove.$id,
          status: destStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        onChange?.(tasksToUpdate);
        
        // Update task with correct API format
        const taskUpdate = updatesPayload[0];
        updateTask({
          param: { taskId: taskUpdate.$id },
          json: {
            name: taskToMove.name,
            status: taskUpdate.status!,
            workspaceId: taskToMove.workspaceId,
            serviceId: taskToMove.serviceId,
            dueDate: taskToMove.dueDate,
            assigneeId: taskToMove.assigneeId,
            description: taskToMove.description,
            attachmentId: taskToMove.attachmentId,
          }
        });
      } else {
        const tasksToUpdate = [...data]
          .filter((task) => task.status === sourceStatus)
          .sort((a, b) => a.position - b.position);

        const taskToMove = tasksToUpdate[source.index];
        tasksToUpdate.splice(source.index, 1);
        tasksToUpdate.splice(destination.index, 0, taskToMove);

        const minimumPosition = tasksToUpdate[0]?.position ?? 0;

        updatesPayload = tasksToUpdate.map((task, index) => ({
          $id: task.$id,
          status: sourceStatus,
          position: minimumPosition + (index + 1) * 1000,
        }));

        onChange?.(
          data.map((task) => {
            const update = updatesPayload.find((u) => u.$id === task.$id);
            if (update) {
              return { ...task, ...update };
            }
            return task;
          })
        );

        // Update each task with correct API format
        updatesPayload.forEach((update) => {
          const task = data.find(t => t.$id === update.$id);
          if (!task) {
            console.error("Task not found for position update:", update.$id);
            return;
          }
          
          updateTask({
            param: { taskId: update.$id },
            json: {
              name: task.name,
              status: update.status!,
              workspaceId: task.workspaceId,
              serviceId: task.serviceId,
              dueDate: task.dueDate,
              assigneeId: task.assigneeId,
              description: task.description,
              attachmentId: task.attachmentId,
            }
          });
        });
      }
    },
    [data, onChange, updateTask]
  );

  const tasks = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      // Only include DONE tasks if the done section is expanded
      if (task.status === TaskStatus.DONE && !isDoneExpanded) {
        return;
      }
      grouped[task.status]?.push(task);
    });

    Object.keys(grouped).forEach((status) => {
      grouped[status] = grouped[status].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [data, isDoneExpanded]);

  // Count done tasks for the collapsed state
  const doneTasksCount = React.useMemo(() => {
    return data.filter(task => task.status === TaskStatus.DONE).length;
  }, [data]);

  return (
    <div className="relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`flex overflow-x-auto gap-2 pb-4 transition-all duration-300 ${
          isUpdating ? 'blur-sm opacity-75' : ''
        }`}>
          {boards.map((board) => (
            <div key={board.key} className="flex-shrink-0 w-72 sm:w-80 bg-muted/70 border border-neutral-200/60 p-1.5 rounded-lg shadow-sm backdrop-blur-sm">
              {board.key === TaskStatus.DONE ? (
                <DoneColumn
                  board={board}
                  tasks={tasks[board.key]}
                  isExpanded={isDoneExpanded}
                  onToggle={() => setIsDoneExpanded(!isDoneExpanded)}
                  taskCount={doneTasksCount}
                />
              ) : (
                <KanbanColumn
                  board={board}
                  tasks={tasks[board.key]}
                />
              )}
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Loading overlay during API updates only */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border">
            <div className="flex items-center gap-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              <span className="text-sm font-medium text-neutral-700">
                Updating task...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};