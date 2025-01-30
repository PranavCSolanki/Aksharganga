import { Mongouri } from "@/lib/db";
import publishModel from "@/lib/Models/Result/PublishedResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const body = await req.json();
    const { rollNumber } = body;

    if (!rollNumber) {
      return NextResponse.json({ success: false, message: "Roll number is required" });
    }

    await mongoose.connect(Mongouri);

    const result = await publishModel.findOne({ rollNo: rollNumber });

    if (!result) {
      return NextResponse.json({ message: "Result not found" });
    }

    const allPaperNames = new Set();
    result.subjects.forEach((subject) => {
      allPaperNames.add(subject.subject);
    });

    const paperNames = Array.from(allPaperNames);

    let columns = [
      { field: "srno", headerName: "Sr.No." },
      { field: "RollNo", headerName: "Roll No" },
      { field: "StudentName", headerName: "Student Name" },
      { field: "Standard", headerName: "Standard" },
      { field: "medium", headerName: "Medium" },
      { field: "school", headerName: "School Name" },
      ...paperNames.map((paper, index) => ({
        field: paper,
        headerName: `Paper ${index + 1}`
      })),
      { field: "totalMarks", headerName: "Total Marks" }
    ];

    // Dynamically add rank-based columns
    if (result.rankType === "staterank") {
      columns.splice(6, 0, { field: "state", headerName: "State" });
    } else if (result.rankType === "districtrank") {
      columns.splice(6, 0, { field: "district", headerName: "District" });
    } else if (result.rankType === "centerinnerrank") {
      columns.splice(6, 0, { field: "center", headerName: "Center" });
    }

    return NextResponse.json({ success: true, data: result, columns: columns });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" });
  }
}