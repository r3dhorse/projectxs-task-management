"use client";

import { useCallback } from "react";

import { DataFilters } from "@/features/tasks/components/data-filters";
import { useGetFollowedTasks } from "@/features/tasks/api/use-get-followed-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useTaskFilters } from "@/features/tasks/hooks/use-task-filters";
import { DataTable } from "@/features/tasks/components/data-table";
import { columns } from "@/features/tasks/components/columns";
import { KanbanBoard } from "@/features/tasks/components/kanban-board";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { PopulatedTask } from "@/features/tasks/types";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryState } from "nuqs";

export const FollowedTasksClient = () => {
  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();

  const [{ status, serviceId, dueDate, search }] = useTaskFilters();
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "kanban"
  });

  const { data: tasks, isLoading: isLoadingTasks, error } = useGetFollowedTasks({
    workspaceId,
    serviceId,
    status,
    dueDate,
    search,
  });

  // Debug logging
  console.log("FollowedTasksClient Debug:", {
    workspaceId,
    serviceId,
    status,
    dueDate,
    search,
    isLoading: isLoadingTasks,
    error,
    tasksData: tasks,
    tasksCount: tasks?.documents?.length || 0
  });

  const onKanbanChange = useCallback(() => {
    // This will be handled by React Query's cache update
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-start lg:items-center">
        <div className="flex items-center gap-x-2">
          <Heart className="size-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-semibold">Followed Tasks</h1>
        </div>
        <Button onClick={open} size="sm">
          <Plus className="size-4 mr-2" />
          New Task
        </Button>
      </div>
      
      <Tabs
        defaultValue={view}
        onValueChange={setView}
        className="flex-1 w-full border rounded-lg"
      >
        <div className="h-full flex flex-col overflow-auto p-4 space-y-4">
          {/* Header Section: Tabs */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-3 sm:space-y-0 gap-3">
            {/* Tabs List */}
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger
                className="h-10 w-full sm:w-auto touch-manipulation"
                value="kanban"
              >
                Kanban
              </TabsTrigger>
              <TabsTrigger
                className="h-10 w-full sm:w-auto touch-manipulation"
                value="table"
              >
                Table
              </TabsTrigger>
            </TabsList>
          </div>

          <DataFilters />
          
          {isLoadingTasks ? (
            <div className="w-full border rounded-lg h-[200px] flex items-center justify-center">
              <div className="h-[200px] rounded-lg bg-muted animate-pulse w-full" />
            </div>
          ) : error ? (
            <div className="w-full border rounded-lg h-[200px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 font-medium">Error loading followed tasks</p>
                <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
              </div>
            </div>
          ) : !tasks?.documents || tasks.documents.length === 0 ? (
            <div className="w-full border rounded-lg h-[200px] flex items-center justify-center">
              <div className="text-center">
                <Heart className="size-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-medium">No followed tasks found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tasks you follow will appear here. Create a new task to get started!
                </p>
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="kanban" className="mt-0">
                <KanbanBoard
                  data={(tasks?.documents || []) as unknown as PopulatedTask[]}
                  onChange={onKanbanChange}
                />
              </TabsContent>
              <TabsContent value="table" className="mt-0">
                <DataTable 
                  columns={columns} 
                  data={(tasks?.documents || []) as unknown as PopulatedTask[]} 
                />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};