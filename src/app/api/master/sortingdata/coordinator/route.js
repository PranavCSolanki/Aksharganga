import { Mongouri } from "@/lib/db";
import CoOrdinatorModel from "@/lib/Models/Master/CoOrdinatorModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, content) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(Mongouri);
    }

    let data = await CoOrdinatorModel.aggregate([
      {
        $addFields: {
          lowerFirstName: { $toLower: "$FirstName" },
        },
      },
      {
        $sort: { lowerFirstName: 1 },
      },
      {
        $project: {
          lowerFirstName: 0,
        },
      },
    ]);
    return NextResponse.json({ data: data });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false });
  } 
}
