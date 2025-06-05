"use client";

import { useState } from "react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { CalendarIcon, UsersIcon, CheckCircle2Icon, Clock3Icon, ListTodoIcon, BarChart3Icon } from "lucide-react";
import { TaskStatus } from "@/features/tasks/types";
import { Models } from "node-appwrite";
import { subDays, isAfter, isBefore } from "date-fns";
import { DottedSeparator } from "@/components/dotted-separator";
import { UserButton } from "@/features/auth/components/user-button";

interface TaskStatusCount {
  [TaskStatus.BACKLOG]: number;
  [TaskStatus.TODO]: number;
  [TaskStatus.IN_PROGRESS]: number;
  [TaskStatus.IN_REVIEW]: number;
  [TaskStatus.DONE]: number;
}

interface MemberPerformance {
  id: string;
  name: string;
  tasksCompleted: number;
  tasksInProgress: number;
  totalTasks: number;
  completionRate: number;
}

interface PopulatedTask extends Models.Document {
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  projectId: string;
  position: number;
  dueDate: string;
  description?: string;
  attachmentId?: string;
  project?: Models.Document;
  assignees?: Models.Document[];
}

const WorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    assigneeId: null,
    projectId: null,
    status: null,
    search: null,
    dueDate: null,
  });

  const isLoading = isLoadingMembers || isLoadingTasks;

  // Filter tasks by date range
  // @ts-expect-error - Tasks are enriched with project and assignees from the API
  const filteredTasks = (tasks?.documents.filter((task) => {
    if (!dateFrom || !dateTo) return true;
    const taskDate = new Date(task.$createdAt);
    return isAfter(taskDate, dateFrom) && isBefore(taskDate, dateTo);
  }) || []) as PopulatedTask[];

  // Calculate statistics
  const totalMembers = members?.documents.length || 0;
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === TaskStatus.DONE).length;
  const inProgressTasks = filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;

  // Calculate task status breakdown
  const taskStatusCount: TaskStatusCount = {
    [TaskStatus.BACKLOG]: filteredTasks.filter(task => task.status === TaskStatus.BACKLOG).length,
    [TaskStatus.TODO]: filteredTasks.filter(task => task.status === TaskStatus.TODO).length,
    [TaskStatus.IN_PROGRESS]: inProgressTasks,
    [TaskStatus.IN_REVIEW]: filteredTasks.filter(task => task.status === TaskStatus.IN_REVIEW).length,
    [TaskStatus.DONE]: completedTasks
  };

  // Calculate member performance
  const memberPerformance: MemberPerformance[] = members?.documents.map(member => {
    const memberTasks = filteredTasks.filter(task => task.assigneeId === member.$id);
    const memberCompletedTasks = memberTasks.filter(task => task.status === TaskStatus.DONE).length;
    const memberInProgressTasks = memberTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const memberTotalTasks = memberTasks.length;
    const completionRate = memberTotalTasks > 0 ? (memberCompletedTasks / memberTotalTasks) * 100 : 0;

    return {
      id: member.$id,
      name: member.name,
      tasksCompleted: memberCompletedTasks,
      tasksInProgress: memberInProgressTasks,
      totalTasks: memberTotalTasks,
      completionRate
    };
  })
    .sort((a, b) => b.completionRate - a.completionRate) || [];

  const topPerformers = memberPerformance.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Workspace Dashboard</h1>
            <p className="text-gray-600">Overview of your workspace metrics and performance</p>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-gray-500" />
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
        
        {/* User Button at top-most right */}
        <div className="flex-shrink-0">
          <UserButton />
        </div>
      </div>

      <DottedSeparator />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active workspace members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              In selected date range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% completion rate` : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently active tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(taskStatusCount).map(([status, count]) => {
                const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          status === TaskStatus.BACKLOG ? 'bg-gray-500' :
                          status === TaskStatus.TODO ? 'bg-blue-500' :
                          status === TaskStatus.IN_PROGRESS ? 'bg-yellow-500' :
                          status === TaskStatus.IN_REVIEW ? 'bg-purple-500' :
                          'bg-green-500'
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {status === TaskStatus.IN_PROGRESS ? 'In Progress' :
                         status === TaskStatus.IN_REVIEW ? 'In Review' :
                         status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status === TaskStatus.BACKLOG ? 'bg-gray-500' :
                            status === TaskStatus.TODO ? 'bg-blue-500' :
                            status === TaskStatus.IN_PROGRESS ? 'bg-yellow-500' :
                            status === TaskStatus.IN_REVIEW ? 'bg-purple-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.length > 0 ? (
                topPerformers.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-600">
                          {member.tasksCompleted} completed, {member.tasksInProgress} in progress
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {member.completionRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {member.totalTasks} total tasks
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No member performance data available</p>
                  <p className="text-xs">Assign tasks to members to see performance metrics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkspaceIdPage;