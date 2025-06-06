"use client"

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetServices } from "@/features/services/api/use-get-services";
import { useGetUsers } from "@/features/users/api/use-get-users";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CreateTaskForm } from "./create-task-form";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
};

export const CreateTaskFormWrapper = ({
  onCancel
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

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

  const isLoading = isLoadingServices || isLoadingMembers || isLoadingUsers;

  if (isLoading) {
    return (
      <Card className="w-f h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <LoadingSpinner variant="minimal" size="md" />
        </CardContent>
      </Card>
    )
  }

  return (
    <CreateTaskForm
      onCancel={onCancel}
      serviceOptions={serviceOptions ?? []}
      membertOptions={memberOptions ?? []}
      userOptions={userOptions ?? []}
      workspaceId={workspaceId}
    />
  );
};