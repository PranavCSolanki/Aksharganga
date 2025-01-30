import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Mongouri } from '@/lib/db';
import ExamModel from '@/lib/Models/Exam/ExamModel';
import ResultModel from '@/lib/Models/Result/UploadResult/UploadResult';
import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';
import SubjectModel from '@/lib/Models/Master/SubjectModel';

async function parseFile(buffer, mimeType) {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, range: 2 }); // Assuming data starts at row 3
  } else if (mimeType === 'text/csv' || mimeType === 'text/tab-separated-values') {
    return buffer.toString('utf-8').split('\n').map(row => row.split(','));
  } else {
    throw new Error('Unsupported file type');
  }
}

// Function to get the number of subjects for a particular class
async function getNumberOfSubjectsForClass(className) {
    try {
        const subjectCount = await SubjectModel.countDocuments({ ClassName: className });
        return subjectCount;
    } catch (error) {
        console.error(`Error fetching subject count for class "${className}":`, error);
        throw error;
    }
}

// Function to parse row data
function parseRowData(row, cls) {
    if (row.every(cell => !cell || cell.toString().trim() === '')) {
        throw new Error('Empty row');
    }

    const roll = row[2] ? row[2].toString() : '';
    const marks = row[3];

    if (!roll || isNaN(marks)) {
        throw new Error('Invalid roll number or marks');
    }

    if (roll.charAt(0) !== cls.charAt(0)) {
        throw new Error('Wrong file uploaded for the selected class');
    }

    return { roll, marks: parseFloat(marks) || 0 };
}


async function processRows(rows, exam, district, taluka, center, subject, cls, maxUploads) {
  try {
      // Validate the exam exists
      const examData = await ExamModel.findOne({ name: exam });
      if (!examData) {
          throw new Error(`Exam "${exam}" not found.`);
      }

      // Check if the results for this subject and class have reached the maximum upload count
      const existingResultsCount = await ResultModel.countDocuments({
        RollNo: rows[2],
      });
      if (existingResultsCount >= maxUploads) {
          throw new Error(`Results has been uploaded`);
      }

      const validRows = [];
      const skippedRows = [];

      for (const row of rows) {
          try {
              // Parse individual row data
              const rowData = parseRowData(row, cls);

              // Check if the student exists
              const studentData = await GeneratedRollModel.findOne({ rollNo: rowData.roll });
              if (!studentData) {
                  skippedRows.push({ ...rowData, reason: 'Student not found in the system.' });
                  continue;
              }

              // Check if the record already exists in the results
              const existingRecord = await ResultModel.findOne({ RollNo: rowData.roll, exam });

              if (existingRecord) {
                  // Add the new subject and marks to the existing record
                  const subjectExists = existingRecord.subjects.find((s) => s.subject === subject);
                  if (subjectExists) {
                      skippedRows.push({
                          ...rowData,
                          reason: `Subject "${subject}" already exists for roll number "${rowData.roll}".`,
                      });
                      continue;
                  }

                  existingRecord.subjects.push({
                      subject: subject,
                      marks: rowData.marks,
                  });

                  // Save the updated record
                  await existingRecord.save();
                  validRows.push({ rollNo: rowData.roll, status: 'Updated' });
              } else {
                  // Create a new record if one does not exist
                  const newRecord = new ResultModel({
                      exam,
                      center,
                      district,
                      taluka,
                      Standard: cls,
                      subjects: [
                          {
                              subject: subject,
                              marks: rowData.marks,
                          },
                      ],
                      RollNo: rowData.roll,
                      marks: rowData.marks, // Overall marks for the student
                      StudentName: studentData.studName,
                      medium: studentData.medium,
                      school: studentData.school,
                  });

                  await newRecord.save();
                  validRows.push({ rollNo: rowData.roll, status: 'Inserted' });
              }
          } catch (error) {
              // Handle errors for specific rows
              console.error(`Error processing row: ${error.message}`);
              skippedRows.push({ row, reason: error.message });
          }
      }

      if (validRows.length === 0) {
          return {
              success: false,
              message: `No valid data found for exam "${exam}".`,
              skippedRows,
          };
      }

      return {
          success: true,
          rows: validRows,
          skippedRows,
      };
  } catch (error) {
      console.error(`Error in processRows: ${error.message}`);
      throw new Error(`Failed to process rows: ${error.message}`);
  }
}


