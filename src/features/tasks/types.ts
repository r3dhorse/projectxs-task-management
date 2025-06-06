import { Models } from "node-appwrite"

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
};

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  serviceId: string;
  position: number;
  dueDate: string;
  description?: string;
  attachmentId?: string;
  followedIds: string; // JSON string of array
}

export type PopulatedTask = Task & {
  service?: Models.Document;
  assignees?: Models.Document[];
}