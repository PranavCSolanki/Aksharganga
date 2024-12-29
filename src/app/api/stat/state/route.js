import { Mongouri } from "@/lib/db";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

async function connectToDatabase() {
  await mongoose.connect(Mongouri);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    let exam = searchParams.get("exam");
    let medium = searchParams.get("medium");

    if (!exam || !medium) {
      return NextResponse.json({
        success: false,
        message: "Exam and medium are required",
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

    const standards = examData.standards.map((s) => s.trim().toLowerCase());

    // Fetch data for all mediums if "All" is selected, otherwise fetch specific medium
    let query = { exam };
    if (medium !== "All") {
      query.medium = medium;
    }

    const allData = await GeneratedRollModel.find(query);

    if (!allData || allData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No Student found for the selected exam and medium",
      });
    }

    // Group data by district
    const groupedByDistrict = {};
    allData.forEach((student) => {
      const district = student.district.trim();
      if (!groupedByDistrict[district]) {
        groupedByDistrict[district] = Array(standards.length).fill(0); // Initialize array for standards
      }
      const standardIndex = standards.indexOf(student.Class.trim().toLowerCase());
      if (standardIndex >= 0 && standardIndex < standards.length) {
        groupedByDistrict[district][standardIndex]++;
      }
    });

    // Create table-like data
    const tableData = [];
    let grandTotalPerStandard = Array(standards.length).fill(0);
    let grandTotalAllDistricts = 0;

    Object.keys(groupedByDistrict).forEach((district, index) => {
      const standardCounts = groupedByDistrict[district];
      const totalForDistrict = standardCounts.reduce((sum, count) => sum + count, 0);

      // Add to grand totals
      for (let i = 0; i < standards.length; i++) {
        grandTotalPerStandard[i] += standardCounts[i];
      }
      grandTotalAllDistricts += totalForDistrict;

      // Push district row to table data
      tableData.push({
        srNo: index + 1,
        district,
        standardCounts,
        totalForDistrict,
      });
    });

    // Add total row
    const totalRow = {
      srNo: "Total",
      district: "All Districts",
      standardCounts: grandTotalPerStandard,
      totalForDistrict: grandTotalAllDistricts,
    };

    // Prepare response data
    const responseData = {
      success: true,
      data: {
        tableData,
        totalRow,
        standards,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "An error occurred",
    });
  }
}
