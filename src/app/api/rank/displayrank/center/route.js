import { Mongouri } from "@/lib/db";
import publishModel from "@/lib/Models/Result/PublishedResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  // Extract properties from the body
  const { exam, center, standard } = body;

  // Validate required fields
  if (!exam || !standard || !center) {
    return NextResponse.json({
      Success: false,
      message: "exam, center, and standard are required",
    });
  }

  try {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(Mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Fetch all students for the given standard
    let Data = await publishModel.find({
      RankType: "centerinnerrank",
      center: center,
      exam: exam,
      standard: standard,
    });

    const allPaperNames = new Set();
    Data.forEach((student) => {
      student.subjects.forEach((subject) => {
        allPaperNames.add(subject.subject); // Add each paper name to the set
      });
    });

    const paperNames = Array.from(allPaperNames);

    // Sort data by total marks in descending order
    Data.sort((a, b) => b.totalMarks - a.totalMarks);

    // Assign ranks with ties and add marks for each paper as separate fields
    let rank = 0;
    let previousMarks = null;

    Data = Data.map((student) => {
      if (student.totalMarks !== previousMarks) {
        rank += 1; // Increment rank only if marks differ
      }
      previousMarks = student.totalMarks;

      const paperMarks = {};
      paperNames.forEach((paper) => {
        const paperData = student.subjects.find(
          (subject) => subject.subject === paper
        );
        paperMarks[paper] = paperData ? paperData.marks : 0; // Default to 0 if paper is not found
      });

      return { ...student.toObject(), rank, ...paperMarks };
    });

    // Define columns for the table, including dynamic columns for each paper
    const columns = [
      { field: "srno", headerName: "Sr.No." },
      { field: "RollNo", headerName: "Roll No" },
      { field: "StudentName", headerName: "Student Name" },
      { field: "Standard", headerName: "Standard" },
      { field: "medium", headerName: "Medium" },
      { field: "school", headerName: "School Name" },
      { field: "center", headerName: "Center" },
      { field: "taluka", headerName: "Taluka" },
      ...paperNames.map((paper, index) => {
        return {
          field: `Paper${index + 1}`,
          headerName: `Paper ${index + 1}`,
        };
      }),
      { field: "totalMarks", headerName: "Total Marks" },
      { field: "rank", headerName: "Rank" },
    ];

    return NextResponse.json({
      Success: true,
      message: "Data fetched successfully",
      columns: columns,
      data: Data,
    });
  } catch (error) {
    return NextResponse.json({
      Success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
}
