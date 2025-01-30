import { Mongouri } from "@/lib/db";
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  let { searchParams } = req.nextUrl;

  let district = searchParams.get("district");
  let taluka = searchParams.get("taluka");


  await mongoose.connect(Mongouri);

  let data = await OrganizeModel.find({
    district: district,
    taluka: taluka,
  }).sort({ centers: 1 });
  return NextResponse.json({ data: data });
}

export async function POST(req, res) {
  try {
    const body = await req.json();
    const { exam, district, taluka, centers } = body.data;

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: "Exam fields is required.",
      });
    } else if (!district) {
      return NextResponse.json({
        success: false,
        error: "District fields is required.",
      });
    } else if (!taluka) {
      return NextResponse.json({
        success: false,
        error: "Taluka fields is required.",
      });
    } else if (!centers || centers.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Center fields is required.",
      });
    }

    await mongoose.connect(Mongouri);

    const savedEntries = [];
    for (const center of centers) {
      const { centerName, centerId } = center;

      const existingEntry = await OrganizeModel.findOne({
        centers: centerName,
        centerId: centerId
      });

      if (existingEntry) {
        return NextResponse.json({
          success: false,
          error: `Center ${centerName} already exists`,
        });
      }

      const lastItem = await OrganizeModel.findOne().sort({ id: -1 });
      const id = lastItem ? lastItem.id + 1 : 1;
      const data = new OrganizeModel({
        id: id,
        exam: exam,
        district: district,
        taluka: taluka,
        centers: centerName,
        centerId: centerId
      });

      const savedData = await data.save();
      savedEntries.push(savedData);
    }

    return NextResponse.json({ success: true, data: savedEntries });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "An error occurred while organizing the exam.",
    });
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}



export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await mongoose.connect(Mongouri);

    const dist = await OrganizeModel.findByIdAndDelete({ _id: id });

    if (!dist) {
      return new Response(JSON.stringify({ error: "District not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {

    return new Response(
      JSON.stringify({ error: "Failed to delete the item" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
