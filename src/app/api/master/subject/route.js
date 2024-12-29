import { Mongouri } from "@/lib/db";
import SubjectModel from "@/lib/Models/Master/SubjectModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


export async function GET(req) {
  let { searchParams } = req.nextUrl;

  let cls = searchParams.get("class");

  await mongoose.connect(Mongouri);

  cls = await SubjectModel.find({ ClassName: cls });

  return NextResponse.json({ data: cls });
}



export async function POST(req) {
  const body = await req.json();
  let success = false;

  await mongoose.connect(Mongouri);

  try {
    const LastItem = await SubjectModel.findOne({}).sort({ SubjectId: -1 }).limit(1);

    let id;
    if (LastItem) {
      const nextId = parseInt(LastItem.SubjectId, 10) + 1;
      id = nextId < 10 ? `0${nextId}` : nextId.toString();
    } else {
      id = '01';
    }

    const Subject = new SubjectModel({
      SubjectId: id,
      ClassName: body.ClassName,
      SubjectName: body.SubjectName,
    });

    const taluka = await Subject.save();
    success = true;
    return NextResponse.json({ body: taluka, success: success });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json({ error: 'Subject already exists in this class', success: false });
    }
    return NextResponse.json({ error: error.message, success: false });
  } finally {
    mongoose.connection.close();
  }
}




export async function PUT(req) {
  const { id, SubjectName } = await req.json();

  console.log("Request Body:", req.body); 
  console.log("ID:", id); 
  console.log("Subject Name:", SubjectName); 

  if (!id || !SubjectName) {
    return NextResponse.json({ error: "Missing required fields" });
  }

  try {
    await mongoose.connect(Mongouri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const updatedSubject = await SubjectModel.findByIdAndUpdate(
      id,
      { SubjectName },
      { new: true }
    );

    if (!updatedSubject) {
      return NextResponse.json({ error: "Subject not found" });
    }

    return NextResponse.json({ success: true, subrict: updatedSubject });
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

    const sub = await SubjectModel.findByIdAndDelete({_id:id});

    if (!sub) {
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
