"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
        <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0 gap-3">
          {/* Tabs List */}
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger
              className="h-10 w-full sm:w-auto touch-manipulation"
              value="table"
            >
              Table
            </TabsTrigger>
            <TabsTrigger
              className="h-10 w-full sm:w-auto touch-manipulation"
              value="kanban"
            >
              Kanban
            </TabsTrigger>
          
          </TabsList>

          {/* Button with vertical margin on mobile */}
          <Button
            onClick={open}
            size="sm"
            className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 min-h-[44px] touch-manipulation"
          >
            <PlusIcon className="size-4 mr-2" />
            New
          </Button>
        </div>

        <DottedSeparator />
        {/* Placeholder for filters */}
        <div className="flex items-center justify-between gap-4">
          <DataFilters />
        </div>
        <DottedSeparator />
        {isLoadingTasks ? (
          <div className="w-full border rounded-lg h-[200px]">
            <LoadingSpinner variant="minimal" size="md" className="h-[200px]" />
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
