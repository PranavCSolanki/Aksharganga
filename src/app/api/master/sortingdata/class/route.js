import { Mongouri } from "@/lib/db";
import ClassModel from "@/lib/Models/Master/ClassModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
export async function GET(req, content) {
    await mongoose.connect(Mongouri);

    let data = await ClassModel.find().sort({ ClassName: 1 });

    return NextResponse.json({ data: data });
}