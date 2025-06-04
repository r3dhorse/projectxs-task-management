"use client";

import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "../types";
import { KanbanColumn } from "./kanban-column";
import { useUpdateTask } from "../api/use-update-task";

interface KanbanBoardProps {
  data: Task[];
  onChange: (tasks: Task[]) => void;
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
    key: TaskStatus.DONE,
    label: "Done",
    color: "border-l-green-400",
  },
  {
    key: TaskStatus.ACHIEVE,
    label: "Achieve",
    color: "border-l-purple-400",
  },
];

export const KanbanBoard = ({ data, onChange }: KanbanBoardProps) => {
  const { mutate: updateTask } = useUpdateTask();

  const onDragEnd = React.useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: { $id: string; status?: TaskStatus; position: number }[] = [];

      if (sourceStatus !== destStatus) {
        const tasksToUpdate = [...data];
        const taskToMove = tasksToUpdate.find((task) => task.$id === result.draggableId);
        
        if (taskToMove) {
          taskToMove.status = destStatus;
          
          updatesPayload.push({
            $id: taskToMove.$id,
            status: destStatus,
            position: Math.min((destination.index + 1) * 1000, 1_000_000),
          });
        }

        onChange(tasksToUpdate);
        updateTask(updatesPayload[0]);
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

        onChange(
          data.map((task) => {
            const update = updatesPayload.find((u) => u.$id === task.$id);
            if (update) {
              return { ...task, ...update };
            }
            return task;
          })
        );

        updatesPayload.forEach((update) => {
          updateTask(update);
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
      [TaskStatus.DONE]: [],
      [TaskStatus.ACHIEVE]: [],
    };

    data.forEach((task) => {
      grouped[task.status]?.push(task);
    });

    Object.keys(grouped).forEach((status) => {
      grouped[status] = grouped[status].sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [data]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => (
          <div key={board.key} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
            <KanbanColumn
              board={board}
              tasks={tasks[board.key]}
            />
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};