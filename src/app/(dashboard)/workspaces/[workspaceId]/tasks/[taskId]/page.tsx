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
import { TaskDate } from "@/features/tasks/components/task-date";
import { DatePicker } from "@/components/date-picker";
import { TaskStatus } from "@/features/tasks/types";
import { FileUpload } from "@/components/file-upload";
import { TaskHistory } from "@/features/tasks/components/task-history";
import { TaskChat } from "@/features/tasks/components/task-chat";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-200 rounded" />
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-10 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="lg:col-span-2 xl:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg" />
                <div className="h-80 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-96 bg-gray-200 rounded-lg" />
              <div className="h-96 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <FileTextIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Task not found</h1>
                <p className="text-gray-600 max-w-md">
                  The task you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="mt-6 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="size-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          {/* Breadcrumb & Actions Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                disabled={isEditing}
                className="hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="size-4 mr-2" />
                Back
              </Button>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-x-2 text-sm text-gray-600">
                <FolderIcon className="size-4" />
                <span>{project?.name || "No project"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-x-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <XIcon className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {isUpdating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="size-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  {task.attachmentId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleViewAttachment}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <FileTextIcon className="size-4 mr-2" />
                      View Attachment
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditMode}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <EditIcon className="size-4 mr-2" />
                    Edit Task
                  </Button>
                  <TaskActions id={task.$id} projectId={task.projectId}>
                    <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
                      More Actions
                    </Button>
                  </TaskActions>
                </>
              )}
            </div>
          </div>

          {/* Task Title & Status */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-3xl font-bold h-12 border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400"
                    placeholder="Enter task title..."
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 break-words">{task.name}</h1>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                {!isEditing && (
                  <Badge variant={task.status} className="text-sm font-medium px-3 py-1">
                    {snakeCaseTotitleCase(task.status)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Task Meta Info */}
            {!isEditing && (
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <UserIcon className="size-4" />
                  <span>{assignee?.name || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  <TaskDate value={task.dueDate} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Primary Content Area */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            {/* Description Section */}
            <Card className="shadow-lg border-2 border-neutral-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what needs to be done..."
                    className="min-h-[160px] resize-none border-2 border-gray-300/80 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="min-h-[160px] max-h-[300px] overflow-y-auto">
                    {task.description ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 italic">No description provided yet</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card className="shadow-lg border-2 border-neutral-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto">
                  <TaskHistory taskId={task.$id} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1 xl:col-span-1">
            <div className="sticky top-6">
              <TaskChat taskId={task.$id} className="shadow-lg border-2 border-neutral-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300" />
            </div>
          </div>

          {/* Properties Sidebar */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-4">
            <div className="sticky top-6">
              {/* Task Properties */}
              <Card className="shadow-lg border-2 border-neutral-200/60 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-500 rounded-full" />
                    Task Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      Status
                    </label>
                    {isEditing ? (
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as TaskStatus }))}
                      >
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskStatus.BACKLOG}>📋 Backlog</SelectItem>
                          <SelectItem value={TaskStatus.TODO}>📝 Todo</SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>🚀 In Progress</SelectItem>
                          <SelectItem value={TaskStatus.IN_REVIEW}>👀 In Review</SelectItem>
                          <SelectItem value={TaskStatus.DONE}>✅ Done</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-200/60 shadow-sm">
                        <Badge variant={task.status} className="text-sm font-medium px-3 py-1">
                          {snakeCaseTotitleCase(task.status)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Assignee
                    </label>
                    {isEditing ? (
                      <Select
                        value={editForm.assigneeId}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, assigneeId: value }))}
                      >
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {members?.documents.map((member) => (
                            <SelectItem key={member.$id} value={member.$id}>
                              👤 {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60 shadow-sm">
                        <UserIcon className="size-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {assignee?.name || "Unassigned"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      Project
                    </label>
                    {isEditing ? (
                      <Select
                        value={editForm.projectId}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, projectId: value }))}
                      >
                        <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.documents.map((proj) => (
                            <SelectItem key={proj.$id} value={proj.$id}>
                              📁 {proj.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60 shadow-sm">
                        <FolderIcon className="size-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {project?.name || "No project"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Due Date
                    </label>
                    {isEditing ? (
                      <DatePicker
                        value={editForm.dueDate}
                        onChange={(date) => setEditForm(prev => ({ ...prev, dueDate: date || new Date() }))}
                        className="w-full border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/60 shadow-sm">
                        <CalendarIcon className="size-4 text-gray-500" />
                        <TaskDate value={task.dueDate} />
                      </div>
                    )}
                  </div>

                  {/* Attachment */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Attachment
                    </label>
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
                      <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-200/60 shadow-sm">
                        {task.attachmentId ? (
                          <FileUpload
                            currentFileId={task.attachmentId}
                            currentFileName="attachment.pdf"
                            disabled={true}
                          />
                        ) : (
                          <p className="text-sm text-gray-500 text-center">No attachment</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}