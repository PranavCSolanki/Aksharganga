import { Mongouri } from "@/lib/db";
import CoOrdinatorModel from "@/lib/Models/Master/CoOrdinatorModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, content) {
  await mongoose.connect(Mongouri);

  let data = await CoOrdinatorModel.find();

  return NextResponse.json({ data: data });
}

export async function POST(req) {
  const body = await req.json();
  

  await mongoose.connect(Mongouri);

  try {
    const LastItem = await CoOrdinatorModel.findOne({})
      .sort({ CoOrdinatorId: -1 })
      .limit(1);

    let id;
    if (LastItem) {
      const nextId = parseInt(LastItem.CoOrdinatorId, 10) + 1;
      id = nextId < 10 ? `0${nextId}` : nextId.toString();
    } else {
      id = "01";
    }

    let lname = body.lname.toLowerCase();
    let fname = body.fname.slice(0, 2).toLowerCase();
    let flast = body.fname.slice(-1).toLowerCase();
    let mob = String(body.mob).slice(-3);

    let UserName = body.email;
    let Password = `${lname}${fname}${flast}@${mob}`;

    const Co_Ordinator = new CoOrdinatorModel({
      CoOrdinatorId: id,
      FirstName: body.fname,
      LastName: body.lname,
      Password: Password,
      Address: body.address,
      Mobile1: body.mob,
      email: body.email,
      userName: UserName,
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
    let { id, FirstName, LastName, Address, Mobile1, Password } = await req.json();

    

    if (!id || !FirstName || !LastName || !Address || !Mobile1 || !Password) {
      return NextResponse.json({ error: "Missing required fields" });
    }

    await mongoose.connect(Mongouri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const updatedCoordinator = await CoOrdinatorModel.findByIdAndUpdate(
      id,
      { FirstName, LastName, Address, Mobile1, Password },
      { new: true }
    );

    if (!updatedCoordinator) {
      return NextResponse.json({ error: "Coordinator not found" });
    }

    return NextResponse.json({ success: true, Coordinator: updatedCoordinator });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  } finally {
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

    const dist = await CoOrdinatorModel.findByIdAndDelete({ _id: id });

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
