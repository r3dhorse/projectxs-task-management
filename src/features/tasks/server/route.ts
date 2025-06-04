import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID, TASK_HISTORY_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";
import { TaskHistoryAction } from "../types/history";
import { detectTaskChanges } from "../utils/history";



const app = new Hono()
  .delete(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const member = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      await databases.deleteDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      return c.json({ data: { $id: task.$id } });
    }
  )

  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),

      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const {
        workspaceId,
        projectId,
        status,
        search,
        assigneeId,
        dueDate
      } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt")
      ];

      if (projectId) {
        console.log("project:", projectId)
        query.push(Query.equal("projectId", projectId));
      }

      if (status) {
        console.log("status:", status)
        query.push(Query.equal("status", status));
      }

      if (assigneeId) {
        console.log("assigneeId:", assigneeId)
        query.push(Query.equal("assigneeId", assigneeId));
      }

      if (dueDate) {
        console.log("dueDate:", dueDate)
        query.push(Query.equal("dueDate", dueDate));
      }

      if (search) {
        console.log("search:", search)
        query.push(Query.search("name", search));
      }

      const tasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        query,
      );

      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = [...new Set(tasks.documents.map((task) => task.assigneeId).filter(Boolean))];

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user.name,
            email: user.email,
          }
        })
      );

      const populatedTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId,
        );
        const taskAssignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId,
        );
        const taskAssignees = taskAssignee ? [taskAssignee] : [];

        return {
          ...task,
          project,
          assignees: taskAssignees,
        };
      });

      return c.json({
        data: {
          ...tasks,
          documents: populatedTasks,
        },
      });
    }
  )

  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      try {
        const user = c.get("user");
        const databases = c.get("databases");

        const {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          description,
          attachmentId,
        } = c.req.valid("json");

        console.log("Creating task with data:", {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          description,
          attachmentId,
        });

        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const highestPositionTask = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("status", status),
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("position"),
            Query.limit(1),
          ]
        );

        const newPosition =
          highestPositionTask.documents.length > 0
            ? highestPositionTask.documents[0].position + 1000
            : 1000;

        const taskData: Record<string, unknown> = {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          description,
          position: newPosition,
        };

        // Only add attachmentId if it exists and is not empty
        if (attachmentId) {
          taskData.attachmentId = attachmentId;
        }

        const task = await databases.createDocument(
          DATABASE_ID,
          TASKS_ID,
          ID.unique(),
          taskData
        );

        // Create history entry for task creation
        try {
          const { users } = await createAdminClient();
          const userInfo = await users.get(user.$id);
          
          await databases.createDocument(
            DATABASE_ID,
            TASK_HISTORY_ID,
            ID.unique(),
            {
              taskId: task.$id,
              userId: user.$id,
              userName: userInfo.name,
              action: TaskHistoryAction.CREATED,
              timestamp: new Date().toISOString(),
            }
          );
        } catch (historyError) {
          console.error("Failed to create task history entry:", historyError);
          // Don't fail the task creation if history fails
        }

        console.log("Task created successfully:", task.$id);
        return c.json({ data: task });
      } catch (error) {
        console.error("Task creation error:", error);
        return c.json({ error: error.message || "Failed to create task" }, 500);
      }
    }
  )

  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      try {
        const user = c.get("user");
        const databases = c.get("databases");

        const {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
          attachmentId,
        } = c.req.valid("json");

        const { taskId } = c.req.param();

        const existingTask = await databases.getDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId,
        )

        const member = await getMember({
          databases,
          workspaceId: existingTask.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const updateData: Record<string, unknown> = {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        };

        // Only add attachmentId if it exists
        if (attachmentId !== undefined) {
          updateData.attachmentId = attachmentId;
        }

        // Detect what changed for history tracking
        const updatePayload = c.req.valid("json");
        console.log("Task update - Existing task:", JSON.stringify(existingTask, null, 2));
        console.log("Task update - Update payload:", JSON.stringify(updatePayload, null, 2));
        const changes = detectTaskChanges(existingTask, updatePayload);
        console.log("Task update - Detected changes:", JSON.stringify(changes, null, 2));

        const task = await databases.updateDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId,
          updateData
        );

        // Create history entries for changes
        if (changes.length > 0) {
          console.log("Creating history entries for", changes.length, "changes");
          try {
            const { users } = await createAdminClient();
            const userInfo = await users.get(user.$id);
            
            for (const change of changes) {
              let action: TaskHistoryAction;
              
              // Map field to appropriate action
              switch (change.field) {
                case "status":
                  action = TaskHistoryAction.STATUS_CHANGED;
                  break;
                case "assigneeId":
                  action = TaskHistoryAction.ASSIGNEE_CHANGED;
                  break;
                case "projectId":
                  action = TaskHistoryAction.PROJECT_CHANGED;
                  break;
                case "dueDate":
                  action = TaskHistoryAction.DUE_DATE_CHANGED;
                  break;
                case "description":
                  action = TaskHistoryAction.DESCRIPTION_UPDATED;
                  break;
                case "name":
                  action = TaskHistoryAction.NAME_CHANGED;
                  break;
                case "attachmentId":
                  action = change.newValue ? TaskHistoryAction.ATTACHMENT_ADDED : TaskHistoryAction.ATTACHMENT_REMOVED;
                  break;
                default:
                  action = TaskHistoryAction.UPDATED;
              }

              const historyData = {
                taskId,
                userId: user.$id,
                userName: userInfo.name,
                action,
                field: change.field,
                oldValue: change.oldValue || "",
                newValue: change.newValue || "",
                timestamp: new Date().toISOString(),
              };
              console.log("Creating history entry:", JSON.stringify(historyData, null, 2));
              
              console.log("Attempting to create history entry in collection:", TASK_HISTORY_ID);
              const historyEntry = await databases.createDocument(
                DATABASE_ID,
                TASK_HISTORY_ID,
                ID.unique(),
                historyData
              );
              console.log("History entry created successfully with ID:", historyEntry.$id);
            }
          } catch (historyError) {
            console.error("Failed to create task history entries:", historyError);
            // Don't fail the task update if history fails
          }
        } else {
          console.log("No changes detected, skipping history creation");
        }

        return c.json({ data: task });
      } catch (error) {
        console.error("Task update error:", error);
        return c.json({ error: error.message || "Failed to update task" }, 500);
      }
    }
  )

  .get(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const currentUser = c.get("user");
      const databases = c.get("databases")
      const { users } = await createAdminClient();
      const { taskId } = c.req.param();

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId
      );

      const currentMember = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: currentUser.$id
      });

      if (!currentMember) {
        return c.json({ error: "Unathorized" }, 401)
      }

      const project = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        task.projectId,
      );

      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        task.assigneeId ? [Query.equal("$id", task.assigneeId)] : [],
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );

      return c.json({
        data: {
          ...task,
          project,
          assignees,
        },
      });
    }
  );


export default app;