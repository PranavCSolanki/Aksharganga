import { Mongouri } from "@/lib/db";
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import GeneratedRollModel from "@/lib/Models/Registration/RollNo/GeneratedModel";
import StudentModel from "@/lib/Models/Registration/students/StudentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Database connection
async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(Mongouri);
  }
}

// Find center data from OrganizeModel
async function findCenter(body) {
 return OrganizeModel.findOne({ centers: body.center });
}

// Find students from StudentModel based on centerId
async function findStudents(centerId) {
  return StudentModel.find({ centerId }).sort({
    ClassId: 1,
    centerId: 1,
    // this is important to sort the students in the order of their names
    
    // studName: 1,
  });
}

// Check if roll numbers already exist for the center
async function checkExistingRoll(center) {
  return GeneratedRollModel.findOne({ center });
}

// Check if a student object is valid
function isStudentValid(student) {
  const requiredFields = [
    "exam",
    "district",
    "taluka",
    "center",
    "centerId",
    "studName",
    "ClassId",
    "gender",
    "school",
    "Class",
    "medium",
  ];
  return requiredFields.every((field) => student[field]);
}

// Generate roll number for a student
function generateRollNumber(classId, centerId, sequence) {
  return parseInt(`${classId}${centerId}${sequence}`);
}

// Save student roll number to GeneratedRollModel
async function saveStudent(student, rollNumber) {
  const newStudent = new GeneratedRollModel({
    exam: student.exam,
    district: student.district,
    taluka: student.taluka,
    center: student.center,
    studName: student.studName,
    gender: student.gender,
    school: student.school,
    Class: student.Class,
    medium: student.medium,
    mobNo: student.mobNo,
    rollNo: rollNumber,
  });

  try {
    await newStudent.save();
   } catch (error) {
    return NextResponse.json({ message: "Error in saving data" });
  }
}

// Handle GET request
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    let exam = searchParams.get("exam");
    let taluka = searchParams.get("taluka");
    let center = searchParams.get("center");

    // Check for required fields
    if (!exam || !taluka || !center) {
      return NextResponse.json({
        success: false,
        message: "exam, taluka, and center are required",
      });
    }

    await connectToDatabase();
    const data = await GeneratedRollModel.find({ exam, taluka, center });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e.message || "An error occurred",
    });
  }
}

// Handle POST request (roll number generation)
export async function POST(req) {
  let success = false;

  try {
    await connectToDatabase();

    const body = await req.json();

    if (!body.center) {
      return NextResponse.json({
        message: "Center name is required.",
        success: false,
      });
    }

    // Fetch center data
    const centerData = await findCenter(body);
    if (!centerData) {
      return NextResponse.json({
        message: "The provided center does not exist.",
        success: false,
      });
    }

    // Fetch students for the center
    const students = await findStudents(centerData.centerId);
    if (students.length === 0) {
     return NextResponse.json({
        message: "No students found for the provided center.",
        success: false,
      });
    }

    // Check if roll numbers are already generated
    const existingRoll = await checkExistingRoll(body.center);
    if (existingRoll) {
      return NextResponse.json({
        message: "Roll numbers have already been generated for this center.",
        success: false,
      });
    }

    let studentSequence = {};
    let rollNumber;

    // Iterate through students and generate roll numbers
    for (const student of students) {
      if (!isStudentValid(student)) {
       continue;
      }

      // Initialize sequence number for the class
      if (!studentSequence[student.ClassId]) {
        studentSequence[student.ClassId] = 101;
      }

      rollNumber = generateRollNumber(student.ClassId, centerData.centerId, studentSequence[student.ClassId]);

      if (isNaN(rollNumber)) {
        continue;
      }

      await saveStudent(student, rollNumber);

      // Increment the sequence number for the class
      studentSequence[student.ClassId]++;
    }

    success = true;
    return NextResponse.json({
      success,
      data: "Roll numbers generated successfully.",
    });
  } catch (error) {
    return NextResponse.json({
      message: error.message || "An error occurred.",
      success: false,
    });
  } finally {
    mongoose.connection.close();
  }
}

// Handle DELETE request
export async function DELETE(req) {
  try {
    const { taluka, center, exam } = await req.json();

    // Check for missing required fields
    if (!exam || !taluka || !center) {
      return NextResponse.json({
        message: "Missing required fields",
        success: false,
      });
    }

    await connectToDatabase();

    const organize = await OrganizeModel.findOne({ centers: center });
    if (!organize) {
      return NextResponse.json({
        message: `No organization found for exam "${exam}", taluka "${taluka}", center "${center}".`,
        success: false,
      });
    }

    const deletegenerated = await GeneratedRollModel.deleteMany({
      exam,
      taluka,
      center,
    });

    if (deletegenerated.deletedCount > 0) {
      return NextResponse.json({
        message: "Record Deleted Successfully",
        success: true,
      });
    } else {
      return NextResponse.json({
        message: "No records deleted. Please check if the query matches the database records.",
        success: false,
      });
    }
  } catch (error) {
    return NextResponse.json({
      message: `An error occurred: ${error.message}`,
      success: false,
    });
  }
}
