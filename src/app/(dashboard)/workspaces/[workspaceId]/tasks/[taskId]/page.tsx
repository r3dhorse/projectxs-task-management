"use client";

import { useState } from "react";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-project";
import { useUpdateTask } from "@/features/tasks/api/use-update-task";
import { useCreateTaskHistory } from "@/features/tasks/api/use-create-task-history";
import { TaskHistoryAction } from "@/features/tasks/types/history";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftIcon, CalendarIcon, FolderIcon, UserIcon, EditIcon, SaveIcon, XIcon, FileTextIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { snakeCaseTotitleCase } from "@/lib/utils";
import { TaskActions } from "@/features/tasks/components/task-actions";
import { DottedSeparator } from "@/components/dotted-separator";
import { TaskDate } from "@/features/tasks/components/task-date";
import { DatePicker } from "@/components/date-picker";
import { TaskStatus } from "@/features/tasks/types";
import { FileUpload } from "@/components/file-upload";
import { TaskHistory } from "@/features/tasks/components/task-history";

interface TaskDetailsPageProps {
  params: {
    workspaceId: string;
    taskId: string;
  };
}

export default function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "" as TaskStatus,
    assigneeId: "",
    projectId: "",
    dueDate: new Date(),
    attachmentId: "",
  });

  // Validate task ID format
  if (!params.taskId || params.taskId.length > 36 || !/^[a-zA-Z0-9_]+$/.test(params.taskId)) {
    console.error("Invalid task ID in URL:", params.taskId);
  }
  
  const { data: task, isLoading: isLoadingTask } = useGetTask({ 
    taskId: params.taskId 
  });
  
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ 
    workspaceId 
  });
  
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ 
    workspaceId 
  });

  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: createHistory } = useCreateTaskHistory();

  const isLoading = isLoadingTask || isLoadingMembers || isLoadingProjects;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-semibold text-gray-900">Task not found</h1>
        <p className="text-gray-600 mt-2">The task you&apos;re looking for doesn&apos;t exist.</p>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeftIcon className="size-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const assignee = members?.documents.find(
    (member) => member.$id === task.assigneeId
  );

  const project = projects?.documents.find(
    (proj) => proj.$id === task.projectId
  );

  // Initialize edit form when entering edit mode
  const handleEditMode = () => {
    if (task) {
      setEditForm({
        name: task.name,
        description: task.description || "",
        status: task.status,
        assigneeId: task.assigneeId,
        projectId: task.projectId,
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        attachmentId: task.attachmentId || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    if (!task) return;

    const updatePayload = {
      name: editForm.name,
      description: editForm.description,
      status: editForm.status,
      assigneeId: editForm.assigneeId,
      projectId: editForm.projectId,
      dueDate: editForm.dueDate.toISOString(),
      attachmentId: editForm.attachmentId, // Send empty string to remove attachment
      workspaceId,
    };


    updateTask(
      {
        param: { taskId: task.$id },
        json: updatePayload,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleViewAttachment = async () => {
    if (!task?.attachmentId) return;

    try {
      // Track the view action
      createHistory({
        json: {
          taskId: task.$id,
          action: TaskHistoryAction.ATTACHMENT_VIEWED,
        }
      });
      
      // Open PDF in new tab for viewing
      const response = await fetch(`/api/download/${task.attachmentId}`);
      if (!response.ok) {
        throw new Error("Failed to load attachment");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab for viewing
      window.open(url, '_blank');
      
      // Clean up the URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Error viewing attachment:", error);
      // Fallback: trigger download instead
      const link = document.createElement("a");
      link.href = `/api/download/${task.attachmentId}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            disabled={isEditing}
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Button>
          {isEditing ? (
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="text-2xl font-semibold h-10 border-none bg-transparent p-0 focus-visible:ring-0"
              placeholder="Task name..."
            />
          ) : (
            <h1 className="text-2xl font-semibold">{task.name}</h1>
          )}
        </div>
        
        <div className="flex items-center gap-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <XIcon className="size-4 mr-2" />
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSaveChanges}
                disabled={isUpdating}
              >
                <SaveIcon className="size-4 mr-2" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              {task.attachmentId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewAttachment}
                >
                  <FileTextIcon className="size-4 mr-2" />
                  View Attachment
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEditMode}
              >
                <EditIcon className="size-4 mr-2" />
                Update
              </Button>
              <TaskActions id={task.$id} projectId={task.projectId}>
                <Button variant="outline" size="sm">
                  Actions
                </Button>
              </TaskActions>
            </>
          )}
        </div>
      </div>

      <DottedSeparator />

      {/* Task Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description..."
                  className="h-[140px] resize-none overflow-y-auto"
                />
              ) : (
                <div className="h-[140px] overflow-y-auto">
                  {task.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task History */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskHistory taskId={task.$id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as TaskStatus }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={task.status}>
                  {snakeCaseTotitleCase(task.status)}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignee</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={editForm.assigneeId}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, assigneeId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.documents.map((member) => (
                      <SelectItem key={member.$id} value={member.$id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-x-2">
                  <UserIcon className="size-4 text-gray-500" />
                  <span className="text-sm">
                    {assignee?.name || "Unassigned"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Project</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={editForm.projectId}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.documents.map((proj) => (
                      <SelectItem key={proj.$id} value={proj.$id}>
                        {proj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-x-2">
                  <FolderIcon className="size-4 text-gray-500" />
                  <span className="text-sm">
                    {project?.name || "No project"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Due Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <DatePicker
                  value={editForm.dueDate}
                  onChange={(date) => setEditForm(prev => ({ ...prev, dueDate: date || new Date() }))}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center gap-x-2">
                  <CalendarIcon className="size-4 text-gray-500" />
                  <TaskDate value={task.dueDate} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Attachment</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <FileUpload
                  onFileUploaded={(fileId) => {
                    setEditForm(prev => ({ ...prev, attachmentId: fileId }));
                  }}
                  onFileRemoved={() => {
                    setEditForm(prev => ({ ...prev, attachmentId: "" }));
                  }}
                  currentFileId={editForm.attachmentId}
                  currentFileName={task.attachmentId ? "attachment.pdf" : undefined}
                  disabled={isUpdating}
                />
              ) : (
                task.attachmentId ? (
                  <FileUpload
                    currentFileId={task.attachmentId}
                    currentFileName="attachment.pdf"
                    disabled={true}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No attachment</p>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}