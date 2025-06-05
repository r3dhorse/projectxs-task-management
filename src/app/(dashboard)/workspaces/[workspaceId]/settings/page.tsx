import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";

interface WorkspaceIdSettingsPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdSettingsPage = async ({
  params,
}: WorkspaceIdSettingsPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const workspace = await getWorkspace({ workspaceId: params.workspaceId });
  
  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <h1 className="text-lg font-semibold">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace configuration and preferences</p>
      </div>
      
      <div className="w-full lg:max-w-xl">
        <EditWorkspaceForm initialValues={workspace} />
      </div>
    </div>
  );
};

export default WorkspaceIdSettingsPage;