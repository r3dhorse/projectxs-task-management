import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route";
import members from "@/features/members/server/route";
import project from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import taskHistory from "@/features/tasks/server/history-route";
import taskMessages from "@/features/tasks/server/messages-route";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", auth)
  .route("/workspaces", workspaces)
  .route("/members", members)
  .route("/projects", project)
  .route("/tasks", tasks)
  .route("/task-history", taskHistory)
  .route("/tasks/messages", taskMessages)

export const GET = handle(routes);
export const POST = handle(routes);
export const PATCH = handle(routes);
export const DELETE = handle(routes);

export type Apptype = typeof routes;