export type ResumeSection = { title: string; lines: string[] };
export type ResumeInput = {
  fullName: string;
  headline?: string | null;
  targetRole?: string | null;
  bio?: string | null;
  sections: ResumeSection[];
};

const escapePdf = (value: string) =>
  value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");

/** Builds a small, dependency-free, single-page conservative Resume PDF. */
export function createResumePdf(input: ResumeInput): string {
  const lines = [input.fullName, input.headline, input.targetRole, input.bio]
    .filter((line): line is string => Boolean(line?.trim()))
    .concat(input.sections.flatMap((section) => [section.title, ...section.lines]));
  const commands = ["BT", "/F1 11 Tf", "50 750 Td"];
  lines.slice(0, 48).forEach((line, index) => {
    if (index) commands.push("0 -16 Td");
    commands.push(`(${escapePdf(line.slice(0, 110))}) Tj`);
  });
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const startxref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  return `${pdf}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`;
}
