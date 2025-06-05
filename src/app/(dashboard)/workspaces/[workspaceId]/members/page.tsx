import { getCurrent } from "@/features/auth/queries";
import { MembersList } from "@/features/workspaces/components/members-list";
import { redirect } from "next/navigation";

const WorkspaceIdMembersPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <h1 className="text-lg font-semibold">Workspace Members</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace members and their roles</p>
      </div>
      
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;