import { Mongouri } from "@/lib/db";
import TalukaModel from "@/lib/Models/Master/TalukaModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
export async function GET(req, content) {
    
    let { searchParams } = req.nextUrl
    let district = searchParams.get("district") 
    
    await mongoose.connect(Mongouri);

    let data = await TalukaModel.find({distName:district}).sort({ TalukaName: 1 });

    return NextResponse.json({ data: data });
}