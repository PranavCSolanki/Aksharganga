import { Mongouri } from "@/lib/db";
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  let { searchParams } = req.nextUrl;
  let district = searchParams.get("district");

  await mongoose.connect(Mongouri);

  let data = await OrganizeModel.aggregate([
    {
      $match: { district: district }
    },
    {
      $group: {
        _id: "$district",
        id: { $first: "$id" },
        exam: { $first: "$exam" },
        taluka: { $first: "$taluka" },
        // centers: { $first: "$centers" }
      }
    },
    {
      $sort: { _id: 1 } 
    }
  ]);

  return NextResponse.json({ data });
}
