import { Mongouri } from "@/lib/db";
import StudentModel from "@/lib/Models/Registration/students/StudentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
    const body = await req.json();
    const { exam, district, taluka, center, schoolname, standard } = body;

    // Validate required fields
    if (!exam) {
        return NextResponse.json({ error: "Exam is required.", success: false });
    }
    if (!district) {
        return NextResponse.json({ error: "District is required.", success: false });
    }
    if (!taluka) {
        return NextResponse.json({ error: "Taluka is required.", success: false });
    }
    if (!center) {
        return NextResponse.json({ error: "Center is required.", success: false });
    }

    console.log(exam, district, taluka, center);

    try {
        await mongoose.connect(Mongouri);

        // Build query object dynamically
        const query = {
            exam,
            district,
            taluka,
            center
        };

        // Add optional fields to the query if they are provided
        if (schoolname && schoolname.length > 0) {
            query.school = { $in: schoolname };
        }

        if (standard && standard.length > 0) {
            query.Class = { $in: standard };
        }

        const data = await StudentModel.find(query);

        return NextResponse.json({ data, success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message, success: false });
    } 
}
