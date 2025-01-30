import { Mongouri } from "@/lib/db";
import DistrictModel from "@/lib/Models/Master/DistrictModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, content) {
  await mongoose.connect(Mongouri);

  let data = await DistrictModel.find();

  return NextResponse.json({ data: data });
}


export async function POST(req) {
  const body = await req.json();
  let success = false;

  await mongoose.connect(Mongouri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const LastItem = await DistrictModel.findOne({}).sort({ distId: -1 }).limit(1);

    let id;
    if (LastItem) {
      const nextId = parseInt(LastItem.distId, 10) + 1;
      
      id = nextId < 10 ? `0${nextId}` : nextId.toString();
    } else {
      id = '01';
    }

    // Create a new district document
    const Dist = new DistrictModel({
      distId: id,
      distName: body.distName,
    });

    const dist = await Dist.save();
    success = true;

    return NextResponse.json({ body: dist, success: success });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false });
  } finally {
    mongoose.connection.close();
  }
}
export async function PUT(req) {
  const { id, distName } = await req.json();

  if (!id || !distName) {
    return NextResponse.json({ error: 'Missing required fields' });
  }

  try {
     await mongoose.connect(Mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
    const updatedDistrict = await DistrictModel.findByIdAndUpdate(id, { distName }, { new: true });

    if (!updatedDistrict) {
      return NextResponse.json({ error: 'District not found' });
    }

    return NextResponse.json({ success: true, district: updatedDistrict });
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

      const dist = await DistrictModel.findByIdAndDelete(id);

      if (!dist) {
          return new Response(JSON.stringify({ error: 'District not found' }), {
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