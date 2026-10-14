import { NextResponse, type NextRequest } from "next/server";
import { completeMagicLinkSignIn } from "@/features/auth/callback";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  try {
    await completeMagicLinkSignIn({
      code: requestUrl.searchParams.get("code"),
      tokenHash: requestUrl.searchParams.get("token_hash"),
      type: requestUrl.searchParams.get("type"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Magic Link sign-in failed.";
    const signInUrl = new URL("/auth/sign-in", requestUrl.origin);
    signInUrl.searchParams.set("error", message);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
