import mongoose from "mongoose";
import { Mongouri } from "@/lib/db";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import publishModel from "@/lib/Models/Result/PublishedResult";

export async function POST(req) {
  try {
    const { rollNo } = await req.json();

    if (!rollNo) {
      return NextResponse.json({ error: "Roll number is required" }, { status: 400 });
    }

    // Ensure MongoDB is connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(Mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const data = await publishModel.findOne({ rollNo });

    if (!data) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const htmlContent = `
      <div style="margin-top: 40px; padding: 20px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 230px;">
  <tbody>
    <tr>
      <td style="padding: 8px;"><strong>Roll Number:</strong></td>
      <td style="padding: 8px;">${data.rollNo ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Student Name:</strong></td>
      <td style="padding: 8px;">${data.studentName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>School Name:</strong></td>
      <td style="padding: 8px;">${data.schoolName ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Standard:</strong></td>
      <td style="padding: 8px;">${data.standard ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Medium:</strong></td>
      <td style="padding: 8px;">${data.medium ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Center Name:</strong></td>
      <td style="padding: 8px;">${data.center ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>Taluka:</strong></td>
      <td style="padding: 8px;">${data.taluka ?? "N/A"}</td>
    </tr>
    <tr>
      <td style="padding: 8px;"><strong>District:</strong></td>
      <td style="padding: 8px;">${data.district ?? "N/A"}</td>
    </tr>
  </tbody>
</table>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Subject</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Marks</th>
            </tr>
          </thead>
          <tbody>
            ${data.subjects?.map((subject, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">Paper ${index + 1}: ${subject.subject ?? "N/A"}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${subject.marks ?? "0"}</td>
              </tr>
            `).join("") || `<tr>
            <td colspan="2" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No subjects available</td>
            </tr>`}
            <tr>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;"><strong>Total</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;"><strong>${data.totalMarks ?? 0}</strong></td>
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
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${data.RankType === "staterank" ? data.Rank : "-"}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${data.RankType === "districtrank" ? data.Rank : "-"}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${data.RankType === "centerinnerrank" ? data.Rank : "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Puppeteer to generate PDF
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px" },
    });

    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${rollNo}.pdf"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
