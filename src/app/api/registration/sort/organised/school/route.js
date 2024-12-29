import { Mongouri } from "@/lib/db";
import StudentModel from "@/lib/Models/Registration/students/StudentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  let { searchParams } = req.nextUrl;
  let center = searchParams.get("center");

  // Connect to MongoDB
  await mongoose.connect(Mongouri);

  let schools = await StudentModel.distinct('school', { center: center });

  return NextResponse.json({ schools });
}
