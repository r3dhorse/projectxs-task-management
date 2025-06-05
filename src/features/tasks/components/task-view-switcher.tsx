"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { KanbanBoard } from "./kanban-board";
import { useCallback } from "react";
import { PopulatedTask } from "../types";


export const TaskViewSwitcher = () => {
  const [{
    status,
    assigneeId,
    projectId,
    dueDate
  }] = useTaskFilters();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table"
  });
  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();

  const {
    data: tasks,
    isLoading: isLoadingTasks
  } = useGetTasks({
    workspaceId,
    projectId,
    assigneeId,
    status,
    dueDate,
  });

  const onKanbanChange = useCallback(() => {
    // This will be handled by React Query's cache update
  }, []);


  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg"

    >
      <div className="h-full flex flex-col overflow-auto p-4 space-y-4">

        {/* Header Section: Tabs + New Button */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center space-y-2 lg:space-y-0">
          {/* Tabs List */}
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value="table"
            >
              Table
            </TabsTrigger>
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value="kanban"
            >
              Kanban
            </TabsTrigger>
          
          </TabsList>

          {/* Button with vertical margin on mobile */}
          <div className="flex flex-col w-full lg:w-auto space-y-2">
            <Button
              onClick={open}
              size="sm"
              className="w-full lg:w-auto bg-primary text-white hover:bg-primary/90"
            >
              <PlusIcon className="size-4 mr-2" />
              New
            </Button>
          </div>
        </div>

        <DottedSeparator />
        {/* Placeholder for filters */}
        <div className="flex items-center justify-between gap-4">
          <DataFilters />
        </div>
        <DottedSeparator />
        {isLoadingTasks ? (
          <div className="w-full border rounde-lg h-[200px] flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Tab content */}
            <TabsContent value="table" className="mt-0">
              <DataTable columns={columns} data={(tasks?.documents ?? []) as unknown as PopulatedTask[]} />

            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <KanbanBoard
                data={(tasks?.documents ?? []) as unknown as PopulatedTask[]}
                onChange={onKanbanChange}
              />
            </TabsContent>
        
          </>
        )}
      </div>
    </Tabs>
  );
};
