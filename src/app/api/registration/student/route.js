import { Mongouri } from "@/lib/db";
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import ClassModel from "@/lib/Models/Master/ClassModel";
import StudentModel from "@/lib/Models/Registration/students/StudentModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


export async function POST(req) {
  const body = await req.json();
  let success = false;

  try {
    await mongoose.connect(Mongouri);

    const center = await OrganizeModel.findOne({ centers: body.center });
    if (!center) {
      throw new Error('Center not found');
    }

    const cls = await ClassModel.findOne({ ClassName: body.class });
    if (!cls) {
      throw new Error('Class not found');
    }

    const newStudent = new StudentModel({
      exam: body.exam,
      district: body.district,
      taluka: body.taluka,
      center: center.centers,
      studName: body.studname,
      gender: body.gender,
      school: body.schoolname,
      mobNo: body.mob,
      Class: body.class,
      medium: body.medium,
      ClassId: cls.ClassId,
      centerId: center.centerId,
    });

    await newStudent.save();
    success = true;

    return NextResponse.json({ data: newStudent, success: success });
  } catch (error) {
    return NextResponse.json({ error: error.message, success: false });
  } finally {
    mongoose.connection.close();
  }
}




export async function PUT(req) {
    const { id, studName, gender, school, mobNo, Class, medium } = await req.json();

    // Basic validation
    if (!id || !studName || !gender || !school || !mobNo || !Class || !medium) {
        return NextResponse.json({ error: 'Missing required fields' });
    }

    try {
        await mongoose.connect(Mongouri)

        const classData = await ClassModel.findOne({ ClassName: Class });

        if (!classData) {
            return NextResponse.json({ error: `Class '${Class}' not found` });
        }

        const ClassId = classData.ClassId;

        const updateStudent = await StudentModel.findByIdAndUpdate(
            id,
            { studName, gender, school, mobNo, Class, ClassId, medium },
            { new: true }
        );

        if (!updateStudent) {
            return NextResponse.json({ error: 'Student not found' });
        }

        return NextResponse.json({ success: true, student: updateStudent });
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

      const Class = await StudentModel.findByIdAndDelete(id);

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