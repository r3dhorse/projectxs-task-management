import { Models } from "node-appwrite";

export interface TaskMessage extends Models.Document {
  taskId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  workspaceId: string;
}

export interface CreateTaskMessageRequest {
  taskId: string;
  content: string;
  workspaceId: string;
}

export interface GetTaskMessagesRequest {
  taskId: string;
  workspaceId?: string;
}