import { Mongouri } from "@/lib/db";
import CenterModel from "@/lib/Models/Master/CenterModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {

  let { searchParams } = req.nextUrl;

  let taluka = searchParams.get("taluka");
  
  await mongoose.connect(Mongouri);


  let data = await CenterModel.find({Taluka:taluka}).sort({ CenterName: 1 });

  return NextResponse.json({ data: data });
}
