import { describe, expect, it } from "vitest";
import { createResumePdf } from "./resume";

describe("Resume PDF", () => {
  it("creates a conservative PDF containing visible draft content", () => {
    const pdf = createResumePdf({
      fullName: "Maya Chen",
      headline: "Software engineering student",
      targetRole: "Frontend intern",
      bio: "Builds thoughtful products.",
      sections: [
        { title: "Experience", lines: ["Intern — Acme", "Built a useful thing"] },
        { title: "Skills", lines: ["TypeScript · React"] },
      ],
    });

    expect(pdf).toMatch(/^%PDF-1\.4/);
    expect(pdf).toContain("Maya Chen");
    expect(pdf).toContain("Experience");
    expect(pdf).not.toContain("/Type /Image");
  });
});
