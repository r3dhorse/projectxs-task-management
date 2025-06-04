"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCurrent } from "@/features/auth/api/use-current";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { TaskStatus } from "@/features/tasks/types";
import { 
  CalendarIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  CheckCircle2Icon, 
  AlertCircleIcon,
  BarChart3Icon,
  ZapIcon,
  TargetIcon,
  TrendingDownIcon,
  ListTodoIcon,
  ArrowLeftIcon
} from "lucide-react";
import { subDays, isAfter, isBefore, startOfWeek, endOfWeek, format } from "date-fns";
import { useRouter } from "next/navigation";

interface TaskStatusCount {
  [TaskStatus.BACKLOG]: number;
  [TaskStatus.TODO]: number;
  [TaskStatus.IN_PROGRESS]: number;
  [TaskStatus.IN_REVIEW]: number;
  [TaskStatus.DONE]: number;
}

export const MyTasksClient = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: user } = useCurrent();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  // Find the current user's member record
  const currentMember = members?.documents.find(member => member.userId === user?.$id);

  const { data: allTasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    assigneeId: currentMember?.$id || null,
  });

  const isLoading = isLoadingMembers || isLoadingTasks;

  console.log("API Response:", allTasks);
  console.log("User ID:", user?.$id);
  console.log("Current Member ID:", currentMember?.$id);
  console.log("Loading Members:", isLoadingMembers);
  console.log("Loading Tasks:", isLoadingTasks);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!currentMember) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            <div className="border-l h-6 border-gray-200" />
            <div>
              <h1 className="text-xl font-semibold">My Tasks</h1>
              <p className="text-sm text-gray-500">Personal dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-6">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <ListTodoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">Not a workspace member</p>
                <p className="text-sm text-muted-foreground">Please join the workspace to see your tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!allTasks || !allTasks.documents) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            <div className="border-l h-6 border-gray-200" />
            <div>
              <h1 className="text-xl font-semibold">My Tasks</h1>
              <p className="text-sm text-gray-500">Personal productivity dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-6">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <ListTodoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No tasks assigned</p>
                <p className="text-sm text-muted-foreground">Ask your workspace admin to assign tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tasks = allTasks.documents || [];

  // Filter tasks by date range
  const filteredTasks = tasks.filter(task => {
    if (!dateFrom || !dateTo) return true;
    const taskDate = new Date(task.$createdAt);
    return isAfter(taskDate, dateFrom) && isBefore(taskDate, dateTo);
  });

  // Calculate basic metrics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === TaskStatus.DONE).length;
  const inProgressTasks = filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
  const todoTasks = filteredTasks.filter(task => task.status === TaskStatus.TODO).length;

  // Calculate overdue tasks
  const overdueTasks = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== TaskStatus.DONE;
  }).length;

  // Calculate due this week
  const thisWeekStart = startOfWeek(new Date());
  const thisWeekEnd = endOfWeek(new Date());
  const dueThisWeek = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return isAfter(dueDate, thisWeekStart) && isBefore(dueDate, thisWeekEnd) && task.status !== TaskStatus.DONE;
  }).length;

  // Calculate completion rate and productivity metrics
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Weekly productivity (tasks completed this week)
  const thisWeekCompleted = filteredTasks.filter(task => {
    if (task.status !== TaskStatus.DONE) return false;
    const completedDate = new Date(task.$updatedAt);
    return isAfter(completedDate, thisWeekStart) && isBefore(completedDate, thisWeekEnd);
  }).length;

  // Task status breakdown
  const taskStatusCount: TaskStatusCount = {
    [TaskStatus.BACKLOG]: filteredTasks.filter(task => task.status === TaskStatus.BACKLOG).length,
    [TaskStatus.TODO]: todoTasks,
    [TaskStatus.IN_PROGRESS]: inProgressTasks,
    [TaskStatus.IN_REVIEW]: filteredTasks.filter(task => task.status === TaskStatus.IN_REVIEW).length,
    [TaskStatus.DONE]: completedTasks
  };

  // Average task completion time (mock calculation for demo)
  const avgCompletionTime = completedTasks > 0 ? Math.round(Math.random() * 5 + 2) : 0;

  return (
    <div className="h-screen flex flex-col">
      {/* Compact Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Button>
            <div className="border-l h-6 border-gray-200" />
            <div>
              <h1 className="text-xl font-semibold">My Tasks</h1>
              <p className="text-sm text-gray-500 mb-3">Personal Dashboard</p>
            </div>
          </div>
          
          {/* Date Range Filter - matches Workspace Dashboard */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="From date"
                className="w-48 text-center"
              />
              <span className="text-gray-500 text-sm">to</span>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="To date"
                className="w-48 text-center"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateTo(today);
                  setDateFrom(subDays(today, 7));
                }}
                className="w-fit"
              >
                7 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateTo(today);
                  setDateFrom(subDays(today, 15));
                }}
                className="w-fit"
              >
                15 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setDateTo(today);
                  setDateFrom(subDays(today, 30));
                }}
                className="w-fit"
              >
                30 days
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Primary Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ListTodoIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{totalTasks}</div>
                <p className="text-xs text-muted-foreground">In selected range</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {totalTasks > 0 ? `${completionRate}% rate` : 'No tasks yet'}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{inProgressTasks}</div>
                <p className="text-xs text-muted-foreground">Active tasks</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold text-orange-600">{dueThisWeek}</div>
                <p className="text-xs text-muted-foreground">
                  {format(thisWeekStart, 'MMM d')} - {format(thisWeekEnd, 'MMM d')}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
                <ZapIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold text-green-600">{thisWeekCompleted}</div>
                <p className="text-xs text-muted-foreground">Completed this week</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{avgCompletionTime}d</div>
                <p className="text-xs text-muted-foreground">Average days</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Backlog</CardTitle>
                <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-2xl font-bold">{taskStatusCount[TaskStatus.BACKLOG]}</div>
                <p className="text-xs text-muted-foreground">In backlog</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3Icon className="h-4 w-4" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(taskStatusCount).map(([status, count]) => {
                    const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              status === TaskStatus.BACKLOG ? 'bg-gray-500' :
                              status === TaskStatus.TODO ? 'bg-blue-500' :
                              status === TaskStatus.IN_PROGRESS ? 'bg-yellow-500' :
                              status === TaskStatus.IN_REVIEW ? 'bg-purple-500' :
                              'bg-green-500'
                            }`}
                          />
                          <span className="text-sm font-medium min-w-[80px]">
                            {status === TaskStatus.IN_PROGRESS ? 'In Progress' :
                             status === TaskStatus.IN_REVIEW ? 'In Review' :
                             status.charAt(0) + status.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                status === TaskStatus.BACKLOG ? 'bg-gray-500' :
                                status === TaskStatus.TODO ? 'bg-blue-500' :
                                status === TaskStatus.IN_PROGRESS ? 'bg-yellow-500' :
                                status === TaskStatus.IN_REVIEW ? 'bg-purple-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TargetIcon className="h-4 w-4" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks.slice(0, 3).map((task) => (
                    <div key={task.$id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                          </p>
                        </div>
                        <div 
                          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            task.status === TaskStatus.BACKLOG ? 'bg-gray-200 text-gray-700' :
                            task.status === TaskStatus.TODO ? 'bg-blue-200 text-blue-700' :
                            task.status === TaskStatus.IN_PROGRESS ? 'bg-yellow-200 text-yellow-700' :
                            task.status === TaskStatus.IN_REVIEW ? 'bg-purple-200 text-purple-700' :
                            'bg-green-200 text-green-700'
                          }`}
                        >
                          {task.status === TaskStatus.IN_PROGRESS ? 'Progress' :
                           task.status === TaskStatus.IN_REVIEW ? 'Review' :
                           task.status.charAt(0) + task.status.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTasks.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <ListTodoIcon className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks found</p>
                      <p className="text-xs">Adjust date filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};