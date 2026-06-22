import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";

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

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + path.extname(file.name);
    
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filepath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}` 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
