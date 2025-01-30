import { Mongouri } from "@/lib/db";
import ClassModel from "@/lib/Models/Master/ClassModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, content) {
  await mongoose.connect(Mongouri);

  let data = await ClassModel.find();

  return NextResponse.json({ data: data });
}


export async function POST(req) {
  const body = await req.json();
  let success = false;

  await mongoose.connect(Mongouri);

  try {
    

    const Class = new ClassModel({
      ClassId: body.id,
      ClassName: body.className,
    });

    const Classse = await Class.save();
    success = true;

    return NextResponse.json({ body: Classse, success: success });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false });
  } finally {
    mongoose.connection.close();
  }
}
export async function PUT(req) {
  const { id, ClassName,clsid } = await req.json();

  if (!id || !ClassName || !clsid) {
    return NextResponse.json({ error: 'Missing required fields' });
  }

  try {
     await mongoose.connect(Mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
    const updatedClass = await ClassModel.findByIdAndUpdate(id, { ClassName, clsid}, { new: true });

    if (!updatedClass) {
      return NextResponse.json({ error: 'Class not found' });
    }

    return NextResponse.json({ success: true, Classrict: updatedClass });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}

export async function DELETE(req) {
  try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
          return new Response(JSON.stringify({ error: 'ID is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
          });
      }

      await mongoose.connect(Mongouri);

      const Class = await ClassModel.findByIdAndDelete(id);

      if (!Class) {
          return new Response(JSON.stringify({ error: 'Class not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
          });
      }

      return new Response(JSON.stringify({ message: 'Deleted successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
      });
  } catch (error) {

      return new Response(JSON.stringify({ error: 'Failed to delete the item' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
      });
  }
}