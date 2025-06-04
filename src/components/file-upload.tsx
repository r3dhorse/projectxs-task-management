"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileTextIcon, XIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { ID } from "node-appwrite";

interface FileUploadProps {
  onFileUploaded?: (fileId: string, fileName: string) => void;
  onFileRemoved?: () => void;
  currentFileId?: string;
  currentFileName?: string;
  disabled?: boolean;
}

export const FileUpload = ({
  onFileUploaded,
  onFileRemoved,
  currentFileId,
  currentFileName,
  disabled = false,
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    name: string;
  } | null>(
    currentFileId && currentFileName
      ? { id: currentFileId, name: currentFileName }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileId", ID.unique());

      // Upload file using the RPC client
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      
      const uploadedFileData = {
        id: result.data.$id,
        name: file.name,
      };

      setUploadedFile(uploadedFileData);
      onFileUploaded?.(uploadedFileData.id, uploadedFileData.name);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onFileRemoved?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadFile = async () => {
    if (!uploadedFile) return;

    try {
      const response = await fetch(`/api/download/${uploadedFile.id}`);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = uploadedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download error:", error);
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Attachment (PDF only)</Label>
      
      {uploadedFile ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <FileTextIcon className="size-4 text-red-500" />
                <span className="text-sm font-medium truncate">
                  {uploadedFile.name}
                </span>
              </div>
              <div className="flex items-center gap-x-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFile}
                  disabled={disabled}
                >
                  Download
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={disabled}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="cursor-pointer"
          />
          {isUploading && (
            <div className="flex items-center gap-x-2 text-sm text-gray-600">
              <LoaderIcon className="size-4 animate-spin" />
              Uploading file...
            </div>
          )}
          <p className="text-xs text-gray-500">
            Only PDF files up to 10MB are allowed
          </p>
        </div>
      )}
    </div>
  );
};