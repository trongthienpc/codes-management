import { validateRequest } from "@/lib/lucia";
import { NextResponse } from "next/server";

export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    avatarUrl: user.avatarUrl,
    departmentId: user.departmentId,
    role: user.role,
  });
}
