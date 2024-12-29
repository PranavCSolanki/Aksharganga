import { Mongouri } from "@/lib/db";
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  await mongoose.connect(Mongouri);

  // Use aggregation to group by district and get unique values
  let data = await OrganizeModel.aggregate([
    {
      $group: {
        _id: "$district",
        id: { $first: "$id" },
        exam: { $first: "$exam" },
        // taluka: { $first: "$taluka" },
        // centers: { $first: "$centers" }
      }
    },
    {
      $sort: { district: 1 } // Sort by district (which is now in _id)
    }
  ]);

  return NextResponse.json({ data });
}
