import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>;

export const useUpdateTask = () => {
  const router = useRouter();
  const queryClient = useQueryClient();


  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({

    mutationFn: async ({ json, param }) => {
      const response = await client.api.tasks[":taskId"]["$patch"]({ json, param, });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update task");
      }
      return await response.json();
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },

    onSuccess: ({ data }) => {
      router.refresh();
      toast.success("Task update");
      queryClient.invalidateQueries();
    },

  });
  return mutation;
};