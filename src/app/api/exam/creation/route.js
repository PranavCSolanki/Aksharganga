import { Mongouri } from "@/lib/db";
import ExamModel from "@/lib/Models/Exam/ExamModel";
import ClassModel from "@/lib/Models/Master/ClassModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  await mongoose.connect(Mongouri);

  let data = await ExamModel.find({});
  return NextResponse.json({ data: data });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, date, standards } = body;

    await mongoose.connect(Mongouri);

    const lastItem = await ExamModel.findOne({}).sort({ id: -1 }).limit(1);

    const id = lastItem ? lastItem.id + 1 : 1;

    const exam = new ExamModel({
      id,
      name,
      date,
      standards,
    });

    await exam.save();

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  } finally {
    await mongoose.connection.close();
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

    const dist = await ExamModel.findByIdAndDelete({ _id: id });

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

export async function PUT(req) {
  try {
    let { id, name, standards, date } = await req.json();

    if (!id || !name || !date) {
      return NextResponse.json({ error: "Missing required fields" });
    }

    await mongoose.connect(Mongouri);

    // Fetch class data
    let classData = await ClassModel.find();
    if (!classData || !Array.isArray(classData)) {
      return NextResponse.json({ error: "Failed to fetch class data" });
    }

    const classMapping = {};
    classData.forEach((cls) => {
      classMapping[cls._id] = cls.newValue;
    });

    standards = standards.map((item) => {
      return classMapping[item] || item;
    });

    const updateExam = await ExamModel.findByIdAndUpdate(
      id,
      { name, date, standards },
      { new: true }
    );

    if (!updateExam) {
      return NextResponse.json({ error: "Exam not found" });
    }

    return NextResponse.json({
      success: true,
      exam: updateExam,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json({ error: error.message });
  } finally {
    mongoose.connection.close();
  }
}
