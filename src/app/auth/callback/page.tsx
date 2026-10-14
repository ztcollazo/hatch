import Script from "next/script";
import { AuthCallbackClient } from "./AuthCallbackClient";

type AuthCallbackPageProps = {
  searchParams?: Promise<{ code?: string }>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  const code = params?.code;
  const completeUrl = code ? "/auth/complete?code=" + encodeURIComponent(code) : "/auth/sign-in";
  const fallbackScript = "setTimeout(function(){if(!window.__magicLinkCallbackStarted){window.location.replace(" + JSON.stringify(completeUrl) + ");}},1500);";

  return (
    <>
      <Script id="magic-link-callback-fallback" strategy="afterInteractive">
        {fallbackScript}
      </Script>
      <AuthCallbackClient code={code} />
    </>
  );
}
