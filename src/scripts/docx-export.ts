import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import type { ResumeLocale } from '../schemas/resume';

/**
 * Export a DOCX del CV y de la cover letter, todo del lado del cliente.
 * Recibe la proyeccion del perfil o el CV adaptado (misma forma que resumeSchema)
 * y arma un documento simple, sin estilos de marca.
 */

function text(value: string): Paragraph {
  return new Paragraph({ children: [new TextRun(value)] });
}

function heading(value: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun(value)]
  });
}

function labelLine(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun(value)]
  });
}

function emptyLine(): Paragraph {
  return new Paragraph({ children: [] });
}

/** CV completo (proyeccion del perfil o CV adaptado) a documento DOCX. */
export function buildResumeDocx(resume: ResumeLocale): Document {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.name, bold: true, size: 32 })]
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: resume.title, italics: true })]
    })
  );
  const contactParts = [
    resume.contact.phone,
    resume.contact.email,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github
  ].filter(Boolean);
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: contactParts.join('  |  '), size: 18 })]
    })
  );

  children.push(heading('Summary'));
  for (const para of resume.summary.split(/\n{2,}/)) {
    if (para.trim()) children.push(text(para.trim()));
  }

  children.push(heading('Skills'));
  for (const line of resume.skills) {
    children.push(labelLine(line.category, line.items));
  }

  children.push(heading('Experience'));
  for (const job of resume.experience) {
    children.push(labelLine(job.company, `${job.role} (${job.startDate} - ${job.endDate})`));
    for (const project of job.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${project.name} (${project.startDate} - ${project.endDate})`, italics: true })
          ]
        })
      );
      if (project.url) children.push(text(project.url));
      for (const bullet of project.bullets) {
        children.push(
          new Paragraph({ bullet: { level: 0 }, children: [new TextRun(bullet)] })
        );
      }
      children.push(emptyLine());
    }
  }

  children.push(heading('Education'));
  for (const item of resume.education) {
    children.push(labelLine(item.institution, `${item.degree} (${item.startDate} - ${item.endDate})`));
    if (item.note) children.push(text(item.note));
  }

  if (resume.certifications.length) {
    children.push(heading('Certifications'));
    for (const item of resume.certifications) {
      children.push(labelLine(item.name, item.note ?? ''));
    }
  }

  if (resume.projects.length) {
    children.push(heading('Personal Projects'));
    for (const item of resume.projects) {
      const tail = [item.date, item.url].filter(Boolean).join(' - ');
      children.push(labelLine(item.name, tail));
      children.push(text(item.description));
    }
  }

  return new Document({
    creator: resume.name,
    title: `${resume.name} - ${resume.title}`,
    sections: [{ children }]
  });
}

/** Cover letter (texto plano con parrafos separados por linea en blanco) a DOCX. */
export function buildCoverLetterDocx(input: {
  subject: string | null;
  letter: string;
  empresa: string;
  rol: string;
}): Document {
  const children: Paragraph[] = [];
  if (input.subject) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: input.subject, bold: true, size: 26 })]
      })
    );
    children.push(emptyLine());
  }
  for (const para of input.letter.split(/\n{2,}/)) {
    if (para.trim()) children.push(text(para.trim()));
  }
  return new Document({
    creator: 'Cover letter',
    title: `${input.empresa} - ${input.rol}`,
    sections: [{ children }]
  });
}

/** Descarga un blob como archivo. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadResumeDocx(resume: ResumeLocale, filename: string): Promise<void> {
  const blob = await Packer.toBlob(buildResumeDocx(resume));
  downloadBlob(blob, filename);
}

export async function downloadCoverLetterDocx(
  input: { subject: string | null; letter: string; empresa: string; rol: string },
  filename: string
): Promise<void> {
  const blob = await Packer.toBlob(buildCoverLetterDocx(input));
  downloadBlob(blob, filename);
}
