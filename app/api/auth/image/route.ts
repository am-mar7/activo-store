import config from "@/lib/config";
import imagekit from "imagekit";
import { NextResponse } from "next/server";

const imageKit = new imagekit({
  publicKey: config.env.imageKit.publicKey,
  privateKey: config.env.imageKit.privateKey,
  urlEndpoint: config.env.imageKit.urlEndpoint,
});

export async function GET() {
  return NextResponse.json(imageKit.getAuthenticationParameters());
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // validate it's a file
    if (!(file instanceof File)) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }
    // convert to base 64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Upload to ImageKit
    const result = await imageKit.upload({
      file: base64,
      fileName: file.name,
      folder: "/uploads",
    });

    return Response.json({
      success: true,
      fileId: result.fileId,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      name: result.name,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Upload failed", details: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
