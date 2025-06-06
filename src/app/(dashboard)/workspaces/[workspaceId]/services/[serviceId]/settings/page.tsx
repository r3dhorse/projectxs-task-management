import { getCurrent } from "@/features/auth/queries";
import { EditServiceForm } from "@/features/services/components/edit-service-form";
import { getService } from "@/features/services/queries";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SettingsIcon, FolderIcon } from "lucide-react";
import Link from "next/link";

interface ServiceIdSettingsPageProps {
  params: {
    workspaceId: string;
    serviceId: string;
  };
}

const ServiceIdSettingsPage = async ({
  params,
}: ServiceIdSettingsPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const service = await getService({
    serviceId: params.serviceId,
  });

  if (!service) {
    throw new Error("Service not found");
  }

  return (
    <div className="flex flex-col gap-y-6">
      {/* Enhanced Header */}
      <Card className="w-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button asChild size="sm" variant="secondary">
            <Link href={`/workspaces/${params.workspaceId}/services/${params.serviceId}`}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Service
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl font-bold">Service Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your service configuration and preferences
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Service Overview */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
              {service.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <FolderIcon className="h-4 w-4" />
                <span>Service Configuration</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Service Settings Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-blue-600" />
            Service Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Update your service name and other basic information
          </p>
        </CardHeader>
        <CardContent>
          <EditServiceForm initialValues={service} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceIdSettingsPage;