"use client";
import React from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { useEffect, useMemo } from "react";
import { ResumeDocument } from "./ResumeDocument";
import type { ResumeData } from "./resume-schema";

export function ResumePreview({ data }: { data: ResumeData }) {
  const [debounced, setDebounced] = React.useState(data);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(data), 400);
    return () => window.clearTimeout(timer);
  }, [data]);
  const document = useMemo(
    () => <ResumeDocument data={debounced} />,
    [debounced],
  );
  const fileName = `${(debounced.fullName || "resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return (
    <BlobProvider document={document}>
      {({ url, loading, error }) => (
        <section className="profile-preview" aria-label="Resume PDF preview">
          <div className="preview-toolbar">
            <div>
              <p className="preview-toolbar-kicker">Resume preview</p>
              <p className="preview-toolbar-note">
                Draft changes are visible only to you until you publish.
              </p>
            </div>
            <div className="preview-toolbar-actions">
              {url && !loading && !error && (
                <a className="preview-download-button" href={url} download={fileName}>
                  Download PDF
                </a>
              )}
            </div>
          </div>
          {loading ? (
            <div className="preview-viewport resume-pdf-viewport flex items-center justify-center text-sm text-[#6b7280]" role="status">
              Generating PDF preview…
            </div>
          ) : error || !url ? (
            <div className="preview-viewport resume-pdf-viewport flex items-center justify-center text-sm text-red-700" role="alert">
              We couldn’t generate this preview. Check your resume content and try again.
            </div>
          ) : (
            <div className="preview-viewport resume-pdf-viewport">
              <iframe title="Generated resume PDF" src={url} className="h-[620px] w-full border-0" />
            </div>
          )}
        </section>
      )}
    </BlobProvider>
  );
}
