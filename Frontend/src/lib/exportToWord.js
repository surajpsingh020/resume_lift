import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const exportResumeToWord = async (resumeInfo) => {
  const doc = new Document({
    sections: [{
      children: [
        // Name
        new Paragraph({
          children: [
            new TextRun({
              text: `${resumeInfo.firstName} ${resumeInfo.lastName}`.toUpperCase(),
              bold: true,
              size: 32,
              color: resumeInfo.themeColor || "000000",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),

        // Job Title
        new Paragraph({
          children: [
            new TextRun({
              text: resumeInfo.jobTitle || "",
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),

        // Contact Info
        new Paragraph({
          children: [
            new TextRun({
              text: `${resumeInfo.email || ""} | ${resumeInfo.phone || ""} | ${resumeInfo.address || ""}`,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),

        // Professional Summary
        ...(resumeInfo.summary
          ? [
              new Paragraph({
                text: "PROFESSIONAL SUMMARY",
                heading: HeadingLevel.HEADING_1,
                thematicBreak: true,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: stripHtml(resumeInfo.summary),
                    size: 22,
                  }),
                ],
                spacing: { after: 300 },
              }),
            ]
          : []),

        // Experience
        ...(resumeInfo.experience && resumeInfo.experience.length > 0
          ? [
              new Paragraph({
                text: "WORK EXPERIENCE",
                heading: HeadingLevel.HEADING_1,
                thematicBreak: true,
                spacing: { before: 200, after: 200 },
              }),
              ...resumeInfo.experience.flatMap((exp) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.title || "",
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${exp.companyName || ""} | ${formatMonthYear(exp.startDate)} - ${formatMonthYear(exp.endDate)}`,
                      size: 20,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: stripHtml(exp.workSummary),
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ]),
            ]
          : []),

        // Projects
        ...(resumeInfo.projects && resumeInfo.projects.length > 0
          ? [
              new Paragraph({
                text: "PERSONAL PROJECTS",
                heading: HeadingLevel.HEADING_1,
                thematicBreak: true,
                spacing: { before: 200, after: 200 },
              }),
              ...resumeInfo.projects.flatMap((proj) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: proj.projectName || "",
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Tech Stack: ${proj.techStack || ""}`,
                      size: 20,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: stripHtml(proj.projectSummary),
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ]),
            ]
          : []),

        // Education
        ...(resumeInfo.education && resumeInfo.education.length > 0
          ? [
              new Paragraph({
                text: "EDUCATION",
                heading: HeadingLevel.HEADING_1,
                thematicBreak: true,
                spacing: { before: 200, after: 200 },
              }),
              ...resumeInfo.education.flatMap((edu) => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.universityName || "",
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.degree || ""} in ${edu.major || ""} | ${formatMonthYear(edu.startDate)} - ${formatMonthYear(edu.endDate)}`,
                      size: 20,
                      italics: true,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.gradeType} - ${edu.grade}`,
                      size: 20,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
                ...(edu.description
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: stripHtml(edu.description),
                            size: 22,
                          }),
                        ],
                        spacing: { after: 200 },
                      }),
                    ]
                  : []),
              ]),
            ]
          : []),

        // Skills
        ...(resumeInfo.skills && resumeInfo.skills.length > 0
          ? [
              new Paragraph({
                text: "SKILLS",
                heading: HeadingLevel.HEADING_1,
                thematicBreak: true,
                spacing: { before: 200, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: resumeInfo.skills.map(skill => skill.name).join(" • "),
                    size: 22,
                  }),
                ],
                spacing: { after: 200 },
              }),
            ]
          : []),
      ],
    }],
  });

  // Generate and download the document
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${resumeInfo.firstName}_${resumeInfo.lastName}_Resume.docx`);
};

// Helper function to strip HTML tags
const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  // Convert bullet points
  const text = tmp.textContent || tmp.innerText || "";
  return text.replace(/•/g, "• ");
};

// Helper function to format month/year
const formatMonthYear = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "-01");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};
