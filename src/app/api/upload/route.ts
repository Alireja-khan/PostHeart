import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save buffer to temporary file with original extension to preserve metadata
    const tempDir = os.tmpdir();
    const ext = path.extname(file.name) || ".mp3";
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}${ext}`);
    await fs.writeFile(tempFilePath, buffer);

    // Upload binary file directly to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'postheart_uploads',
      resource_type: "auto",
    });

    // Clean up temp file
    await fs.unlink(tempFilePath).catch(e => console.error("Temp file cleanup error:", e));

    return NextResponse.json({ 
      success: true, 
      url: uploadResponse.secure_url 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
