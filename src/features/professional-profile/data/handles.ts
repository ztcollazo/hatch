export type HandleValidationResult =
  { ok: true; handle: string } | { ok: false; error: string };
export type HandleClaimResult =
  { ok: true; handle: string } | { ok: false; error: string };

const RESERVED_HANDLES = new Set([
  "auth",
  "dashboard",
  "preview",
  "api",
  "admin",
  "www",
  "u",
  "sign-in",
  "settings",
]);

export function validateHandle(input: string): HandleValidationResult {
  const handle = input.trim().toLowerCase();

  if (handle !== input.trim())
    return {
      ok: false,
      error: "Handle must use lowercase URL-safe characters.",
    };
  if (RESERVED_HANDLES.has(handle))
    return { ok: false, error: "That Reserved Handle cannot be claimed." };
  if (!/^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])$/.test(handle)) {
    return {
      ok: false,
      error:
        "Handle must be 3-30 lowercase letters, numbers, dots, underscores, or hyphens, and start and end with a letter or number.",
    };
  }

  return { ok: true, handle };
}

type HandleSupabaseClient = {
  from: (table: "professional_profiles") => {
    update: (values: { handle: string }) => {
      eq: (
        column: "id",
        value: string,
      ) => {
        is: (
          column: "handle",
          value: null,
        ) => {
          select: (columns: string) => {
            single: () => Promise<{
              data: { handle: string } | null;
              error: { code?: string; message: string } | null;
            }>;
          };
        };
      };
    };
  };
};

export async function claimHandle(
  supabase: HandleSupabaseClient,
  profileId: string,
  currentHandle: string | null,
  requestedHandle: string,
): Promise<HandleClaimResult> {
  if (currentHandle)
    return { ok: false, error: "Handle changes are not supported in the MVP." };

  const validation = validateHandle(requestedHandle);
  if (!validation.ok) return validation;

  const { data, error } = await supabase
    .from("professional_profiles")
    .update({ handle: validation.handle })
    .eq("id", profileId)
    .is("handle", null)
    .select("handle")
    .single();

  if (error?.code === "23505")
    return { ok: false, error: "That Handle is already claimed. Try another." };
  if (error) return { ok: false, error: error.message };
  if (!data)
    return {
      ok: false,
      error: "Handle could not be claimed. Refresh and try again.",
    };

  return { ok: true, handle: data.handle };
}
