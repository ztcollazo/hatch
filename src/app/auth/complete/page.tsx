"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCallbackClient } from "../callback/AuthCallbackClient";

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<p>Completing sign-in…</p>}>
      <AuthCompleteContent />
    </Suspense>
  );
}

function AuthCompleteContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? undefined;

  return <AuthCallbackClient code={code} />;
}
