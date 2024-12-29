import { Mongouri } from "@/lib/db";
import TalukaModel from "@/lib/Models/Master/TalukaModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req) {
  let { searchParams } = req.nextUrl;

  let dist = searchParams.get("distName");

  await mongoose.connect(Mongouri);

  dist = await TalukaModel.find({ distName: dist });

  return NextResponse.json({ data: dist });
}

export async function POST(req) {
  const body = await req.json();
  let success = false;

  await mongoose.connect(Mongouri);

  try {
    const LastItem = await TalukaModel.findOne({})
      .sort({ TalukaId: -1 })
      .limit(1);

    let id;
    if (LastItem) {
      const nextId = parseInt(LastItem.TalukaId, 10) + 1;

      id = nextId < 10 ? `0${nextId}` : nextId.toString();
    } else {
      id = "01";
    }

    const Taluka = new TalukaModel({
      TalukaId: id,
      distName: body.distName,
      TalukaName: body.TalukaName,
    });

    const taluka = await Taluka.save();
    success = true;
    return NextResponse.json({ body: taluka, success: success });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false });
  } finally {
    mongoose.connection.close();
  }
}

export async function PUT(req) {
  const { id, TalukaName } = await req.json();

  console.log("Request Body:", req.body);
  console.log("ID:", id);
  console.log("Taluka Name:", TalukaName);

  if (!id || !TalukaName) {
    return NextResponse.json({ error: "Missing required fields" });
  }

  try {
    await mongoose.connect(Mongouri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const updatedTaluka = await TalukaModel.findByIdAndUpdate(
      id,
      { TalukaName },
      { new: true }
    );

    if (!updatedTaluka) {
      return NextResponse.json({ error: "Taluka not found" });
    }

    return NextResponse.json({ success: true, district: updatedTaluka });
  } catch (error) {
    return NextResponse.json({ error: error.message });
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

    const dist = await TalukaModel.findByIdAndDelete({ _id: id });

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
    console.error("Error during DELETE request:", error);

    return new Response(
      JSON.stringify({ error: "Failed to delete the item" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
