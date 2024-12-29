import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

async function connectToDatabase() {
  await mongoose.connect(Mongouri);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    let exam = searchParams.get("exam");
    let district = searchParams.get("district");
    let medium = searchParams.get("medium");

    if (!exam || !medium || !district) {
      return NextResponse.json({
        success: false,
        message: "exam, district and medium are required",
      });
    }

    await connectToDatabase();

    // Fetch standards for the given exam
    const examData = await ExamModel.findOne({ name: exam });
    if (!examData) {
      return NextResponse.json({
        success: false,
        message: "No exam found with the given name",
      });
    }

    const standards = examData.standards.map((s) => s.trim().toLowerCase()); // Normalize standards

    // Fetch data for all mediums in the district
    const allData = await GeneratedRollModel.find({ exam, district });

    if (!allData || allData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No Generated Roll Number found for the district",
      });
    }

    // Filter data if a specific medium is chosen, otherwise process all mediums
    const dataToProcess = medium.toLowerCase() === "all" ? allData : allData.filter(
      (student) => student.medium.trim().toLowerCase() === medium.trim().toLowerCase()
    );

    if (!dataToProcess || dataToProcess.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No Generated Roll Number found for medium: ${medium}`,
      });
    }

    // Create a table-like structure
    const tableData = [];

    // Initialize total counts for all centers and standards
    const grandTotalPerStandard = Array(standards.length).fill(0);
    let grandTotalAllCenters = 0;

    // Group data by center
    const groupedByCenter = {};
    dataToProcess.forEach(student => {
      const center = student.center.trim();
      if (!groupedByCenter[center]) {
        groupedByCenter[center] = Array(standards.length).fill(0); // Initialize array for standards
      }
      const standardIndex = standards.indexOf(student.Class.trim().toLowerCase()); // Get standard index
      if (standardIndex >= 0 && standardIndex < standards.length) {
        groupedByCenter[center][standardIndex]++; // Increment count for standard
      }
    });

    // Build the table data for each center
    Object.keys(groupedByCenter).forEach((center, index) => {
      const standardCounts = groupedByCenter[center];
      const totalForCenter = standardCounts.reduce((sum, count) => sum + count, 0);

      // Add to grand totals
      for (let i = 0; i < standards.length; i++) {
        grandTotalPerStandard[i] += standardCounts[i];
      }
      grandTotalAllCenters += totalForCenter;

      // Push center row to table data
      tableData.push({
        srNo: index + 1,
        center,
        standardCounts,
        totalForCenter
      });
    });

    // Add total row
    const totalRow = {
      srNo: "Total",
      center: "All Centers",
      standardCounts: grandTotalPerStandard,
      totalForCenter: grandTotalAllCenters
    };

    // Prepare response data
    const responseData = {
      success: true,
      data: {
        tableData,
        totalRow,
        standards, // Add standards to the response to identify the columns
      }
    };

    return NextResponse.json(responseData);
  } catch (e) {
    console.error("Error occurred:", e);
    return NextResponse.json({
      success: false,
      error: e.message || "An error occurred",
    });
  }
}
