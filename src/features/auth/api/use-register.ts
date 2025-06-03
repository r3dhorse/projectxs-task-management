import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;

export const useRegister = () => {


  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({

    mutationFn: async ({ json }) => {
      const response = await client.api.auth.register["$post"]({ json });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to register");
      }

      return await response.json();

    },

    onSuccess: () => {
      toast.success("Registered");
      router.refresh();
      queryClient.invalidateQueries();
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to register");
      router.refresh();
    },

  });

  return mutation;
};