"use client";
import { useState, useTransition } from "react";

type Props = { generate: () => Promise<{ ok: true; pdf: string; fileName: string } | { ok: false; error: string }> };

export function ResumeExportForm({ generate }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return (
    <section className="rounded-xl border border-[#d9d5cb] bg-[#fffdf8] p-5">
      <h2 className="text-xl font-semibold">Resume</h2>
      <p className="mt-1 text-sm text-[#6b7280]">Generate a conservative PDF from your current draft.</p>
      <button className="mt-4 rounded-md bg-[#3157d5] px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={pending} onClick={() => startTransition(async () => {
        setError("");
        const result = await generate();
        if (!result.ok) { setError(result.error); return; }
        const bytes = Uint8Array.from(atob(result.pdf), (char) => char.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        const link = document.createElement("a"); link.href = url; link.download = result.fileName; link.click(); URL.revokeObjectURL(url);
      })}>{pending ? "Generating…" : "Download Resume PDF"}</button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </section>
  );
}
