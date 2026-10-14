import { NextResponse, type NextRequest } from "next/server";
import { completeMagicLinkSignIn } from "@/features/auth/callback";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) await completeMagicLinkSignIn(code);

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
