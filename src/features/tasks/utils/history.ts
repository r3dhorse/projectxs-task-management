import { Task, TaskStatus } from "../types";
import { TaskHistoryAction, TaskHistoryChange } from "../types/history";

// Helper function to normalize empty values
function normalizeValue(value: string | undefined | null): string {
  return value || "";
}

// Helper function to normalize dates for comparison
function normalizeDateForComparison(dateValue: string | undefined | null): string {
  if (!dateValue) return "";
  try {
    // Convert to ISO date string (YYYY-MM-DD) for consistent comparison
    return new Date(dateValue).toISOString().split('T')[0];
  } catch {
    return dateValue || "";
  }
}

export function detectTaskChanges(oldTask: Task, newTask: Partial<Task>): TaskHistoryChange[] {
  const changes: TaskHistoryChange[] = [];

  // Name change
  if (newTask.name !== undefined && normalizeValue(newTask.name) !== normalizeValue(oldTask.name)) {
    changes.push({
      field: "name",
      oldValue: oldTask.name,
      newValue: newTask.name,
      displayName: "Task Name"
    });
  }

  // Status change
  if (newTask.status !== undefined && newTask.status !== oldTask.status) {
    changes.push({
      field: "status",
      oldValue: oldTask.status,
      newValue: newTask.status,
      displayName: "Status"
    });
  }

  // Assignee change - handle empty strings vs null/undefined consistently
  if (newTask.assigneeId !== undefined && normalizeValue(newTask.assigneeId) !== normalizeValue(oldTask.assigneeId)) {
    changes.push({
      field: "assigneeId",
      oldValue: oldTask.assigneeId,
      newValue: newTask.assigneeId,
      displayName: "Assignee"
    });
  }

  // Project change
  if (newTask.projectId !== undefined && normalizeValue(newTask.projectId) !== normalizeValue(oldTask.projectId)) {
    changes.push({
      field: "projectId",
      oldValue: oldTask.projectId,
      newValue: newTask.projectId,
      displayName: "Project"
    });
  }

  // Due date change - use proper date comparison
  if (newTask.dueDate !== undefined && normalizeDateForComparison(newTask.dueDate) !== normalizeDateForComparison(oldTask.dueDate)) {
    changes.push({
      field: "dueDate",
      oldValue: oldTask.dueDate,
      newValue: newTask.dueDate,
      displayName: "Due Date"
    });
  }

  // Description change
  if (newTask.description !== undefined && normalizeValue(newTask.description) !== normalizeValue(oldTask.description)) {
    changes.push({
      field: "description",
      oldValue: oldTask.description || "",
      newValue: newTask.description,
      displayName: "Description"
    });
  }

  // Attachment change
  if (newTask.attachmentId !== undefined && normalizeValue(newTask.attachmentId) !== normalizeValue(oldTask.attachmentId)) {
    changes.push({
      field: "attachmentId",
      oldValue: oldTask.attachmentId || "",
      newValue: newTask.attachmentId,
      displayName: "Attachment"
    });
  }

  return changes;
}

export function formatHistoryMessage(
  action: TaskHistoryAction,
  userName: string,
  field?: string,
  oldValue?: string,
  newValue?: string
): string {
  switch (action) {
    case TaskHistoryAction.CREATED:
      return `${userName} created this task`;
    
    case TaskHistoryAction.STATUS_CHANGED:
      return `${userName} changed status from ${formatStatus(oldValue)} to ${formatStatus(newValue)}`;
    
    case TaskHistoryAction.ASSIGNEE_CHANGED:
      return `${userName} changed assignee from ${formatValue(oldValue, "Unassigned")} to ${formatValue(newValue, "Unassigned")}`;
    
    case TaskHistoryAction.SERVICE_CHANGED:
      return `${userName} moved task to service ${formatValue(newValue)}`;
    
    case TaskHistoryAction.DUE_DATE_CHANGED:
      return `${userName} changed due date from ${formatDate(oldValue)} to ${formatDate(newValue)}`;
    
    case TaskHistoryAction.ATTACHMENT_ADDED:
      return `${userName} added an attachment`;
    
    case TaskHistoryAction.ATTACHMENT_REMOVED:
      return `${userName} removed the attachment`;
    
    case TaskHistoryAction.ATTACHMENT_VIEWED:
      return `${userName} viewed the attachment`;
    
    case TaskHistoryAction.DESCRIPTION_UPDATED:
      return `${userName} updated the description`;
    
    case TaskHistoryAction.NAME_CHANGED:
      return `${userName} changed task name from "${oldValue}" to "${newValue}"`;
    
    default:
      return `${userName} updated the task`;
  }
}

function formatValue(value?: string, fallback = "None"): string {
  if (!value || value === "") return fallback;
  return value;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "None";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

function formatStatus(status?: string): string {
  if (!status) return "None";
  
  switch (status) {
    case TaskStatus.BACKLOG:
      return "Backlog";
    case TaskStatus.TODO:
      return "Todo";
    case TaskStatus.IN_PROGRESS:
      return "In Progress";
    case TaskStatus.IN_REVIEW:
      return "In Review";
    case TaskStatus.DONE:
      return "Done";
    default:
      return status;
  }
}

export function getActionColor(action: TaskHistoryAction): string {
  switch (action) {
    case TaskHistoryAction.CREATED:
      return "bg-green-500";
    case TaskHistoryAction.STATUS_CHANGED:
      return "bg-blue-500";
    case TaskHistoryAction.ASSIGNEE_CHANGED:
      return "bg-purple-500";
    case TaskHistoryAction.SERVICE_CHANGED:
      return "bg-indigo-500";
    case TaskHistoryAction.DUE_DATE_CHANGED:
      return "bg-yellow-500";
    case TaskHistoryAction.ATTACHMENT_ADDED:
    case TaskHistoryAction.ATTACHMENT_REMOVED:
      return "bg-orange-500";
    case TaskHistoryAction.ATTACHMENT_VIEWED:
      return "bg-pink-500";
    case TaskHistoryAction.DESCRIPTION_UPDATED:
    case TaskHistoryAction.NAME_CHANGED:
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
}