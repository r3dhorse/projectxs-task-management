import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";

import { FollowedTasksClient } from "./client";

interface FollowedTasksPageProps {
  params: {
    workspaceId: string;
  };
}

const FollowedTasksPage = async ({ params }: FollowedTasksPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const initialWorkspace = await getWorkspace({
    workspaceId: params.workspaceId,
  });

  if (!initialWorkspace) {
    redirect("/");
  }

  return <FollowedTasksClient />;
};

export default FollowedTasksPage;