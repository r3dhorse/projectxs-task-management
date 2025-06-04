import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { IMAGES_BUCKET_ID } from "@/config";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { storage } = await createSessionClient();
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Upload to Appwrite Storage
    const uploadedFile = await storage.createFile(
      IMAGES_BUCKET_ID,
      ID.unique(),
      file,
    );

    return NextResponse.json({
      data: uploadedFile,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}