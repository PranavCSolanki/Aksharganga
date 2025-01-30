import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import CenterModel from "@/lib/Models/Master/CenterModel";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

async function connectToDatabase() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(Mongouri);
  }
}

export async function POST(req) {
  let browser;

  try {
    const { searchParams } = new URL(req.url);

    const exam = searchParams.get("exam");
    const coordinator = searchParams.get("coordinator");

    if (!exam || !coordinator) {
      return NextResponse.json({
        success: false,
        message: "Exam and coordinator are required",
      });
    }

    await connectToDatabase();

    const examData = await ExamModel.findOne({ name: exam });
    if (!examData) {
      return NextResponse.json({
        success: false,
        message: "No exam or standards found for the given exam",
      });
    }

    const standards = examData.standards;
    const centers = await CenterModel.find({ CoOrdinator: coordinator });
    if (!centers || centers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No centers found for the given coordinator",
      });
    }

    const centerNames = centers.map((center) => center.CenterName);
    const rollNumberCenters = await GeneratedRollModel.distinct("center", {
      exam,
      center: { $in: centerNames },
      Class: { $in: standards },
    });

    if (!rollNumberCenters || rollNumberCenters.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No roll numbers generated for any centers",
      });
    }

    const studentCounts = await GeneratedRollModel.aggregate([
      {
        $match: {
          exam,
          center: { $in: rollNumberCenters },
          Class: { $in: standards },
        },
      },
      {
        $group: {
          _id: { center: "$center", Class: "$Class" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          center: "$_id.center",
          Class: "$_id.Class",
          count: 1,
          _id: 0,
        },
      },
    ]);

    const table = {};
    let grandTotal = 0;
    const columnTotals = Array(standards.length).fill(0);

    rollNumberCenters.forEach((center) => {
      table[center] = {
        standards: Array(standards.length).fill(0),
        rowTotal: 0,
      };
    });

    studentCounts.forEach(({ center, Class, count }) => {
      if (table[center] && standards.includes(Class)) {
        const standardIndex = standards.indexOf(Class);
        table[center].standards[standardIndex] = count;
        table[center].rowTotal += count;
        columnTotals[standardIndex] += count;
        grandTotal += count;
      }
    });

    const html = `<!DOCTYPE html>
    <html>
      <head>
        <title>Student Statistics</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            padding: 20px;
            max-width: 900px;
            margin: auto;
          }
          h1 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid black;
          }
          h2 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            text-align: center;
          }
          th, td {
            border: 1px solid black;
            padding: 12px 8px;
            vertical-align: middle;
          }
          th {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          tbody tr.total-row {
            font-weight: bold;
          }
          .total-row td {
            border-top: 2px solid black;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Student Statistics</h1>
          <h2>Exam: ${exam} | Coordinator: ${coordinator}</h2>
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Center</th>
                ${standards.map((s) => `<th>${s.toUpperCase()}</th>`).join("")}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${rollNumberCenters
                .map((center, index) => {
                  const row = table[center];
                  return `<tr>
                    <td>${index + 1}</td>
                    <td>${center}</td>
                    ${row.standards
                      .map((count) => `<td>${count}</td>`)
                      .join("")}
                    <td>${row.rowTotal}</td>
                  </tr>`;
                })
                .join("")}
              <tr class="total-row">
                <td colspan="2">Total</td>
                ${columnTotals
                  .map((count) => `<td>${count}</td>`)
                  .join("")}
                <td>${grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
    </html>`;

    browser = await puppeteer.launch();
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

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Student_Statistics_${exam}_${coordinator}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    if (browser) await browser.close();
    return NextResponse.json({
      success: false,
      error: error.message || "An unexpected error occurred",
    });
  }
}
