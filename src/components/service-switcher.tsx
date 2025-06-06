"use client";

import { useGetServices } from "@/features/services/api/use-get-services";
import { RiAddCircleFill } from "react-icons/ri";
import {
  SelectTrigger,
  SelectValue,
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useServiceId } from "@/features/services/hooks/use-service-id";
import { useCreateServiceModal } from "@/features/services/hooks/use-create-service-modal";

export const ServiceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const serviceId = useServiceId();
  const router = useRouter();
  const { data: services, isLoading, isError } = useGetServices({ workspaceId });
  const { open } = useCreateServiceModal();
  
  const onSelect = (id: string) => {
    if (id === "all-services") {
      router.push(`/workspaces/${workspaceId}`);
    } else {
      router.push(`/workspaces/${workspaceId}/services/${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Services</p>
        <RiAddCircleFill 
          onClick={open} 
          className="size-6 text-neutral-950 cursor-pointer hover:opacity-75 transition" 
        />
      </div>

      {isLoading ? (
        <div className="w-full h-9 rounded bg-neutral-100 flex items-center justify-center">
          <LoadingSpinner variant="minimal" size="sm" />
        </div>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load services.</p>
      ) : (
        <Select onValueChange={onSelect} value={serviceId || "all-services"}>
          <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all-services"
              className="flex items-center gap-2"
            >
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-bold">
                  All
                </div>
                All Services
              </span>
            </SelectItem>
            {services?.documents?.length ? (
              services.documents.map((service) => (
                <SelectItem
                  key={service.$id}
                  value={service.$id}
                  className="flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {service.name.charAt(0)}
                    </div>
                    {service.name}
                  </span>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1 text-sm text-neutral-500">
                No services available
              </div>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};