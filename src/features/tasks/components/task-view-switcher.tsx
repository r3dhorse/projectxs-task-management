"use client";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

export const TaskViewSwitcher = () => {
  const { open } = useCreateTaskModal();

  return (
    <Tabs defaultValue="table" className="w-full border rounded-lg shadow-sm bg-white">
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
            <TabsTrigger
              className="h-8 w-full lg:w-auto"
              value="calendar"
            >
              Calendar
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
          <span className="text-muted-foreground text-sm">Filter options go here</span>
        </div>

        <DottedSeparator />

        {/* Tab content */}
        <TabsContent value="table">Table View Content</TabsContent>
        <TabsContent value="kanban">Kanban View Content</TabsContent>
        <TabsContent value="calendar">Calendar View Content</TabsContent>
      </div>
    </Tabs>
  );
};
