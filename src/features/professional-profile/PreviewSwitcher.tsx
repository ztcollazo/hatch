"use client";

import { useState } from "react";
import type { DraftProfile } from "./profile-view";
import { PrivateProfilePreview } from "./PrivateProfilePreview";
import ResumePreview from "./ResumeLoader";
import type { ResumeData } from "./resume-schema";

type Props = { profile: DraftProfile; resume: ResumeData };

type PreviewMode = "website" | "resume";

export function PreviewSwitcher({ profile, resume }: Props) {
  const [mode, setMode] = useState<PreviewMode>("website");

  return (
    <section aria-label="Profile previews">
      <div className="mb-4 flex rounded-lg border border-[#d9d5cb] bg-[#fffdf8] p-1 mt-4" role="tablist" aria-label="Preview type">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "website"}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${mode === "website" ? "bg-[#172033] text-white" : "text-[#6b7280] hover:bg-[#f0eee8]"}`}
          onClick={() => setMode("website")}
        >
          Website preview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "resume"}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${mode === "resume" ? "bg-[#172033] text-white" : "text-[#6b7280] hover:bg-[#f0eee8]"}`}
          onClick={() => setMode("resume")}
        >
          Resume PDF preview
        </button>
      </div>
      {mode === "website" ? <PrivateProfilePreview profile={profile} /> : <ResumePreview resume={resume} />}
    </section>
  );
}
