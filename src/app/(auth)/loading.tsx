"use client";

import { Loader } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Loader className="size-6 animate-spin text-white" />
    </div>
  );
};

export default LoadingPage;
