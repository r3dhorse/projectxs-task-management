import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetTaskProps {
  taskId: string;
}

export const useGetTask = ({ taskId }: UseGetTaskProps) => {
  const query = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      console.log("useGetTask: Fetching task with ID:", taskId);

      const response = await client.api.tasks[":taskId"].$get({
        param: {
          taskId,
        },
      });

      console.log("useGetTask: Response object:", response);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.error("useGetTask: Failed to fetch task", {
          status: response.status,
          statusText: response.statusText,
          errorBody,
        });
        throw new Error("Failed to fetch task");
      }

      const { data } = await response.json();

      console.log("useGetTask: Fetched task data:", data);

      return data;
    },
  });

  return query;
};
