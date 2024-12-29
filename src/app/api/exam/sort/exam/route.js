import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  await mongoose.connect(Mongouri);

  let data = await ExamModel.find().sort({ name: 1 });

  return NextResponse.json({ data: data });
}
