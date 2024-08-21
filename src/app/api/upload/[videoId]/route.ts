import { env } from "@/env";
import { db } from "@/server/db";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse, type NextRequest } from "next/server";

// Configure Cloudinary
cloudinary.config({
  secure: true,
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { videoId: string } },
): Promise<NextResponse> {
  try {
    const body = (await req.json()) as string[];
    const videoId = params.videoId;

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { message: "No files provided or invalid data." },
        { status: 400 },
      );
    }

    // Upload images to Cloudinary
    const uploadPromises = body.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file, {
          folder: "video",
          resource_type: "image",
          upload_preset: "ml_image",
        });
        return result;
      } catch (err) {
        console.error("Error uploading file:", err);
        throw err;
      }
    });

    const updateVideo = async (urls: string[]) => {
      await db.video.update({
        where: {
          id: videoId,
        },
        data: {
          spriteThumbnails: {
            push: urls,
          },
        },
      });
    };

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    await updateVideo(results.map((result) => result.secure_url));

    // Return success response with results
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
