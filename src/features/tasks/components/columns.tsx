"use client"

import { ArrowUpDown, MoreVertical } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Task } from "../types"
import { Button } from "@/components/ui/button"
import { TaskDate } from "./task-date"
import { Badge } from "@/components/ui/badge"
import { snakeCaseTotitleCase } from "@/lib/utils"
import { TaskActions } from "./task-actions"

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Task Name
          <ArrowUpDown className="ml-3 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.original.name;
      return <p className="line-clamp-1">{name}</p>
    }
  },
  {
    accessorKey: "project",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Project
          <ArrowUpDown className="ml-3 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const project = row.original?.project;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <p className="line-clamp-1">{project?.name || 'No Project'}</p>
        </div>
      );
    }

  },

  {
    accessorKey: "assignees",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Assignee
          <ArrowUpDown className="ml-3 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const assignees = row.original.assignees || [];

      return (
        <div className="flex items-center gap-x-2">
          {assignees.length > 0 ? (
            assignees.map((assignee: { $id: string; name: string }) => (
              <span key={assignee.$id} className="text-sm font-medium">
                {assignee.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No assignee</span>
          )}
        </div>
      )
    }
  },

  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Due Date
          <ArrowUpDown className="ml-3 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const dueDate = row.original.dueDate;

      return <TaskDate value={dueDate} />

    }
  },

  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Status
          <ArrowUpDown className="ml-3 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const status = row.original.status;

      return <Badge variant={status}>{snakeCaseTotitleCase(status)}</Badge>

    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;

      return (
        <TaskActions id={id} projectId={projectId} >
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      )
    }
  }
];
