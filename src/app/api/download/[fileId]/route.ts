import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { IMAGES_BUCKET_ID } from "@/config";

interface RouteProps {
  params: {
    fileId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { storage } = await createSessionClient();
    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get file from Appwrite Storage
    const file = await storage.getFileDownload(IMAGES_BUCKET_ID, fileId);

    // Return the file as a response
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document.pdf"`,
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}