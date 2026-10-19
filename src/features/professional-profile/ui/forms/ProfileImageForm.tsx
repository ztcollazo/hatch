"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type Props = {
  profileId: string;
  initialImage: {
    path: string;
    altText: string;
    showOnProfilePage: boolean;
    showOnResume: boolean;
  } | null;
  saveAction: (
    path: string,
    altText: string,
    visibility: { showOnProfilePage: boolean; showOnResume: boolean },
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  removeAction: () => Promise<{ ok: true } | { ok: false; error: string }>;
  updateVisibilityAction: (visibility: {
    showOnProfilePage: boolean;
    showOnResume: boolean;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function ProfileImageForm({
  profileId,
  initialImage,
  saveAction,
  removeAction,
  updateVisibilityAction: updateVisibilityAction,
}: Props) {
  const [image, setImage] = useState(initialImage);
  const [altText, setAltText] = useState(initialImage?.altText ?? "");
  const [showOnProfilePage, setShowOnProfilePage] = useState(
    initialImage?.showOnProfilePage ?? true,
  );
  const [showOnResume, setShowOnResume] = useState(
    initialImage?.showOnResume ?? false,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    setMessage(null);
    startTransition(async () => {
      if (!file.type.startsWith("image/"))
        return setMessage("Please choose an image file.");
      if (file.size > 5 * 1024 * 1024)
        return setMessage("Profile images must be 5 MB or smaller.");
      const path = `profiles/${profileId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error } = await createClient()
        .storage.from("images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) return setMessage(error.message);
      const result = await saveAction(path, altText.trim() || "Profile image", {
        showOnProfilePage,
        showOnResume,
      });
      if (!result.ok) return setMessage(result.error);
      setImage({
        path,
        altText: altText.trim() || "Profile image",
        showOnProfilePage,
        showOnResume,
      });
      setMessage(
        "Profile image saved. Publish your profile to show it publicly.",
      );
    });
  }

  function updateOutputVisibility(next: {
    showOnProfilePage: boolean;
    showOnResume: boolean;
  }) {
    setShowOnProfilePage(next.showOnProfilePage);
    setShowOnResume(next.showOnResume);
    startTransition(async () => {
      const result = await updateVisibilityAction(next);
      if (!result.ok) setMessage(result.error);
    });
  }

  function removeImage() {
    startTransition(async () => {
      const result = await removeAction();
      if (!result.ok) return setMessage(result.error);
      setImage(null);
      setAltText("");
      setMessage("Profile image removed.");
    });
  }

  const publicUrl = image
    ? createClient().storage.from("images").getPublicUrl(image.path).data
        .publicUrl
    : null;
  return (
    <section className="mt-8 rounded-2xl bg-slate-900 p-5">
      <h2 className="text-xl font-bold">Profile image</h2>
      <p className="mt-1 text-sm text-slate-300">
        Optional. It appears publicly only after you publish.
      </p>
      {publicUrl && (
        <div className="flex items-center gap-4">
          <Image
            src={publicUrl}
            alt={image?.altText ?? "Profile image"}
            width={96}
            height={96}
            className="mt-4 h-24 w-24 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnProfilePage}
                onChange={(event) =>
                  updateOutputVisibility({
                    showOnProfilePage: event.target.checked,
                    showOnResume,
                  })
                }
              />{" "}
              Show on my profile
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnResume}
                onChange={(event) =>
                  updateOutputVisibility({
                    showOnProfilePage,
                    showOnResume: event.target.checked,
                  })
                }
              />{" "}
              Show on resume
            </label>
          </div>
        </div>
      )}
      <label className="mt-4 block text-sm font-semibold">
        Alt text
        <input
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>
      <label className="mt-4 inline-block cursor-pointer rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950">
        {image ? "Replace image" : "Upload image"}
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </label>
      {image && (
        <>
          <button
            type="button"
            onClick={removeImage}
            disabled={pending}
            className="ml-3 rounded-full border border-white/20 px-5 py-3 font-semibold"
          >
            Remove
          </button>
        </>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm text-emerald-200">
          {message}
        </p>
      )}
    </section>
  );
}
