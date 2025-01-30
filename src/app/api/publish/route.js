import { Mongouri } from "@/lib/db";
import publishModel from "@/lib/Models/Result/PublishedResult";
import ResultModel from "@/lib/Models/Result/UploadResult/UploadResult";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { exam } = body;

  if (!exam) {
    return NextResponse.json({
      Success: false,
      message: "The 'exam' parameter is required.",
    });
  }

  try {
    await mongoose.connect(Mongouri);

    // Fetch student data from ResultModel
    let studentData = await ResultModel.find({ exam });

    const preparedData = studentData.map((item) => {
      const totalMarks = item.subjects.reduce(
        (sum, subject) => sum + subject.marks,
        0
      );
      const paperMarks = item.subjects[0]?.marks || 0;

      return {
        Rank: 0,
        exam: exam,
        district: item.district || "",
        taluka: item.taluka || "", 
        center: item.center || "",
        RankType: "No rank",
        totalMarks,
        paperMarks,
        schoolName: item.school || "",
        medium: item.medium || "",
        standard: item.Standard || "",
        studentName: item.StudentName || "",
        rollNo: item.RollNo || "",
        subjects: item.subjects || [],
      };
    });

    // Save all data to the publish collection first
    await publishModel.insertMany(preparedData);

    // Fetch district, taluka, and center data
    const districtsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/master/district`
    );
    const districtsData = await districtsResponse.json();
    const districts = Array.isArray(districtsData)
      ? districtsData
      : districtsData.data;

    for (const district of districts) {
      const talukasResponse = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/taluka?distName=${district.distName}`
      );
      const talukasData = await talukasResponse.json();
      const talukas = Array.isArray(talukasData)
        ? talukasData
        : talukasData.data;

      for (const taluka of talukas) {
        const centersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_HOST}/api/master/center?distName=${district.distName}&taluka=${taluka.TalukaName}`
        );
        const centersData = await centersResponse.json();
        const centers = Array.isArray(centersData)
          ? centersData
          : centersData.data;

        for (const center of centers) {
          const classesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_HOST}/api/master/classes`
          );
          const classesData = await classesResponse.json();
          const classes = Array.isArray(classesData)
            ? classesData
            : classesData.data;

          for (const standard of classes) {
            const rankData = await fetchRankData(
              `${process.env.NEXT_PUBLIC_HOST}/api/rank/centerrankwise`,
              {
                exam,
                standard: standard.ClassName,
                district: district.distName,
                center: center.CenterName,
                taluka: taluka.TalukaName,
              }
            );

            if (rankData.length > 0) {
              for (const item of rankData) {
                await publishModel.updateOne(
                  { rollNo: item.RollNo },
                  {
                    $set: {
                      RankType: item.rankType || "N/A",
                      Rank: item.rank,
                    },
                  }
                );
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      Success: true,
      message: "Data published and updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      Success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
}

const fetchRankData = async (url, payload) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching rank data:", error.message);
    return [];
  }
};


export async function DELETE(req) {
  try {
    await mongoose.connect(Mongouri);
    
    // Delete all records from the publish collection
    await publishModel.deleteMany({});
    
    return NextResponse.json({
      Success: true,
      message: "All data deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      Success: false,
      message: "An error occurred while deleting data",
      error: error.message,
    });
  }
}

export async function GET(req) {
  try {
    await mongoose.connect(Mongouri);
    
    // Check if there is any data in the publish collection
    const data = await publishModel.find({});

    if (data.length > 0) {
      return NextResponse.json({
        Success: true,
        message: "Data exists",
        hasData: true,
      });
    } else {
      return NextResponse.json({
        Success: true,
        message: "No data found",
        hasData: false,
      });
    }
  } catch (error) {
    return NextResponse.json({
      Success: false,
      message: "An error occurred while checking data",
      error: error.message,
    });
  }
}

