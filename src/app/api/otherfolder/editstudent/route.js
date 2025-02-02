import { Mongouri } from "@/lib/db";
import publishModel from "@/lib/Models/Result/PublishedResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function PUT(req) {
    const body = await req.json();
    const { rollNo, exam, district, taluka, school, studentName, std, medium, center, subjects } = body;

    if (!rollNo || !exam || !district || !taluka || !school || !studentName || !std || !medium || !center || !subjects || !Array.isArray(subjects)) {
        return NextResponse.json({ success: false, message: 'Please provide all the details' });
    }

    try {
        // Ensure the database connection is established
        await mongoose.connect(Mongouri, { useNewUrlParser: true, useUnifiedTopology: true });

        // Find the student by roll number
        const student = await publishModel.findOne({ rollNo: rollNo });

        if (!student) {
            return NextResponse.json({ success: false, message: 'Student not found' });
        } 

        // Update the student's details
        student.exam = exam;
        student.district = district;
        student.taluka = taluka;
        student.school = school;
        student.studentName = studentName;
        student.standard = std;
        student.medium = medium;
        student.center = center;

        // Update the marks for each subject and calculate total marks
        let totalMarks = 0;
        subjects.forEach((updatedSubject) => {
            const subject = student.subjects.find((s) => s.subject === updatedSubject.subject);
            if (subject) {
                subject.marks = updatedSubject.marks;
                totalMarks += updatedSubject.marks;
            }
        });

        // Update the total marks
        student.totalMarks = totalMarks;

        // Save the updated student document
        await student.save();

        return NextResponse.json({ success: true, message: 'Student details updated successfully' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, message: 'An error occurred while updating student details' });
    }
}
