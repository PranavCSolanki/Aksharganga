import { Mongouri } from "@/lib/db";
import DistrictModel from "@/lib/Models/Master/DistrictModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  await mongoose.connect(Mongouri);

  let data = await DistrictModel.find().sort({ distName: 1 });

  return NextResponse.json({ data: data });
}
