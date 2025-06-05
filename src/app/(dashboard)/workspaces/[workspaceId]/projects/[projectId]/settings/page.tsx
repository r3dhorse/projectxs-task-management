import { getCurrent } from "@/features/auth/queries";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { getProject } from "@/features/projects/queries";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SettingsIcon, FolderIcon } from "lucide-react";
import Link from "next/link";

interface ProjectIdSettingsPageProps {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

const ProjectIdSettingsPage = async ({
  params,
}: ProjectIdSettingsPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const project = await getProject({
    projectId: params.projectId,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return (
    <div className="flex flex-col gap-y-6">
      {/* Enhanced Header */}
      <Card className="w-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/workspaces/${params.workspaceId}/projects/${params.projectId}`}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Project
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl font-bold">Project Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your project configuration and preferences
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <FolderIcon className="h-4 w-4" />
                <span>Project Configuration</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Project Settings Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-blue-600" />
            Project Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your project name and other basic information
          </p>
        </CardHeader>
        <CardContent>
          <EditProjectForm initialValues={project} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectIdSettingsPage;