import { AuthCallbackClient } from "./AuthCallbackClient";

type AuthCallbackPageProps = {
  searchParams?: Promise<{ code?: string }>;
};

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  return <AuthCallbackClient code={params?.code} />;
}
