import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { MemberRole } from "@/features/members/types";
import { getMember } from "@/features/members/utils";
import { generateInviteCode } from "@/lib/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { error } from "console";




const app = new Hono()

  .get(
    "/",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user")
      const databases = c.get("databases");

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)]
      );

      if (members.total === 0) {
        return c.json({ data: { documents: [], total: 0 } })
      }

      const workspaceIds = members.documents.map((member) => member.workspaceId)

      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [
          Query.orderDesc("$createdAt"),
          Query.contains("$id", workspaceIds)
        ]
      );

      return c.json({ data: workspaces });
    }
  )

  .post(
    "/",
    zValidator("json", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { name } = c.req.valid("json")



      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          inviteCode: generateInviteCode(10),
        },
      );

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.ADMIN
        }
      )

      return c.json({ data: workspace });
    }
  )

  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases")
      const user = c.get("user")

      const { workspaceId } = c.req.param();
      const { name } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });
      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name
        }
      );
      return c.json({ data: workspace })
    }

  )

  .delete(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401)
      }

// TODO: Delete members, projects , and tasks

      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: { $id: workspaceId } });
    }
  );


export default app;
