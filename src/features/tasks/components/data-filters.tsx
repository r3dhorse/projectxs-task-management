import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetServices } from "@/features/services/api/use-get-services";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-task-filters";

export const DataFilters = () => {
  const workspaceId = useWorkspaceId();

  const { data: services, isLoading: isLoadingServices } = useGetServices({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

  const isLoading = isLoadingMembers || isLoadingServices;

  const serviceOptions = services?.documents.map((service) => ({
    value: service.$id,
    label: service.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    value: member.$id,
    label: member.name,
  }));

  const [{
    status,
    assigneeId,
    serviceId,
    dueDate
  }, setFilters] = useTaskFilters();

  const onStatusChange = (value: string) => { setFilters({ status: value === "all" ? null : (value as TaskStatus), }); };
  const onAssigneeChange = (value: string) => { setFilters({ assigneeId: value === "all" ? null : (value as string), }); };
  const onServiceChange = (value: string) => { setFilters({ serviceId: value === "all" ? null : (value as string), }); };



  if (isLoading) return null;
  return (
    <div className="flex flex-col lg:flex-row gap-2">

      <Select
        defaultValue={status ?? undefined}
        onValueChange={(value) => onStatusChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <ListChecksIcon className="size-4 mr-2" />
            <SelectValue placeholder="All statuses" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all"> All </SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.BACKLOG} >Backlog</SelectItem>
          <SelectItem value={TaskStatus.TODO} >Todo</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS} >In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW} >In Review</SelectItem>
          <SelectItem value={TaskStatus.DONE} >Done</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={(value) => onAssigneeChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <UserIcon className="size-4 mr-2" />
            <SelectValue placeholder="All assignees" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all"> All assignees</SelectItem>
          <SelectSeparator />
          {memberOptions?.map((member) => (
            <SelectItem key={member.value} value={member.value}>
              {member.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={serviceId ?? undefined}
        onValueChange={(value) => onServiceChange(value)}
      >
        <SelectTrigger className="w-full lg:w-auto h-8">
          <div className="flex items-center pr-2">
            <FolderIcon className="size-4 mr-2" />
            <SelectValue placeholder="All services" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all"> All services</SelectItem>
          <SelectSeparator />
          {serviceOptions?.map((service) => (
            <SelectItem key={service.value} value={service.value}>
              {service.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DatePicker
        placeholder="Due date"
        className="h-8 w-full lg:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({ dueDate: date ? date.toISOString() : null })
        }}


      />
    </div>
  );
};