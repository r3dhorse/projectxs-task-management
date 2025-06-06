"use client"

import { ArrowUpDown, Trash2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { PopulatedTask } from "../types"
import { Button } from "@/components/ui/button"
import { TaskDate } from "./task-date"
import { Badge } from "@/components/ui/badge"
import { snakeCaseTotitleCase } from "@/lib/utils"
import { TaskActions } from "./task-actions"

export const columns: ColumnDef<PopulatedTask>[] = [
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
    accessorKey: "service",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Service
          <ArrowUpDown className="ml-3 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const service = row.original?.service;
      return (
        <div className="flex items-center gap-x-2 text-sm font-medium">
          <p className="line-clamp-1">{service?.name || 'No Service'}</p>
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
      const assigneeWithName = assignees as Array<{ $id: string; name?: string; [key: string]: unknown }>;

      return (
        <div className="flex items-center gap-x-2">
          {assigneeWithName.length > 0 ? (
            assigneeWithName.map((assignee) => (
              <span key={assignee.$id} className="text-sm font-medium">
                {assignee.name || 'Unknown'}
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
      const serviceId = row.original.serviceId;

      return (
        <TaskActions id={id} serviceId={serviceId} deleteOnly={true} >
          <Button variant="ghost" className="size-8 p-0">
            <Trash2 className="size-4" />
          </Button>
        </TaskActions>
      )
    }
  }
];
