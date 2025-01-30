import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);

    const exam = searchParams.get("exam");
    const medium = searchParams.get("medium");

    if (!exam || !medium) {
      return NextResponse.json({
        success: false,
        message: "Exam and medium are required",
      });
    }

    if (!Mongouri) {
      return NextResponse.json({
        success: false,
        message: "Database connection URI is not configured",
      });
    }

    // Connect to MongoDB
    await mongoose.connect(Mongouri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Fetch exam data
    const examData = await ExamModel.findOne({ name: exam });
    if (!examData) {
      return NextResponse.json({
        success: false,
        message: "No exam found with the given name",
      });
    }

    const standards = examData.standards.map((s) => s.trim().toLowerCase());

    // Fetch student data
    const query = { exam };
    if (medium !== "All") {
      query.medium = medium;
    }

    const allData = await GeneratedRollModel.find(query);

    if (!allData || allData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No students found for the selected exam and medium",
      });
    }

    // Group data by district
    const groupedByDistrict = {};
    allData.forEach((student) => {
      const district = student.district.trim();
      if (!groupedByDistrict[district]) {
        groupedByDistrict[district] = Array(standards.length).fill(0);
      }
      const standardIndex = standards.indexOf(student.Class.trim().toLowerCase());
      if (standardIndex >= 0) {
        groupedByDistrict[district][standardIndex]++;
      }
    });

    // Prepare table data
    const tableData = [];
    const grandTotalPerStandard = Array(standards.length).fill(0);
    let grandTotalAllDistricts = 0;

    Object.entries(groupedByDistrict).forEach(([district, standardCounts], index) => {
      const totalForDistrict = standardCounts.reduce((sum, count) => sum + count, 0);

      for (let i = 0; i < standards.length; i++) {
        grandTotalPerStandard[i] += standardCounts[i];
      }
      grandTotalAllDistricts += totalForDistrict;

      tableData.push({
        srNo: index + 1,
        district,
        standardCounts,
        totalForDistrict,
      });
    });

    const totalRow = {
      srNo: "Total",
      district: "All Districts",
      standardCounts: grandTotalPerStandard,
      totalForDistrict: grandTotalAllDistricts,
    };

    // Create decorative HTML content
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Statistics</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
            }
            .container {
              padding: 20px;
              max-width: 900px;
              margin: auto;
            }
            h1, h2 {
              text-align: center;
              margin-bottom: 5px;
            }
            h1 {
              font-size: 24px;
              border-bottom: 2px solid #3498DB;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
            }
            th {
              text-transform: uppercase;
            }
            .total-row {
              font-weight: bold;
            }
            footer {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Student Statistics</h1>
            <h2>Exam: ${exam} | Medium: ${medium}</h2>
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>District</th>
                  ${standards.map((s) => `<th>${s}</th>`).join("")}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${tableData.map(
                  (row) => `
                  <tr>
                    <td>${row.srNo}</td>
                    <td>${row.district}</td>
                    ${row.standardCounts.map((count) => `<td>${count}</td>`).join("")}
                    <td>${row.totalForDistrict}</td>
                  </tr>`
                ).join("")}
                <tr class="total-row">
                  <td>${totalRow.srNo}</td>
                  <td>${totalRow.district}</td>
                  ${totalRow.standardCounts.map((count) => `<td>${count}</td>`).join("")}
                  <td>${totalRow.totalForDistrict}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "10mm",
        right: "10mm",
      },
    });

    await browser.close();

    // Return the PDF response
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Student_Statistics_${exam}_${medium}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred",
    });
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}
