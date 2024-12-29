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
    let taluka = searchParams.get("taluka");
    let center = searchParams.get("center");

    if (!exam || !taluka || !center || !district) {
      return NextResponse.json({
        success: false,
        message: "exam, district, taluka, and center are required",
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

    const standards = examData.standards.map(s => s.trim().toLowerCase()); // Normalize standards

    // Fetch data for all mediums
    const allData = await GeneratedRollModel.find({ exam, district, taluka, center });

    if (!allData || allData.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No Generated Roll Number found",
      });
    }

    // Initialize counts
    const counts = {
      Marathi: Array(standards.length).fill(0),
      "Semi-English": Array(standards.length).fill(0),
      English: Array(standards.length).fill(0)
    };

    // Count students for each medium and standard
    allData.forEach(student => {
      const mediumName = student.medium.trim(); // Assume medium is directly usable
      const standardIndex = standards.indexOf(student.Class.trim().toLowerCase()); // Normalize and match standard

      if (counts[mediumName] && standardIndex >= 0 && standardIndex < standards.length) {
        counts[mediumName][standardIndex]++;
      }
    });

    // Calculate totals per medium and overall
    const totalCounts = {
      Marathi: counts.Marathi.reduce((a, b) => a + b, 0),
      "Semi-English": counts["Semi-English"].reduce((a, b) => a + b, 0),
      English: counts.English.reduce((a, b) => a + b, 0)
    };
    const overallTotal = totalCounts.Marathi + totalCounts["Semi-English"] + totalCounts.English;

    // Calculate total students per standard across all mediums
    const overallTotalPerStandard = Array(standards.length).fill(0);
    for (let i = 0; i < standards.length; i++) {
      overallTotalPerStandard[i] = counts.Marathi[i] + counts["Semi-English"][i] + counts.English[i];
    }

    // Prepare response data
    const responseData = {
      success: true,
      data: {
        standards,  // Add standards to the response
        counts,
        totalCounts,
        overallTotal,
        overallTotalPerStandard,
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
