import type { ProfileElementKind } from "./profile-types";

export type ProfileField = {
  key: string;
  column: string;
  label: string;
};

export type ProfileElementDefinition = {
  kind: ProfileElementKind;
  table: string;
  title: string;
  labelColumn: string;
  requiredColumn: string;
  fields: readonly ProfileField[];
};

export const profileElementDefinitions: readonly ProfileElementDefinition[] = [
  {
    kind: "education",
    table: "profile_education",
    title: "Education",
    labelColumn: "school_name",
    requiredColumn: "school_name",
    fields: [
      { key: "schoolName", column: "school_name", label: "School name" },
      { key: "degree", column: "degree", label: "Degree" },
      { key: "fieldOfStudy", column: "field_of_study", label: "Field of study" },
      { key: "startDate", column: "start_date", label: "Start date" },
      { key: "endDate", column: "end_date", label: "End date" },
    ],
  },
  {
    kind: "experience",
    table: "profile_experience",
    title: "Experience",
    labelColumn: "role_title",
    requiredColumn: "role_title",
    fields: [
      { key: "roleTitle", column: "role_title", label: "Role title" },
      { key: "organization", column: "organization", label: "Organization" },
      { key: "summary", column: "summary", label: "Summary" },
      { key: "startDate", column: "start_date", label: "Start date" },
      { key: "endDate", column: "end_date", label: "End date" },
    ],
  },
  {
    kind: "skill",
    table: "profile_skill_tags",
    title: "Skill tag",
    labelColumn: "label",
    requiredColumn: "label",
    fields: [{ key: "label", column: "label", label: "Skill" }],
  },
  {
    kind: "project",
    table: "profile_projects",
    title: "Project",
    labelColumn: "title",
    requiredColumn: "title",
    fields: [
      { key: "title", column: "title", label: "Title" },
      { key: "summary", column: "summary", label: "Summary" },
      { key: "url", column: "url", label: "URL" },
    ],
  },
  {
    kind: "professional-link",
    table: "profile_public_professional_links",
    title: "Professional link",
    labelColumn: "label",
    requiredColumn: "label",
    fields: [
      { key: "label", column: "label", label: "Label" },
      { key: "url", column: "url", label: "URL" },
      { key: "linkType", column: "link_type", label: "Link type" },
    ],
  },
  {
    kind: "contact",
    table: "profile_contact_actions",
    title: "Contact action",
    labelColumn: "label",
    requiredColumn: "label",
    fields: [
      { key: "label", column: "label", label: "Label" },
      { key: "url", column: "url", label: "URL" },
      { key: "actionType", column: "action_type", label: "Action type" },
    ],
  },
];

export const profileElementDefinitionByKind = Object.fromEntries(
  profileElementDefinitions.map((definition) => [definition.kind, definition]),
) as Record<ProfileElementKind, ProfileElementDefinition>;

export const defaultSectionOrder: ProfileElementKind[] =
  profileElementDefinitions.map(({ kind }) => kind);
