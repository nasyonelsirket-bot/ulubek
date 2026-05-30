import { NextRequest, NextResponse } from "next/server";
import { getOptimizedImagePath } from "@/lib/ai-engine/image-storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const buffer = getOptimizedImagePath(filename);

  if (!buffer) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
