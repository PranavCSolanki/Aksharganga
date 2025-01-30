import { Mongouri } from "@/lib/db";
import ResultModel from "@/lib/Models/Result/UploadResult/UploadResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  // Extract properties from the body
  const { exam, standard, district, taluka, center } = body;

  // Validate required fields
  if (!exam || !standard || !district || !taluka || !center) {
    return NextResponse.json({
      Success: false,
      message: "exam, district, taluka, center, and standard are required",
    });
  }

  try {
    // Helper function to fetch data from external APIs
    const fetchRankData = async (url, payload) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
      }

      const data = await response.json();
      if (!data || !data.data || data.data.length === 0) {
        throw new Error(`No data found from ${url}`);
      }

      return data.data;
    };

    // Fetch rank data from various APIs
    const stateRankData = await fetchRankData(
      "http://localhost:3000/api/rank/state",
      { exam, standard }
    );
    const districtRankData = await fetchRankData(
      "http://localhost:3000/api/rank/district",
      { exam, standard, district }
    );
    const centerInnerRankData = await fetchRankData(
      "http://localhost:3000/api/rank/centerrankwise/inner",
      { exam, standard, district, center, taluka }
    );

    // Filter data to only include entries with the matching center name
    const filterByCenter = (data) =>
      data.filter((item) => item.center === center);

    const filteredStateRankData = filterByCenter(stateRankData).map((item) => ({
      ...item,
      rankType: "staterank",
    }));
    const filteredDistrictRankData = filterByCenter(districtRankData).map(
      (item) => ({ ...item, rankType: "districtrank" })
    );
    const filteredCenterInnerRankData = filterByCenter(centerInnerRankData).map(
      (item) => ({ ...item, rankType: "centerinnerrank" })
    );

    // Connect to the database
    await mongoose.connect(Mongouri);

    // Fetch district-level data, excluding state-ranked students
    let districtData = await ResultModel.aggregate([
      {
        $match: {
          exam,
          district,
          taluka,
          center,
          Standard: standard,
        },
      },
      {
        $addFields: {
          totalMarks: { $sum: "$subjects.marks" }, // Calculate total marks for each student
        },
      },
      {
        $sort: { totalMarks: -1 }, // Sort by totalMarks in descending order
      },
    ]);

    // Check if districtData contains results
    if (!districtData || districtData.length === 0) {
      return NextResponse.json({
        Success: false,
        message: "No district data found",
      });
    }

    // Extract all unique paper names from the dataset
    const paperNames = Array.from(
      new Set(
        districtData.flatMap((student) =>
          student.subjects.map((subject) => subject.subject)
        )
      )
    );

    // Assign ranks with ties and add marks for each paper as separate fields
    let rank = 0;
    let previousMarks = null;
    let tieCount = 0;

    districtData = districtData.map((student, index) => {
      if (student.totalMarks !== previousMarks) {
        rank += tieCount + 1; // Increment rank by the number of ties plus one
        tieCount = 0; // Reset tie count
      } else {
        tieCount += 1; // Increment tie count
      }
      previousMarks = student.totalMarks;

      // Map paper names to marks
      const paperMarks = paperNames.reduce((acc, paper) => {
        const paperData = student.subjects.find(
          (subject) => subject.subject === paper
        );
        acc[paper] = paperData ? paperData.marks : 0;
        return acc;
      }, {});

      return { ...student, rank, ...paperMarks };
    });

    // Define columns for the table, including dynamic columns for each paper
    const columns = [
      { field: "srno", headerName: "Sr.No." },
      { field: "RollNo", headerName: "Roll No" },
      { field: "StudentName", headerName: "Student Name" },
      { field: "Standard", headerName: "Standard" },
      { field: "medium", headerName: "Medium" },
      { field: "school", headerName: "School Name" },
      ...paperNames.map((paper, index) => ({
        field: paper,
        headerName: `Paper ${index + 1}`,
      })),
      { field: "totalMarks", headerName: "Total Marks" },
    ];

    // Combine and sort all rank data by rank
    const combinedRankData = [
      ...filteredStateRankData,
      ...filteredDistrictRankData,
      // ...filteredCenterRankData,
      ...filteredCenterInnerRankData,
    ];

    combinedRankData.sort((a, b) => b.totalMarks - a.totalMarks);

    return NextResponse.json({
      Success: true,
      message: "Data fetched successfully",
      columns,
      staterank: filteredStateRankData,
      districtrank: filteredDistrictRankData,
      centerinnerrank: filteredCenterInnerRankData,
      data: combinedRankData,
    });
  } catch (error) {
    return NextResponse.json({
      Success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
}
