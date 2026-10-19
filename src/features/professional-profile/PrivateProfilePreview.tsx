"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import type { DraftProfile } from "./profile-view";
import {
  ProjectShowcaseTemplate,
  RecruiterBriefTemplate,
} from "./ProfileTemplates";

type Template = "recruiter-brief" | "project-showcase";
type Props = { profile: DraftProfile };

export function PrivateProfilePreview({ profile }: Props) {
  const [template, setTemplate] = useState<Template>("recruiter-brief");
  const [fullscreen, setFullscreen] = useState(false);
  const isShowcase = template === "project-showcase";

  const preview = (
    <section
      aria-label="Private Profile Page Preview"
      className={`profile-preview ${fullscreen ? "profile-preview--fullscreen" : ""}`}
    >
      <div className="preview-toolbar">
        <div>
          <p className="preview-toolbar-kicker">Private preview</p>
          <p className="preview-toolbar-note">
            Draft changes are visible only to you until you publish.
          </p>
        </div>
        <div className="preview-toolbar-actions">
          <label className="preview-template-label" htmlFor="preview-template">
            Template
            <select
              id="preview-template"
              value={template}
              onChange={(event) => setTemplate(event.target.value as Template)}
            >
              <option value="recruiter-brief">Recruiter Brief</option>
              <option value="project-showcase">Project Showcase</option>
            </select>
          </label>
          <button
            className="preview-fullscreen-button"
            type="button"
            onClick={() => setFullscreen((value) => !value)}
            aria-pressed={fullscreen}
            aria-label={
              fullscreen ? "Exit fullscreen" : "Open fullscreen preview"
            }
            title={fullscreen ? "Exit fullscreen" : "Open fullscreen preview"}
          >
            {fullscreen ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 3H3v5M3 3l6 6M16 3h5v5M21 3l-6 6M8 21H3v-5M3 21l6-6M16 21h5v-5M21 21l-6-6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        className={`preview-viewport ${isShowcase ? "showcase-site" : "recruiter-site"}`}
      >
        {isShowcase ? (
          <ProjectShowcaseTemplate profile={profile} />
        ) : (
          <RecruiterBriefTemplate profile={profile} />
        )}

      </div>
    </section>
  );

  return fullscreen && typeof document !== "undefined"
    ? createPortal(preview, document.body)
    : preview;
}
