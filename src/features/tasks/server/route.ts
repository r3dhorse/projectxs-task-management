import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, SERVICES_ID, TASKS_ID, TASK_HISTORY_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Service } from "@/features/services/types";
import { TaskHistoryAction } from "../types/history";
import { detectTaskChanges } from "../utils/history";



const app = new Hono()
  .get(
    "/followed",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        serviceId: z.string().nullish(),
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
        serviceId,
        status,
        search,
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

      if (serviceId) {
        query.push(Query.equal("serviceId", serviceId));
      }

      if (status) {
        query.push(Query.equal("status", status));
      }

      if (dueDate) {
        query.push(Query.equal("dueDate", dueDate));
      }

      if (search) {
        query.push(Query.search("name", search));
      }

      const allTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        query,
      );

      console.log("Followed tasks - Total tasks found:", allTasks.documents.length);
      console.log("Followed tasks - Current user ID:", user.$id);

      // Filter tasks where user is in followedIds
      const filteredDocuments = allTasks.documents.filter(task => {
        try {
          const followedIds = task.followedIds ? JSON.parse(task.followedIds as string) : [];
          console.log(`Task ${task.$id} followedIds:`, followedIds);
          const isFollowing = followedIds.includes(user.$id);
          console.log(`User ${user.$id} is following task ${task.$id}:`, isFollowing);
          return isFollowing;
        } catch (error) {
          console.error(`Error parsing followedIds for task ${task.$id}:`, error);
          return false;
        }
      });

      console.log("Followed tasks - Filtered tasks count:", filteredDocuments.length);

      const tasks = {
        ...allTasks,
        documents: filteredDocuments,
        total: filteredDocuments.length
      };

      const serviceIds = tasks.documents.map((task) => task.serviceId);
      const assigneeIds = [...new Set(tasks.documents.map((task) => task.assigneeId).filter(Boolean))];

      const services = await databases.listDocuments<Service>(
        DATABASE_ID,
        SERVICES_ID,
        serviceIds.length > 0 ? [Query.contains("$id", serviceIds)] : [],
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
        const service = services.documents.find(
          (service) => service.$id === task.serviceId,
        );
        const taskAssignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId,
        );
        const taskAssignees = taskAssignee ? [taskAssignee] : [];

        return {
          ...task,
          service,
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

  .delete(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId } = c.req.param();

      // Validate taskId format
      if (!taskId || taskId.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
        return c.json({ error: "Invalid task ID format" }, 400);
      }

      let task: Task;
      try {
        task = await databases.getDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId,
        );
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'type' in error && error.type === 'document_not_found') {
          return c.json({ error: "Task not found" }, 404);
        }
        throw error;
      }

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
        serviceId: z.string().nullish(),
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
        serviceId,
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

      if (serviceId) {
        console.log("service:", serviceId)
        query.push(Query.equal("serviceId", serviceId));
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

      const serviceIds = tasks.documents.map((task) => task.serviceId);
      const assigneeIds = [...new Set(tasks.documents.map((task) => task.assigneeId).filter(Boolean))];

      const services = await databases.listDocuments<Service>(
        DATABASE_ID,
        SERVICES_ID,
        serviceIds.length > 0 ? [Query.contains("$id", serviceIds)] : [],
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
        const service = services.documents.find(
          (service) => service.$id === task.serviceId,
        );
        const taskAssignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId,
        );
        const taskAssignees = taskAssignee ? [taskAssignee] : [];

        return {
          ...task,
          service,
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
          serviceId,
          dueDate,
          assigneeId,
          description,
          attachmentId,
          followedIds,
        } = c.req.valid("json");

        console.log("Creating task with data:", {
          name,
          status,
          workspaceId,
          serviceId,
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

        // Ensure creator is always in the followedIds
        let defaultFollowedIds = [];
        try {
          defaultFollowedIds = followedIds ? JSON.parse(followedIds) : [];
        } catch (parseError) {
          console.error("Error parsing followedIds:", parseError);
          defaultFollowedIds = [];
        }
        
        if (!defaultFollowedIds.includes(user.$id)) {
          defaultFollowedIds.push(user.$id);
        }

        console.log("Task creation - User ID:", user.$id);
        console.log("Task creation - Input followedIds:", followedIds);
        console.log("Task creation - Parsed followedIds:", defaultFollowedIds);
        console.log("Task creation - Final followedIds JSON:", JSON.stringify(defaultFollowedIds));

        const taskData: Record<string, unknown> = {
          name,
          status,
          workspaceId,
          serviceId,
          dueDate,
          assigneeId,
          description,
          position: newPosition,
          attachmentId: attachmentId || "", // Always include attachmentId, empty string if not provided
          followedIds: JSON.stringify(defaultFollowedIds), // Serialize array to JSON string
        };

        console.log("Task creation - Data being sent to database:", taskData);
        
        const task = await databases.createDocument(
          DATABASE_ID,
          TASKS_ID,
          ID.unique(),
          taskData
        );

        console.log("Task creation - Created task:", {
          id: task.$id,
          followedIds: task.followedIds,
          followedIdsType: typeof task.followedIds
        });

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
        return c.json({ error: error instanceof Error ? error.message : "Failed to create task" }, 500);
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
          serviceId,
          dueDate,
          assigneeId,
          description,
          attachmentId,
          followedIds,
        } = c.req.valid("json");

        const { taskId } = c.req.param();

        // Validate taskId format
        if (!taskId || taskId.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
          return c.json({ error: "Invalid task ID format" }, 400);
        }

        let existingTask: Task;
        try {
          existingTask = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
          );
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'type' in error && error.type === 'document_not_found') {
            return c.json({ error: "Task not found" }, 404);
          }
          throw error;
        }

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
          serviceId,
          dueDate,
          assigneeId,
          description,
        };

        // Handle attachmentId - always include if provided, allow empty string to clear attachment
        if (attachmentId !== undefined) {
          updateData.attachmentId = attachmentId; // Include attachmentId even if empty to clear it
        }

        // Handle followedIds - always include if provided
        if (followedIds !== undefined) {
          updateData.followedIds = followedIds; // Update followers list
        }

        // Detect what changed for history tracking
        const updatePayload = c.req.valid("json");
        const changes = detectTaskChanges(existingTask, updatePayload);

        const task = await databases.updateDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId,
          updateData
        );

        // Create history entries for changes
        if (changes.length > 0) {
          try {
            const { users } = await createAdminClient();
            const userInfo = await users.get(user.$id);
            
            for (const change of changes) {
              let action: TaskHistoryAction;
              let oldValue = change.oldValue || "";
              let newValue = change.newValue || "";
              
              // Map field to appropriate action and resolve user names for assignee changes
              switch (change.field) {
                case "status":
                  action = TaskHistoryAction.STATUS_CHANGED;
                  break;
                case "assigneeId":
                  action = TaskHistoryAction.ASSIGNEE_CHANGED;
                  // Resolve assignee IDs to names
                  if (change.oldValue) {
                    try {
                      const oldMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, change.oldValue);
                      const oldUser = await users.get(oldMember.userId);
                      oldValue = oldUser.name;
                    } catch {
                      oldValue = "Unknown User";
                    }
                  } else {
                    oldValue = "Unassigned";
                  }
                  
                  if (change.newValue) {
                    try {
                      const newMember = await databases.getDocument(DATABASE_ID, MEMBERS_ID, change.newValue);
                      const newUser = await users.get(newMember.userId);
                      newValue = newUser.name;
                    } catch {
                      newValue = "Unknown User";
                    }
                  } else {
                    newValue = "Unassigned";
                  }
                  break;
                case "serviceId":
                  action = TaskHistoryAction.SERVICE_CHANGED;
                  // Resolve service IDs to names
                  if (change.newValue) {
                    try {
                      const service = await databases.getDocument(DATABASE_ID, SERVICES_ID, change.newValue);
                      newValue = service.name;
                    } catch {
                      newValue = "Unknown Service";
                    }
                  }
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
                action: action as string, // Convert enum to string
                field: change.field,
                oldValue,
                newValue,
                timestamp: new Date().toISOString(),
              };
              await databases.createDocument(
                DATABASE_ID,
                TASK_HISTORY_ID,
                ID.unique(),
                historyData
              );
            }
          } catch (historyError) {
            console.error("Failed to create task history entries:", historyError);
            // Don't fail the task update if history fails
          }
        }

        return c.json({ data: task });
      } catch (error) {
        console.error("Task update error:", error);
        return c.json({ error: error instanceof Error ? error.message : "Failed to update task" }, 500);
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

      // Validate taskId format
      if (!taskId || taskId.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
        return c.json({ error: "Invalid task ID format" }, 400);
      }

      let task: Task;
      try {
        task = await databases.getDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId
        );
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'type' in error && error.type === 'document_not_found') {
          return c.json({ error: "Task not found" }, 404);
        }
        throw error;
      }

      const currentMember = await getMember({
        databases,
        workspaceId: task.workspaceId,
        userId: currentUser.$id
      });

      if (!currentMember) {
        return c.json({ error: "Unathorized" }, 401)
      }

      const service = await databases.getDocument<Service>(
        DATABASE_ID,
        SERVICES_ID,
        task.serviceId,
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
          service,
          assignees,
        },
      });
    }
  )

  .post(
    "/:taskId/follow",
    sessionMiddleware,
    async (c) => {
      try {
        const user = c.get("user");
        const databases = c.get("databases");
        const { taskId } = c.req.param();

        // Validate taskId format
        if (!taskId || taskId.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
          return c.json({ error: "Invalid task ID format" }, 400);
        }

        let task: Task;
        try {
          task = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
          );
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'type' in error && error.type === 'document_not_found') {
            return c.json({ error: "Task not found" }, 404);
          }
          throw error;
        }

        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Add user to followedIds if not already following
        const followedIds = task.followedIds ? JSON.parse(task.followedIds as string) : [];
        if (!followedIds.includes(user.$id)) {
          followedIds.push(user.$id);

          await databases.updateDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
            { followedIds: JSON.stringify(followedIds) }
          );
        }

        return c.json({ data: { isFollowing: true } });
      } catch (error) {
        console.error("Follow task error:", error);
        return c.json({ error: "Failed to follow task" }, 500);
      }
    }
  )

  .post(
    "/:taskId/unfollow",
    sessionMiddleware,
    async (c) => {
      try {
        const user = c.get("user");
        const databases = c.get("databases");
        const { taskId } = c.req.param();

        // Validate taskId format
        if (!taskId || taskId.length > 36 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
          return c.json({ error: "Invalid task ID format" }, 400);
        }

        let task: Task;
        try {
          task = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
          );
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'type' in error && error.type === 'document_not_found') {
            return c.json({ error: "Task not found" }, 404);
          }
          throw error;
        }

        const member = await getMember({
          databases,
          workspaceId: task.workspaceId,
          userId: user.$id,
        });

        if (!member) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Remove user from followedIds
        const followedIds = task.followedIds ? JSON.parse(task.followedIds as string) : [];
        const updatedFollowedIds = followedIds.filter((id: string) => id !== user.$id);

        await databases.updateDocument<Task>(
          DATABASE_ID,
          TASKS_ID,
          taskId,
          { followedIds: JSON.stringify(updatedFollowedIds) }
        );

        return c.json({ data: { isFollowing: false } });
      } catch (error) {
        console.error("Unfollow task error:", error);
        return c.json({ error: "Failed to unfollow task" }, 500);
      }
    }
  )

  .get(
    "/test-followed",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      
      try {
        // Get just a few tasks to test
        const allTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [Query.limit(5)]
        );
        
        console.log("Test endpoint - Found tasks:", allTasks.documents.length);
        console.log("Test endpoint - User ID:", user.$id);
        
        // Check each task's followedIds field
        const taskInfo = allTasks.documents.map(task => ({
          id: task.$id,
          name: task.name,
          followedIds: task.followedIds,
          followedIdsType: typeof task.followedIds,
          hasFollowedIds: 'followedIds' in task
        }));
        
        console.log("Test endpoint - Task info:", taskInfo);
        
        return c.json({ 
          data: {
            userCheck: user.$id,
            taskCount: allTasks.documents.length,
            tasks: taskInfo
          }
        });
      } catch (error) {
        console.error("Test endpoint error:", error);
        return c.json({ error: error instanceof Error ? error.message : "Test failed" }, 500);
      }
    }
  )



export default app;