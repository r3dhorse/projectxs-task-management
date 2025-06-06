import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetFollowedTasksProps {
  workspaceId: string;
  serviceId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  dueDate?: string | null;
}

export const useGetFollowedTasks = ({
  workspaceId,
  serviceId,
  status,
  search,
  dueDate,
}: UseGetFollowedTasksProps) => {
  const query = useQuery({
    queryKey: [
      "followed-tasks",
      workspaceId,
      serviceId,
      status,
      search,
      dueDate,
    ],
    queryFn: async () => {
      console.log("Fetching followed tasks with params:", {
        workspaceId,
        serviceId,
        status,
        search,
        dueDate,
      });

      try {
        const response = await client.api.tasks.followed.$get({
          query: {
            workspaceId,
            serviceId: serviceId ?? undefined,
            status: status ?? undefined,
            search: search ?? undefined,
            dueDate: dueDate ?? undefined,
          },
        });

        console.log("Followed tasks response status:", response.status);
        console.log("Followed tasks response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Followed tasks API error:", errorText);
          throw new Error(`Failed to fetch followed tasks: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log("Followed tasks API response:", result);
        return result.data;
      } catch (error) {
        console.error("Error in followed tasks API call:", error);
        throw error;
      }
    },
  });

  return query;
};