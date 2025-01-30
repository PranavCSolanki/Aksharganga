import { Mongouri } from "@/lib/db";
import ResultModel from "@/lib/Models/Result/UploadResult/UploadResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json();

    // Extract properties from the body
    const { exam, standard } = body;

    // Validate required fields
    if (!exam || !standard) {
        return NextResponse.json({ "Success": false, message: "exam and standard are required" });
    }

    await mongoose.connect(Mongouri);

    // Fetch data and calculate total marks
    let data = await ResultModel.aggregate([
        {
            $match: {
                exam: exam,
                Standard: standard
            }
        },
        {
            $addFields: {
                totalMarks: { $sum: "$subjects.marks" } // Calculate total marks for each student
            }
        },
        {
            $sort: { totalMarks: -1 } // Sort by totalMarks in descending order
        }
    ]);

    // Extract all unique paper names from the dataset
    const allPaperNames = new Set();
    data.forEach((student) => {
        student.subjects.forEach((subject) => {
            allPaperNames.add(subject.subject); // Add each paper name to the set
        });
    });

    // Convert the Set to an array
    const paperNames = Array.from(allPaperNames);

    // Assign ranks with ties and add marks for each paper as separate fields
    let rank = 0;
    let previousMarks = null;

    data = data.map((student, index) => {
        if (student.totalMarks !== previousMarks) {
            rank += 1; // Increment rank only if marks differ
        }
        previousMarks = student.totalMarks;

        // Add marks for each paper as a separate field
        const paperMarks = {};
        paperNames.forEach((paper) => {
            const paperData = student.subjects.find((subject) => subject.subject === paper);
            paperMarks[paper] = paperData ? paperData.marks : 0; // Default to 0 if paper is not found
        });

        return { ...student, rank, ...paperMarks };
    });

    // Filter to include all students within the top 5 ranks (including ties)
    const topRanks = [];
    let currentMaxRank = 5;

    for (const student of data) {
        if (student.rank <= currentMaxRank) {
            topRanks.push(student);
        } else {
            break; // Stop adding students once we exceed the top 5 ranks
        }
    }

    if (!topRanks.length) {
        return NextResponse.json({ "Success": false, message: "No data found" });
    }

    // Define columns for the table, including dynamic columns for each paper
    const columns = [
        {field:"srno",headerName:"Sr.No."},
        { field: "rollNo", headerName: "Roll No" },
        { field: "name", headerName: "Student Name" },
        { field: "Standard", headerName: "Standard" },
        { field: "medium", headerName: "Medium" },
        { field: "schoolName", headerName: "School Name" },
        { field: "centerName", headerName: "Center" },
        { field: "talukaName", headerName: "Taluka" },
        { field: "districtName", headerName: "District" },
        // Dynamically create columns for each paper with "Paper 1", "Paper 2", etc.
        ...paperNames.map((paper, index) => {
            return {
                field: paper,
                headerName: `Paper ${index + 1}` // Assign "Paper 1", "Paper 2", etc.
            };
        }),
        { field: "totalMarks", headerName: "Total Marks" },
        { field: "rank", headerName: "Rank" }
    ];

    return NextResponse.json({
        "Success": true,
        message: "Data fetched successfully",
        columns: columns,
        data: topRanks
    });
}
