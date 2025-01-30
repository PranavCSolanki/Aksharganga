import { Mongouri } from "@/lib/db";
import CenterModel from "@/lib/Models/Master/CenterModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";



export async function GET(req) {
  let { searchParams } = req.nextUrl;
  let dist = searchParams.get("distName");
  let taluka = searchParams.get("taluka");
  let coOrd = searchParams.get("coordinator");

  let data;

  await mongoose.connect(Mongouri);

  if (dist && taluka && coOrd) {
    data = await CenterModel.find({ District: dist, Taluka: taluka, CoOrdinator: coOrd });
  } else if (dist && taluka) {
    data = await CenterModel.find({ District: dist, Taluka: taluka });
  } else if (dist && coOrd) {
    data = await CenterModel.find({ District: dist, CoOrdinator: coOrd });
  } else if (dist) {
    data = await CenterModel.find({ District: dist });
  } else if (coOrd) {
    data = await CenterModel.find({ CoOrdinator: coOrd });
  } else {
    data = await CenterModel.find();
  }

  return NextResponse.json({ data: data });
}


export async function POST(req) {
  const body = await req.json();

  await mongoose.connect(Mongouri);

  try {
    const LastItem = await CenterModel.findOne({})
      .sort({ CenterId: -1 })
      .limit(1);

    let id;
    if (LastItem) {
      id = LastItem.CenterId + 1;
    } else {
      id = 101;
    }

    const Co_Ordinator = new CenterModel({
      CenterId: id,
      District: body.district,
      Taluka: body.taluka,
      CoOrdinator: body.coordinator,
      CenterName: body.center,
    });

    const Co_Ordinators = await Co_Ordinator.save();

    return NextResponse.json({ body: Co_Ordinators, success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false });
  } finally {
    mongoose.connection.close();
  }
}

export async function PUT(req) {
  try {
    // Parse request body
    let { id, CenterName } = await req.json();

    if (!id || !CenterName) {
      return NextResponse.json({ error: 'Missing required fields' });
    }

    // Connect to MongoDB
    await mongoose.connect(Mongouri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Update CenterModel by id
    const updatedCenter = await CenterModel.findByIdAndUpdate(
      id,
      { CenterName },
      { new: true }
    );

    if (!updatedCenter) {
      return NextResponse.json({ error: 'Center not found' });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      Center: updatedCenter,
      // updatedOrganizeModel,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  } finally {
    // Close the mongoose connection
    mongoose.connection.close();
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

    const dist = await CenterModel.findByIdAndDelete({ _id: id });

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
