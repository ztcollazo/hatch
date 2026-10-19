"use client";

import dynamic from "next/dynamic";
import type { ResumeData } from "../../data/resume-schema";

const ResumePreview = dynamic(
  async () => (await import("./ResumePreview")).ResumePreview,
  {
    ssr: false,
    loading: () => <p>Loading PDF preview...</p>,
  },
);

export default function ResumePreviewLoader({
  resume,
}: {
  resume: ResumeData;
}) {
  return <ResumePreview data={resume} />;
}
