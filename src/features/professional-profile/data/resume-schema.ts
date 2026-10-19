import { z } from "zod";
import type { DraftProfile } from "./profile-view";

const text = (max: number) => z.string().trim().max(max);
const url = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:" ||
        parsed.protocol === "mailto:"
      );
    } catch {
      return false;
    }
  }, "Use a valid HTTP(S) or mailto link.");

export const resumeSchema = z.object({
  fullName: text(120),
  headline: text(240),
  targetRole: text(160),
  bio: text(3000),
  sections: z
    .array(
      z.object({
        title: text(80),
        entries: z
          .array(
            z.object({
              title: text(180),
              subtitle: text(180),
              dates: text(100),
              description: text(1800),
              bullets: z.array(text(500)).max(12),
              url,
            }),
          )
          .max(40),
      }),
    )
    .max(12),
});
export type ResumeData = z.infer<typeof resumeSchema>;

export function draftToResumeData(draft: DraftProfile): ResumeData {
  const sections = draft.sectionOrder
    .map((kind) => {
      const title =
        kind === "skill"
          ? "Skills"
          : kind
              .replaceAll("-", " ")
              .replace(/\b\w/g, (letter) => letter.toUpperCase());
      const source =
        kind === "project" ? draft.projects : (draft.elements[kind] ?? []);
      const entries = source
        .filter((item) => item.show_on_resume !== false)
        .map((item) => {
          if (kind === "project" && "title" in item)
            return {
              title: item.title,
              subtitle: "",
              dates: "",
              description: item.summary ?? "",
              bullets: [],
              url: item.url ?? "",
            };
          const element = item as {
            label: string;
            values: Record<string, string>;
          };
          const values = element.values;
          const isExperience = kind === "experience";
          const isEducation = kind === "education";
          return {
            title: isExperience
              ? (values.roleTitle ?? element.label)
              : isEducation
                ? values.degree || element.label
                : element.label,
            subtitle: isExperience
              ? (values.organization ?? "")
              : isEducation
                ? [values.schoolName, values.fieldOfStudy]
                    .filter(Boolean)
                    .join(" · ")
                : "",
            dates: [values.startDate, values.endDate]
              .filter(Boolean)
              .join(" – "),
            description: isExperience ? (values.summary ?? "") : "",
            bullets: kind === "skill" ? [element.label] : [],
            url: values.url ?? "",
          };
        });
      return { title, entries };
    })
    .filter((section) => section.entries.length > 0);
  return resumeSchema.parse({
    fullName: draft.full_name ?? "",
    headline: draft.headline ?? "",
    targetRole: draft.target_role ?? "",
    bio: draft.bio ?? "",
    sections,
  });
}

export function validateResumeData(value: unknown) {
  return resumeSchema.safeParse(value);
}
