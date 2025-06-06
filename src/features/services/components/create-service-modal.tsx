"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateServiceForm } from "./create-service-form"
import { useCreateServiceModal } from "../hooks/use-create-service-modal";

export const CreateServiceModal = () => {

  const { isOpen, setIsOpen, close } = useCreateServiceModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateServiceForm onCancel={close} />
    </ResponsiveModal >
  );
};