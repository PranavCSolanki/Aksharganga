import mongoose from "mongoose";
import { Mongouri } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import publishModel from "@/lib/Models/Result/PublishedResult";

export async function POST(req) {
  try {
    const { exam, district, taluka, center } = await req.json();

    if (!exam || !center || !district || !taluka) {
      return NextResponse.json({ error: "Parameters are required" });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(Mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const data = await publishModel
      .find({ exam, center, district, taluka })
      .sort({ rollNo: 1 })
      .lean();

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found" });
    }

    const doc = new Document({
      sections: data.map((item) => ({
        properties: {},
        children: [
          // Add more top spacing
          new Paragraph({ text: "\n\n\n\n", spacing: { after: 2000 } }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
          }),

          new Paragraph({
            text: "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",
            spacing: { after: 2000 },
          }),

          // Student Information (Each field on a new line)
          new Paragraph({
            text: `Roll Number:            ${item.rollNo ?? "N/A"}`,
            size: 28,
              bold: true,
            spacing: { after: 200,before: 200 },
          }),

          new Paragraph({
            text: `Student Name:          ${item.studentName ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },
          }),
          new Paragraph({
            text: `School Name:           ${item.schoolName ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },
          }),
          new Paragraph({
            text: `Standard:                  ${item.standard ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },
          }),
          new Paragraph({
            text: `Medium:                   ${item.medium ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },
          }),
          new Paragraph({
            text: `Center Name:           ${item.center ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },
          }),
          new Paragraph({
            text: `Taluka  :                   ${item.taluka ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },

          }),
          new Paragraph({
            text: `District:                    ${item.district ?? "N/A"}`,
              size: 28,
              spacing: { after: 200,before: 200 },

          }),

          new Paragraph({ text: "\n", spacing: { after: 300 } }),

          // Marks Table
         // Marks Table
new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ text: "Subject", bold: true, size: 24, spacing: { after: 200,before: 200 },alignment: AlignmentType.CENTER, }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({ text: "Marks", bold: true, size: 24, spacing: { after: 200,before: 200 } ,alignment: AlignmentType.CENTER,}),
            ],
          }),
        ],
      }),
      ...(item.subjects && item.subjects.length > 0
        ? item.subjects.map((subject, index) => new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    text: `Paper ${index + 1} : ${subject.subject ?? "N/A"}`,
                      size: 24,
                      spacing: { after: 200,before: 200 },
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: (subject.marks ?? "0").toString(),
                      size: 24,
                      spacing: { after: 200,before: 200 },
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            ],
          }))
        : [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: "No subjects available",
                        size: 24,
                        spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: "-",
                        size: 24,
                        spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                    }),
                  ],
                }),
              ],
            }),
          ]),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ text: "Total", bold: true, size: 24, spacing: { after: 200,before: 200 }, alignment: AlignmentType.CENTER }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: (item.totalMarks ?? 0).toString(),
                bold: true,
                  size: 24,
                  spacing: { after: 200,before: 200 },
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          ],
          
      }),
    ],
  }),
  

          new Paragraph({ text: "\n", spacing: { after: 300 } }),

          // Rank Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "State Level",
                        bold: true,
                          size: 24,
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 200,before: 200 }
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "District Level",
                        bold: true,
                          size: 24,
                          spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "Center Level",
                        bold: true,
                          size: 24,
                          spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: (item.RankType == "staterank"
                          ? item.Rank
                          : "-"
                        ).toString(),
                          size: 24,
                          spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: (item.RankType == "districtrank"
                          ? item.Rank
                          : "-"
                        ).toString(),
                          size: 24,
                          spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: (item.RankType == "centerinnerrank"
                          ? item.Rank
                          : "-"
                        ).toString(),
                          size: 24,
                          spacing: { after: 200,before: 200 },
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "\n", spacing: { after: 300 } }),
        ],
      })),
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        // "Content-Disposition": attachment,
        filename: "${center}_${exam}.docx",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
