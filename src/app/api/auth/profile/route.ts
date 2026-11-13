import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/db";
import UserProfile from "@/models/UserProfile";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(250).optional(),
  timezone: z.string().min(1).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const json = await req.json();
    const data = UpdateProfileSchema.parse(json);

    await dbConnect();
    const profile = await UserProfile.findOneAndUpdate(
      { userId: session.userId },
      { $set: data },
      { new: true, upsert: true }
    );

    return successResponse(profile, "Profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

