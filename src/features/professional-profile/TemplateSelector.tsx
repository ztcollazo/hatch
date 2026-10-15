"use client";

import { useState } from "react";

export function TemplateSelector({
  selectedTemplate,
}: {
    selectedTemplate: "recruiter-brief" | "project-showcase";
  }) {
  const [template, setTemplate] = useState(selectedTemplate);
  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTemplate(event.target.value as "recruiter-brief" | "project-showcase");
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
