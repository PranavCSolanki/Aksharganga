import { Mongouri } from "@/lib/db";
import StudentModel from "@/lib/Models/Registration/students/StudentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  let { searchParams } = req.nextUrl;
  let center = searchParams.get("center");

  // Connect to MongoDB
  await mongoose.connect(Mongouri);

  // Fetch distinct 'Class' values for the given center
  let classes = await StudentModel.distinct('Class', { center: center });

  // Return the unique class values as JSON
  return NextResponse.json({ classes });
}
