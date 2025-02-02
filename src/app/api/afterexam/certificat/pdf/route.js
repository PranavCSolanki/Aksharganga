import mongoose from "mongoose";
import { Mongouri } from "@/lib/db";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
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

    const htmlContent = data
      .map(
        (item) => `
        <div style="margin-top: 40px; padding: 20px; ">
         
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 230px;">
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Roll Number:</strong></td>
      <td style="padding: 8px;">${item.rollNo ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Student Name:</strong></td>
      <td style="padding: 8px;">${item.studentName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>School Name:</strong></td>
      <td style="padding: 8px;">${item.schoolName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Standard:</strong></td>
      <td style="padding: 8px;">${item.standard ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Medium:</strong></td>
      <td style="padding: 8px;">${item.medium ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Center Name:</strong></td>
      <td style="padding: 8px;">${item.center ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Taluka:</strong></td>
      <td style="padding: 8px;">${item.taluka ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>District:</strong></td>
      <td style="padding: 8px;">${item.district ?? "N/A"}</td>
    </tr>
  </tbody>
</table>

      
          <h2 style="text-align: center; font-weight: bold; margin-bottom: 10px;">Subjects and Marks</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Subject</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Marks</th>
              </tr>
            </thead>
            <tbody>
              ${
                item.subjects && item.subjects.length > 0
                  ? item.subjects
                      .map(
                        (subject, index) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">Paper ${
                    index + 1
                  }: ${subject.subject ?? "N/A"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                    subject.marks ?? "0"
                  }</td>
                </tr>
              `
                      )
                      .join("")
                  : `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;" colspan="2">No subjects available</td>
                </tr>
              `
              }
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Total</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${
                  item.totalMarks ?? 0
                }</td>
              </tr>
            </tbody>
          </table>
      
          <h2 style="text-align: center; font-weight: bold; margin-bottom: 10px;">Rank</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">State Level</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">District Level</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Center Level</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                  item.RankType === "staterank" ? item.Rank : "-"
                }</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                  item.RankType === "districtrank" ? item.Rank : "-"
                }</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
                  item.RankType === "centerinnerrank" ? item.Rank : "-"
                }</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
      )
      .join("");

    // Launch Puppeteer and create a PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
      margin: { top: "20px", bottom: "20px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${center}_${exam}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
