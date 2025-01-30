import fs, { writeFile, access, constants, mkdir } from 'fs/promises';
import * as XLSX from 'xlsx';
import path from 'path';
import { NextResponse } from 'next/server';
import { Mongouri } from '@/lib/db';
import ClassModel from '@/lib/Models/Master/ClassModel';
import OrganizeModel from "@/lib/Models/Exam/OrganiseModel";
import mongoose from 'mongoose';
import StudentModel from '@/lib/Models/Registration/students/StudentModel';
import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';
import ExamModel from '@/lib/Models/Exam/ExamModel';

const FILE_EXTENSIONS = ['.xlsx', '.xls', '.xlsm', '.xltm', '.xlam', '.ods', '.ots', '.xlsb', '.csv', '.tsv'];

export async function DELETE(req) {
  try {
    const { taluka, center, exam } = await req.json();

    if (!exam || !taluka || !center) {
      return NextResponse.json({ message: 'Missing required fields', success: false });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const organize = await OrganizeModel.findOne({ centers: center });
    if (!organize) {
      return NextResponse.json({ message: `No organization found for exam "${exam}", taluka "${taluka}", center "${center}".`, success: false });
    }

    const baseFileName = `${taluka}_${center}_${exam}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    const files = await fs.readdir(uploadsDir);
    const matchingFile = files.find(file =>
      file.startsWith(baseFileName) && FILE_EXTENSIONS.some(ext => file.endsWith(ext))
    );

    const deleteResult = await StudentModel.deleteMany({ exam, taluka, center });
    const deleteGenerated = await GeneratedRollModel.deleteMany({ exam, taluka, center });

 
    if (deleteResult.deletedCount > 0 || deleteGenerated.deletedCount > 0) {
      if (matchingFile) {
        const filePath = path.join(uploadsDir, matchingFile);
        await fs.unlink(filePath);
        return NextResponse.json({
          message: 'File and associated student records deleted successfully',
          success: true,
          deletedCount: deleteResult.deletedCount,
          generatedDeletedCount: deleteGenerated.deletedCount,
        });
      } else {
        return NextResponse.json({
          message: 'No file found, but associated student records deleted',
          success: true,
          deletedCount: deleteResult.deletedCount,
          generatedDeletedCount: deleteGenerated.deletedCount,
        });
      }
    } else {
      return NextResponse.json({
        message: 'No records deleted. Please check if the query matches the database records.',
        success: false
      });
    }
  } catch (error) {
    return NextResponse.json({ message: `An error occurred: ${error.message}`, success: false });
  }
}

const REQUIRED_COLUMNS = ['Students Name', 'Std', 'Medium', 'Gender', 'School Name', 'Mob. No.'];



async function parseFile(buffer, mimeType) {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  } else if (mimeType === 'text/csv' || mimeType === 'text/tab-separated-values') {
    return await parseCSV(buffer, mimeType);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function getClassString(clsId) {
  try {
    const classDoc = await ClassModel.findOne({ ClassId: Number(clsId) });

    if (classDoc) {
      return { className: classDoc.ClassName, clsId: clsId };
    }
  } catch (error) {
    return { className: 'Unknown', clsId: clsId }; 
  }
}



function getMediumString(medium) {
  switch (medium) {
    case 1: return 'Marathi';
    case 2: return 'Semi English';
    case 3: return 'English';
    default: return 'Unknown';
  }
}

const VALID_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls (binary format)
  'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
  'application/vnd.ms-excel.template.macroEnabled.12', // .xltm
  'application/vnd.ms-excel.addin.macroEnabled.12', // .xlam
  'application/vnd.oasis.opendocument.spreadsheet', // .ods
  'application/vnd.oasis.opendocument.spreadsheet-template', // .ots
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsb
  'text/csv', // .csv
  'text/tab-separated-values', // .tsv
];

// Function to handle file upload and processing
export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get('file');
    const district = data.get('district');
    const taluka = data.get('taluka');
    const center = data.get('center');
    const exam = data.get('exam');

    if (!exam || !district || !taluka || !center || !file) {
      return NextResponse.json({ message: 'Missing required fields', success: false });
    }

    if (!VALID_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'Unsupported file type.', success: false });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let jsonData;

    try {
      jsonData = await parseFile(buffer, file.type);
    } catch (error) {
      return NextResponse.json({ message: `Error parsing file: ${error.message}`, success: false });
    }

    const headers = Array.isArray(jsonData[0]) ? jsonData[0] : Object.keys(jsonData[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(column => !headers.includes(column));

    if (missingColumns.length > 0) {
      return NextResponse.json({ message: `Missing columns: ${missingColumns.join(', ')}`, success: false });
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(Mongouri);
    }

    // Fetch centerId from OrganizeModel
    const centerData = await OrganizeModel.findOne({ centers: center });
    if (!centerData) {
      return NextResponse.json({ message: `Center "${center}" not found.`, success: false });
    }
    const centerId = centerData.centerId;

    // Process rows and validate the standards
    const columnData = await processRows(jsonData.slice(1), exam, district, taluka, center, centerId);

    if (!columnData.success) {
      return NextResponse.json({ message: columnData.message, success: false });
    }

    // File uploading logic
    const fileName = `${taluka}_${center}_${exam}${path.extname(file.name)}`;
    const filePath = path.join('./public/uploads', fileName);

    try {
      await access(filePath, constants.F_OK);
      return NextResponse.json({ message: 'File already uploaded', success: false });
    } catch {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, buffer);
    }

    return NextResponse.json({
      message: 'File uploaded and processed successfully',
      success: true,
      data: columnData.rows,
      filePath,
    });
  } catch (error) {
    return NextResponse.json({ message: `An error occurred: ${error.message}`, success: false });
  }
}

function parseRowData(row) {
  const rowData = {};
  REQUIRED_COLUMNS.forEach((column, index) => {
    rowData[column] = row[index + 1];
  });
  return rowData;
}

async function processRows(rows, exam, district, taluka, center, centerId) {
  try {
    const examData = await ExamModel.findOne({ name: exam });
    if (!examData) {
      throw new Error(`Exam "${exam}" not found.`);
    }

    const invalidStandards = new Set();
    const validRows = [];

    for (const row of rows) {
      const rowData = parseRowData(row);

      if (!rowData.Std) {
        continue;
      }

      const standard = await getClassString(rowData.Std);

      if (!examData.standards.includes(standard.className)) {
        invalidStandards.add(standard.className);
      
      } else {
        validRows.push({ rowData, standard });
      }
    }

    if (invalidStandards.size > 0) {
      const invalidStandardsList = Array.from(invalidStandards).join(', ');
      return {
        message: `Exam "${exam}" does not conduct exams for the following standards: ${invalidStandardsList}`,
        success: false,
      };
    }

    if (validRows.length === 0) {
      return {
        message: `No valid standards were found in the provided file for the exam "${exam}".`,
        success: false,
      };
    }

    const savedRows = [];
    for (const { rowData, standard } of validRows) {
      savedRows.push(await processValidRow(rowData, exam, district, taluka, center, centerId, standard));
    }

    return { rows: savedRows, success: true };
  } catch (error) {
    throw new Error(`Error processing rows: ${error.message}`);
  }
}

async function processValidRow(rowData, exam, district, taluka, center, centerId, standard) {
  try {
    const gender = rowData.Gender === 'F' ? 'Female' : rowData.Gender === 'M' ? 'Male' : 'Unknown';

    const existingStudent = await StudentModel.findOne({
      exam,
      district,
      taluka,
      center,
      studName: rowData['Students Name'],
    });

    if (existingStudent) {
      return existingStudent;
    }

    const student = new StudentModel({
      exam,
      district,
      taluka,
      center,
      centerId, // Adding the centerId to the StudentModel
      studName: rowData['Students Name'],
      gender,
      school: rowData['School Name'],
      mobNo: rowData['Mob. No.'],
      Class: standard.className,
      ClassId: standard.clsId,
      medium: getMediumString(rowData.Medium),
    });

    return await student.save();
  } catch (error) {
    throw new Error(`Error saving student record: ${error.message}`);
  }
}
