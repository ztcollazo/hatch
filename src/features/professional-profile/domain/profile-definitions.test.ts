import { describe, expect, it } from "vitest";
import {
  defaultSectionOrder,
  profileElementDefinitionByKind,
  profileElementDefinitions,
} from "./profile-definitions";

describe("Professional Profile element definitions", () => {
  it("keeps every editable Profile Section mapped to one persistence table", () => {
    expect(profileElementDefinitions).toHaveLength(6);
    expect(defaultSectionOrder).toEqual([
      "education",
      "experience",
      "skill",
      "project",
      "professional-link",
      "contact",
    ]);
    expect(profileElementDefinitionByKind.project.table).toBe(
      "profile_projects",
    );
  });

  it("provides database mappings for each form field", () => {
    expect(profileElementDefinitionByKind.education.fields).toContainEqual({
      key: "fieldOfStudy",
      column: "field_of_study",
      label: "Field of study",
    });
    expect(profileElementDefinitionByKind.experience.requiredColumn).toBe(
      "role_title",
    );
  });
});
