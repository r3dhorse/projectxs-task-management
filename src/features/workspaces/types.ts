import { Models } from "node-appwrite";

export type Workspace = Models.Document & {
  name: string;
  initeCode: string;
  userId: string;
}