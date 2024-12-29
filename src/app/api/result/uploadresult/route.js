import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';
import { Mongouri } from '@/lib/db';
import mongoose from 'mongoose';
import ExamModel from '@/lib/Models/Exam/ExamModel';
import ResultModel from '@/lib/Models/Result/UploadResult/UploadResult';
import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';

async function parseFile(buffer, mimeType) {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Assuming data starts at row 3 without headers
    return XLSX.utils.sheet_to_json(sheet, { header: 1, range: 2 });
  } else if (mimeType === 'text/csv' || mimeType === 'text/tab-separated-values') {
    return await parseCSV(buffer);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function parseCSV(buffer) {
  const csvText = buffer.toString('utf-8');
  const rows = csvText.split('\n').map(row => row.split(','));s
  return rows;
}

function parseRowData(row) {
  // Check if the row is empty (all cells are empty)
  if (row.every(cell => cell === '' || cell === null || cell === undefined)) {
    throw new Error('Empty row'); // Skip empty rows by throwing an error
  }

  // Ignore the first two columns and only validate the 3rd (roll) and 4th (marks)
  const roll = row[2] ? row[2].toString() : '';  // Ensure roll is a string
  const marks = row[3];

  if (marks === '' || marks === undefined || isNaN(marks)) {
    throw new Error('Invalid marks');
  }

  return {
    roll: roll,
    marks: parseFloat(marks) || 0, // Convert marks to float or assign 0 if missing
  };
}




async function processRows(rows, exam, district, taluka, center, subject, cls, medium) {
  try {
    const examData = await ExamModel.findOne({ name: exam });
    if (!examData) {
      throw new Error(`Exam "${exam}" not found.`);
    }

    const validRows = [];
    const skippedRows = [];

    // Process each row of data
    for (const row of rows) {
      try {
        const rowData = parseRowData(row);

        // Look up the student's name and school in GeneratedRollModel by roll number
        const studentData = await GeneratedRollModel.findOne({
          rollNo: rowData.roll,
        });

        if (!studentData) {
          // If no student is found, skip this row
          skippedRows.push({ ...rowData, reason: 'Student not found' });
          continue; // Skip to the next row if the student is not found
        }

        // Check if a result with the same RollNo and exam already exists
        const existingRecord = await ResultModel.findOne({
          RollNo: rowData.roll,
          exam: exam,
        });

        if (existingRecord) {
          // If a record exists, skip this row
          skippedRows.push({ ...rowData, reason: 'Duplicate entry' });
          continue; // Skip to the next row
        }

        // Add the valid row with student details
        validRows.push({
          exam,
          center,
          district,
          taluka,
          subject,
          class: cls,
          medium,
          RollNo: rowData.roll,
          marks: rowData.marks,
          studName: studentData.studName,  // Include student name from GeneratedRollModel
          school: studentData.school,      // Include school name from GeneratedRollModel
        });
      } catch (error) {
        // If any validation fails, add the row to skippedRows
        skippedRows.push({ row, reason: error.message });
      }
    }

    if (validRows.length === 0) {
      return {
        message: `No valid data found in the file for exam "${exam}".`,
        success: false,
        skippedRows,
      };
    }

    // Insert valid rows into the database
    const savedRows = await ResultModel.insertMany(validRows);

    return {
      rows: savedRows,
      skippedRows,
      success: true,
    };
  } catch (error) {
    throw new Error(`Error processing rows: ${error.message}`);
  }
}


export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');
    const district = data.get('district');
    const taluka = data.get('taluka');
    const center = data.get('center');
    const exam = data.get('exam');
    const cls = data.get('cls');
    const subject = data.get('subject');
    const medium = data.get('medium');

    const requiredFields = { file, district, taluka, center, exam, cls, subject, medium };
    const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        success: false
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(Mongouri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let jsonData;

    try {
      jsonData = await parseFile(buffer, file.type);
    } catch (error) {
      return NextResponse.json({ message: `Error parsing file: ${error.message}`, success: false });
    }

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ message: `No valid data found in the file for exam "${exam}".`, success: false });
    }

    const columnData = await processRows(jsonData, exam, district, taluka, center, subject, cls, medium);

    if (!columnData.success) {
      return NextResponse.json({ message: columnData.message, success: false, skippedRows: columnData.skippedRows });
    }

    return NextResponse.json({
      message: 'File uploaded and processed successfully',
      success: true,
      data: columnData.rows,
      skippedRows: columnData.skippedRows,
    });
  } catch (error) {
    return NextResponse.json({ message: `An error occurred: ${error.message}`, success: false });
  }
}
