import { NextRequest, NextResponse } from "next/server";
import { uploadAvatar } from "@/lib/actions/upload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const result = await uploadAvatar(formData);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}
