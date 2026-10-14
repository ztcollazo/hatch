import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  const redirectTo = next.startsWith("/") ? next : "/dashboard";

  // The session cookies must be written to the exact response returned by this
  // route. Using next/headers cookies() and then creating a new redirect
  // response can leave the browser without the cookies created by verifyOtp.
  const response = NextResponse.redirect(`${origin}${redirectTo}`);
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    auth: {
      flowType: "pkce",
      experimental: {
        appendPkceFlowIdToRedirects: true,
      },
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        // Supabase also sends cache-control headers when it updates the
        // session. They must be copied to the response that contains the
        // redirect and auth cookies.
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let error: { message: string } | null = null;
  if (tokenHash) {
    ({ error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type === "recovery" ? "recovery" : "email",
    }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    return NextResponse.redirect(`${origin}/auth/sign-in`);
  }

  if (error) {
    console.error("Error completing auth callback:", error.message);
    return NextResponse.redirect(`${origin}/auth/sign-in?error=callback`);
  }

  return response;
}
