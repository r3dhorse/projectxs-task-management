import { z } from "zod"
import { TaskStatus } from "./types"

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  serviceId: z.string().trim().min(1, "Required"),
  dueDate: z.string().min(1, "Due date is required"),
  assigneeId: z.string().optional(),
  description: z.string().optional(),
  attachmentId: z.string().optional(),
  followedIds: z.string().optional(),
});