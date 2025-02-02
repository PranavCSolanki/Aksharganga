import { Mongouri } from "@/lib/db";
import publishModel from "@/lib/Models/Result/PublishedResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { exam, taluka, center, district } = body;

        await mongoose.connect(Mongouri);

        // Fetch all rankers for each class without limiting
        const rankedData = await publishModel.find({
            exam: exam,
            district: district,
            center: center,
            taluka: taluka,
            RankType: { $in: ['centerinnerrank', 'staterank', 'districtrank'] }
        }).sort({standard: 1, totalMarks: -1  }); // Sort by totalMarks descending and standard ascending

        const paperNames = Array.from(
            new Set(
                rankedData.flatMap((student) =>
                    student.subjects.map((subject) => subject.subject)
                )
            )
        );

        const rankedStudents = rankedData.map((student) => {
            // Map paper names to marks
            const paperMarks = paperNames.reduce((acc, paper) => {
                const paperData = student.subjects.find(
                    (subject) => subject.subject === paper
                );
                acc[paper] = paperData ? paperData.marks : 0;
                return acc;
            }, {});

            return { ...student.toObject(), ...paperMarks };
        });

        const columns = [
            { field: "srno", headerName: "Sr.No." },
            { field: "RollNo", headerName: "Roll No" },
            { field: "StudentName", headerName: "Student Name" },
            { field: "Standard", headerName: "Standard" },
            { field: "medium", headerName: "Medium" },
            { field: "school", headerName: "School Name" },
            { field: "paper1", headerName: "Paper 1" },
            { field: "paper2", headerName: "Paper 2" },
            { field: "totalMarks", headerName: "Total Marks" },
        ];

        return NextResponse.json({ success: true, columns, data: rankedStudents });
    } catch (error) {
        return NextResponse.json({ error: `Error fetching ranked data: ${error.message}` });
    }
}
