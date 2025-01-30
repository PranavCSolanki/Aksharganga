import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(req) {
  let dbConnection;
  try {
    const { searchParams } = new URL(req.url);

    const exam = searchParams.get("exam");
    const center = searchParams.get("center");
    const medium = searchParams.get("medium") || "All"; // Added default value for medium

    if (!exam || !center) {
      return NextResponse.json({
        success: false,
        message: "Exam and center are required",
      });
    }

    if (!Mongouri) {
      return NextResponse.json({
        success: false,
        message: "Database connection URI is not configured",
      });
    }

    // Connect to MongoDB
    dbConnection = await mongoose.connect(Mongouri, {
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

    // Group data by center and medium
    const groupedByCenterAndMedium = {};
    allData.forEach((student) => {
      const studentCenter = student.center.trim();
      const studentMedium = student.medium.trim();
      if (!groupedByCenterAndMedium[studentCenter]) {
        groupedByCenterAndMedium[studentCenter] = {};
      }
      if (!groupedByCenterAndMedium[studentCenter][studentMedium]) {
        groupedByCenterAndMedium[studentCenter][studentMedium] = Array(
          standards.length
        ).fill(0);
      }
      const standardIndex = standards.indexOf(student.Class.trim().toLowerCase());
      if (standardIndex >= 0) {
        groupedByCenterAndMedium[studentCenter][studentMedium][standardIndex]++;
      }
    });

    // Prepare table data
    const tableData = [];
    const grandTotalPerStandard = Array(standards.length).fill(0);
    let grandTotalAllCenters = 0;

    Object.entries(groupedByCenterAndMedium).forEach(([centerName, mediums], index) => {
      Object.entries(mediums).forEach(([medium, standardCounts]) => {
        const totalForCenter = standardCounts.reduce((sum, count) => sum + count, 0);

        for (let i = 0; i < standards.length; i++) {
          grandTotalPerStandard[i] += standardCounts[i];
        }
        grandTotalAllCenters += totalForCenter;

        tableData.push({
          srNo: index + 1,
          center: centerName,
          medium,
          standardCounts,
          totalForCenter,
        });
      });
    });

    const totalRow = {
      srNo: "Total",
      center: "All Centers",
      medium: "All Mediums",
      standardCounts: grandTotalPerStandard,
      totalForCenter: grandTotalAllCenters,
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
            border-bottom: 2px solid black;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid black;
            padding: 10px;
            text-align: center;
          }
          th {
            text-transform: uppercase;
          }
          tbody tr.total-row {
            font-weight: bold;
          }
          .total-row td {
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
          <h2>Exam: ${exam} | Center: ${center}</h2>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Medium</th>
                ${standards.map((s) => `<th>${s.toUpperCase()}</th>`).join("")}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${["Marathi", "Semi-English", "English"]
                .map((medium, index) => {
                  const mediumData = groupedByCenterAndMedium[center]?.[medium] || Array(standards.length).fill(0);
                  const totalForMedium = mediumData.reduce((sum, count) => sum + count, 0);
  
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${medium}</td>
                      ${mediumData.map((count) => `<td>${count}</td>`).join("")}
                      <td>${totalForMedium}</td>
                    </tr>
                  `;
                })
                .join("")}
              <tr class="total-row">
                <td colspan="2">Total</td>
                ${grandTotalPerStandard.map((count) => `<td>${count}</td>`).join("")}
                <td>${grandTotalAllCenters}</td>
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
    if (dbConnection) {
      await mongoose.disconnect();
    }
  }
}
