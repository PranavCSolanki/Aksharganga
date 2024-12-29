import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import CenterModel from "@/lib/Models/Master/CenterModel";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

async function connectToDatabase() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(Mongouri);
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const exam = searchParams.get("exam");
    const coordinator = searchParams.get("coordinator");

    // Validate required query parameters
    if (!exam || !coordinator) {
      return NextResponse.json({
        success: false,
        message: "Exam and coordinator are required",
      });
    }

    await connectToDatabase();

    // Find the exam data
    const examData = await ExamModel.findOne({ name: exam });
    if (!examData) {
      return NextResponse.json({
        success: false,
        message: "No exam or standards found for the given exam",
      });
    }

    const standards = examData.standards;

    // Find centers assigned to the coordinator
    const centers = await CenterModel.find({ CoOrdinator: coordinator });
    if (!centers || centers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No centers found for the given coordinator",
      });
    }

    // Extract center names
    const centerNames = centers.map((center) => center.CenterName);

    // Filter only the centers that have generated roll numbers
    const rollNumberCenters = await GeneratedRollModel.distinct("center", {
      exam: exam,
      center: { $in: centerNames },
      Class: { $in: standards },
    });

    if (!rollNumberCenters || rollNumberCenters.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No roll numbers generated for any centers",
      });
    }

    // Aggregate student counts grouped by center and class
    const studentCounts = await GeneratedRollModel.aggregate([
      {
        $match: {
          exam: exam,
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


    // Initialize table structure and totals
    const table = {};
    let grandTotal = 0;
    const columnTotals = Array(standards.length).fill(0); // Totals for each standard (Class)

    // Initialize table rows for each center with roll numbers
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

    // Prepare the response data including totals per standard (Class) and grand total
    const responseData = {
      success: true,
      data: {
        centers: rollNumberCenters, // Only centers with roll numbers
        Class: standards, // The list of standards (classes)
        table, // Breakdown of students per center and class
        columnTotals, // Total students per standard (class)
        grandTotal, // Overall total number of students across all centers and classes
      },
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