export async function POST(req) {
  try {
      const data = await req.formData();

      const district = data.get('district');
      const taluka = data.get('taluka');
      const center = data.get('center');
      const exam = data.get('exam');
      const cls = data.get('cls');
      const files = data.getAll('files');
      const subjects = data.getAll('subjects');

      if (!district || !taluka || !center || !exam || !cls || files.length === 0 || subjects.length === 0) {
          return NextResponse.json({
              success: false,
              message: 'Required fields are missing.',
          });
      }

      if (files.length !== subjects.length) {
          return NextResponse.json({
              success: false,
              message: 'Mismatch between the number of files and subjects provided.',
          });
      }

      if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(Mongouri, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
          });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
          const results = [];
          const skippedRowsSummary = [];

          // Determine the maximum number of uploads allowed for each subject
          const maxUploads = await getNumberOfSubjectsForClass(cls);

          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const subject = subjects[i];

              const subjectData = await SubjectModel.findOne({ SubjectName: subject, ClassName: cls });
              if (!subjectData) {
                  results.push({
                      success: false,
                      subject,
                      message: `Subject "${subject}" does not exist for class "${cls}".`,
                  });
                  continue;
              }

              const buffer = Buffer.from(await file.arrayBuffer());
              let jsonData;
              try {
                  jsonData = await parseFile(buffer, file.type);
              } catch (error) {
                  results.push({
                      success: false,
                      subject,
                      message: `Error parsing file for subject "${subject}": ${error.message}`,
                  });
                  continue;
              }

              if (!jsonData || jsonData.length === 0) {
                  results.push({
                      success: false,
                      subject,
                      message: `No valid data found in the file for subject "${subject}".`,
                  });
                  continue;
              }

              try {
                  const columnData = await processRows(jsonData, exam, district, taluka, center, subject, cls, maxUploads);
                  results.push({
                      success: columnData.success,
                      subject,
                      message: columnData.success
                          ? `File for subject "${subject}" uploaded successfully.`
                          : `Failed to process file for subject "${subject}": ${columnData.message}`,
                      data: columnData.rows,
                      skippedRows: columnData.skippedRows,
                  });
                  skippedRowsSummary.push(...columnData.skippedRows);
              } catch (error) {
                  results.push({
                      success: false,
                      subject,
                      message: error.message,
                  });
              }
          }

          const allSuccessful = results.every(result => result.success);

          if (allSuccessful) {
              await session.commitTransaction();
          } else {
              await session.abortTransaction();
          }

          session.endSession();

          return NextResponse.json({
              success: allSuccessful,
              message: allSuccessful
                  ? 'All files processed successfully.'
                  : 'Please check the file',
              details: results,
              skippedRowsSummary,
          });
      } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
      }
  } catch (error) {
    
      return NextResponse.json({
          success: false,
          message: `An error occurred: ${error.message}`,
      });
  }
}






export async function GET(req) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');
    const taluka = searchParams.get('taluka');
    const center = searchParams.get('center');
    const exam = searchParams.get('exam');
    const cls = searchParams.get('cls');

    // Validate required parameters
    if (!district || !taluka || !center || !exam || !cls) {
      return NextResponse.json({
        success: false,
        message: 'Required query parameters are missing.',
      });
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(Mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Build the query
    const query = {
      district: district,
      taluka: taluka,
      center: center,
      exam: exam,
      Standard: cls,
    };

    // Fetch data from the database
    const data = await ResultModel.find(query);

    // Check if data exists
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No data found for the provided parameters.',
      });
    }

    // Find the maximum number of subjects
    // const maxSubjects = await ResultModel.aggregate([
    //   { $unwind: "$subjects" },
    //   { $group: { _id: "$_id", count: { $sum: 1 } } },
    //   { $group: { _id: null, maxCount: { $max: "$count" } } }
    // ]);

    // const maxPapers = maxSubjects.length > 0 ? maxSubjects[0].maxCount : 0;

    // Dynamically prepare columns and data
    const formattedData = [];
    const columns = [
      'Sr. No.',
      'Roll No.',
      'Student Name',
      'Standard',
      'Medium',
      'School Name',
    ];
    const dynamicColumns = new Set(); // Track dynamic columns for papers

    data.forEach((record, index) => {
      const subjectMarks = {};
      let totalMarks = 0; // To calculate the total marks
      const subjects = record.subjects || []; // Handle cases where subjects might not exist

      subjects.forEach((subject, idx) => {
        if (idx < 2) { // Use dynamic maxPapers
          const paperName = `Paper${idx + 1}`;
          dynamicColumns.add(paperName); // Add unique paper names to columns
          subjectMarks[paperName] = subject.marks || 0;
          totalMarks += subject.marks || 0;
        }
      });

      // Combine record fields and dynamic subject marks
      formattedData.push({
        SrNo: index + 1,
        RollNo: record.RollNo,
        StudentName: record.StudentName,
        Standard: record.Standard,
        Medium: record.medium,
        school: record.school,
        ...subjectMarks, 
        total: totalMarks, 
      });
    });

    // Add dynamic columns to the final columns array
    const finalColumns = [...columns, ...dynamicColumns, 'total'];

    return NextResponse.json({
      success: true,
      message: 'Data retrieved successfully.',
      columns: finalColumns,
      data: formattedData,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
}





export async function DELETE(req) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const district = searchParams.get('district');
    const taluka = searchParams.get('taluka');
    const center = searchParams.get('center');
    const exam = searchParams.get('exam');
    const cls = searchParams.get('cls');

    // Validate required parameters
    if (!district || !taluka || !center || !exam || !cls) {
      return NextResponse.json({
        success: false,
        message: 'Required query parameters are missing.',
      });
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(Mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // Build the query
    const query = {
      district: district,
      taluka: taluka,
      center: center,
      exam: exam,
      Standard: cls,
    };

    // Delete data from the database
    const deleteResult = await ResultModel.deleteMany(query);

    // Check if any documents were deleted
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'No data found to delete for the provided parameters.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Data deleted successfully.',
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
}