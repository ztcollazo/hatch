"use client";

import { useState } from "react";
import { saveProfileTemplate } from "./actions";

export function TemplateSelector({
  profileId,
  selectedTemplate,
}: {
    profileId: string;
    selectedTemplate: "recruiter-brief" | "project-showcase";
  }) {
  const [template, setTemplate] = useState(selectedTemplate);
  const handleTemplateChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplate = event.target.value as "recruiter-brief" | "project-showcase";
    setTemplate(newTemplate);
    await saveProfileTemplate(profileId, newTemplate);
  };

  return (
    <label className="preview-template-label">
      Published template
      <select name="template" value={template} onChange={handleTemplateChange} className="preview-template-select">
        <option value="recruiter-brief">Recruiter Brief</option>
        <option value="project-showcase">Project Showcase</option>
      </select>
    </label>
  );
}
