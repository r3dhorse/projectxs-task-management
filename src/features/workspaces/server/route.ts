import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";

const app = new Hono()

  .get("/", sessionMiddleware, 
    async (c) => {
    const databases = c.get("databases");

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
    );

    return c.json({ data: workspaces });
  })

  .post(
    "/",
    zValidator("json", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const database = c.get("databases");
      const user = c.get("user");
      const { name } = c.req.valid("json")

      const workspace = await database.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id
        },
      );

      return c.json({ data: workspace });
    }
  );
export default app;
