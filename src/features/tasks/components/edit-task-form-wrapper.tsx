"use client"

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetServices } from "@/features/services/api/use-get-services";
import { useGetUsers } from "@/features/users/api/use-get-users";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
};

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
    taskId: id,

  });

  const { data: services, isLoading: isLoadingServices } = useGetServices({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
  const { data: users, isLoading: isLoadingUsers } = useGetUsers();

  const serviceOptions = services?.documents.map((service) => ({
    id: service.$id,
    name: service.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const userOptions = users?.users.map((user) => ({
    id: user.$id,
    name: user.name,
  }));

  const isLoading = isLoadingServices || isLoadingMembers || isLoadingTask || isLoadingUsers;

  if (isLoading) {
    return (
      <Card className="w-f h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <LoadingSpinner variant="minimal" size="md" />
        </CardContent>
      </Card>
    )
  }

  if (!initialValues) {
    return null;
  }
  return (
    <EditTaskForm
      onCancel={onCancel}
      initialValues={initialValues}
      serviceOptions={serviceOptions ?? []}
      membertOptions={memberOptions ?? []}
      userOptions={userOptions ?? []}
    />
  );
};