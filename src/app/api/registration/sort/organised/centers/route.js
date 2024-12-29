import { Mongouri } from "@/lib/db";
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  let { searchParams } = req.nextUrl;
  let taluka = searchParams.get("taluka");

  await mongoose.connect(Mongouri);

  let data = await OrganizeModel.aggregate([
    {
      $match: { taluka: taluka }
    },
    {
      $group: {
        _id: "$taluka",
        id: { $first: "$id" },
        exam: { $first: "$exam" },
        centers: { $push: "$centers" }
      }
    },
    {
      $sort: { _id: 1 } 
    }
  ]);

  return NextResponse.json({ data });
}
