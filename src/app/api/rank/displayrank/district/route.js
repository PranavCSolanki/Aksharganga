import { Mongouri } from "@/lib/db";
import publishModel from "@/lib/Models/Result/PublishedResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  // Extract properties from the body
  const { exam, standard, district } = body;

  // Validate required fields
  if (!exam || !standard || !district) {
    return NextResponse.json({
      Success: false,
      message: "exam, district, and standard are required",
    });
  }

  // Fetch state-ranked roll numbers from the external API
  const stateRankResponse = await fetch(
    "http://localhost:3000/api/rank/displayrank/state",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exam, standard }),
    }
  );

  if (!stateRankResponse.ok) {
    return NextResponse.json({
      Success: false,
      message: "Failed to fetch state-ranked roll numbers",
    });
  }

  const stateRankData = await stateRankResponse.json();

  // Ensure stateRankData contains valid roll numbers
  if (
    !stateRankData ||
    !stateRankData.data ||
    stateRankData.data.length === 0
  ) {
    return NextResponse.json({
      Success: false,
      message: "No state-ranked roll numbers found",
      state: stateRankData,
    });
  }

  // Extract roll numbers correctly from stateRankData
  const stateRankedRollNos = new Set(
    stateRankData.data.map((item) => item.RollNo)
  );

  // Connect to the database
  await mongoose.connect(Mongouri);

  // Fetch district-level data, excluding state-ranked students
  let districtData = await publishModel.find({
    rollNo: { $nin: Array.from(stateRankedRollNos) },
    district: district,
    standard: standard,
    exam: exam,
  });

  // Check if districtData contains results
  if (!districtData || districtData.length === 0) {
    return NextResponse.json({
      Success: false,
      message: "No district data found",
    });
  }

  // Extract all unique paper names from the dataset
  const allPaperNames = new Set();
  districtData.forEach((student) => {
    student.subjects.forEach((subject) => {
      allPaperNames.add(subject.subject); // Add each paper name to the set
    });
  });

  const paperNames = Array.from(allPaperNames);

  // Sort data by total marks in descending order
  districtData.sort((a, b) => b.totalMarks - a.totalMarks);

  // Assign ranks with ties and add marks for each paper as separate fields
  let rank = 0;
  let previousMarks = null;

  districtData = districtData.map((student) => {
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

  // Filter to include all students within the top 5 ranks (including ties)
  const topRanks = [];
  let currentMaxRank = 5;

  for (const student of districtData) {
    if (student.rank <= currentMaxRank) {
      topRanks.push(student);
    } else {
      break; // Stop adding students once we exceed the top 5 ranks
    }
  }

  if (!topRanks.length) {
    return NextResponse.json({
      Success: false,
      message: "No data found for top ranks",
    });
  }

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
        field: paper,
        headerName: `Paper ${index + 1}`, // Use backticks for template literals
      };
    }),
    { field: "totalMarks", headerName: "Total Marks" },
    { field: "rank", headerName: "Rank" },
  ];

  return NextResponse.json({
    Success: true,
    message: "Data fetched successfully",
    columns: columns,
    data: topRanks,
  });
}
