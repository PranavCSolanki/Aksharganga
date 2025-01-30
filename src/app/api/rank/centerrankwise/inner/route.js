import { Mongouri } from "@/lib/db";
import ResultModel from "@/lib/Models/Result/UploadResult/UploadResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json();

    // Extract properties from the body
    const { exam, taluka, center, standard, district } = body;

    // Validate required fields
    if (!exam || !taluka || !center || !standard || !district) {
        return NextResponse.json({ "Success": false, message: "exam, taluka, center, standard, and district are required" });
    }

    try {
        await mongoose.connect(Mongouri);

        // Fetch state-ranked roll numbers from the external API
        const stateRankResponse = await fetch("http://localhost:3000/api/rank/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exam, standard })
        });

        if (!stateRankResponse.ok) {
            return NextResponse.json({ "Success": false, message: "Failed to fetch State-ranked roll numbers" });
        }

        const stateRankData = await stateRankResponse.json();

        // Ensure stateRankData contains valid roll numbers
        if (!stateRankData || !stateRankData.data || stateRankData.data.length === 0) {
            return NextResponse.json({
                "Success": false,
                message: "No state-ranked roll numbers found",
                state: stateRankData
            });
        }

        // Fetch district-ranked roll numbers from the external API
        const districtRankResponse = await fetch("http://localhost:3000/api/rank/district", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exam, standard, district })
        });

        if (!districtRankResponse.ok) {
            return NextResponse.json({ "Success": false, message: "Failed to fetch district-ranked roll numbers" });
        }

        const distRankData = await districtRankResponse.json();

        // Ensure districtRankData contains valid roll numbers
        if (!distRankData || !distRankData.data || distRankData.data.length === 0) {
            return NextResponse.json({
                "Success": false,
                message: "No district-ranked roll numbers found",
                state: distRankData
            });
        }


        // Filter data to only include entries with the matching center name
        const filteredStateRankData = stateRankData.data.filter(item => item.center === center);
        const filteredDistRankData = distRankData.data.filter(item => item.center === center);
 
        // Extract roll numbers to exclude
        const stateRankedRollNos = new Set(filteredStateRankData.map(item => item.RollNo));
        const distRankedRollNos = new Set(filteredDistRankData.map(item => item.RollNo));

        // Fetch data and calculate total marks
        let data = await ResultModel.aggregate([
            {
                $match: {
                    exam: exam,
                    center: center,
                    district: district,
                    taluka: taluka,
                    Standard: standard,
                    RollNo: { 
                        $nin: Array.from(new Set([
                            ...stateRankedRollNos,
                            ...distRankedRollNos,
                        ])) // Exclude state, district
                    }
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

        data = data.map((student) => {
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

        // Determine the limit dynamically
        let totalStudents = data.length;
        let limit = Math.ceil(totalStudents / 50); // E.g., return 2% of total records, rounded up
        if (totalStudents < 20) limit = 1; // Minimum limit for small datasets

        // Slice the data to return only the required number of results
        const responseData = data.slice(0, limit);

        if (!responseData.length) {
            return NextResponse.json({ "Success": false, message: "No data found" });
        }

        // Define columns for the table, including dynamic columns for each paper
        const columns = [
            { field: "rank", headerName: "Rank" },
            { field: "RollNo", headerName: "Roll No" },
            { field: "StudentName", headerName: "Student Name" },
            { field: "Standard", headerName: "Standard" },
            { field: "medium", headerName: "Medium" },
            { field: "schoolName", headerName: "School Name" },
            // Dynamically create columns for each paper
            ...paperNames.map((paper) => ({
                field: paper,
                headerName: paper // Each paper name becomes a column
            })),
            { field: "totalMarks", headerName: "Total Marks" }
        ];

        return NextResponse.json({
            "Success": true,
            message: "Data fetched successfully",
            columns: columns,
            data: responseData
        });
    } catch (error) {
        return NextResponse.json({
            "Success": false,
            message: "An error occurred",
            error: error.message
        });
    }
}
