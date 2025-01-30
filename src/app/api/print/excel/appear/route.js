import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import { Mongouri } from '@/lib/db';
import { NextResponse } from 'next/server';
import { EventEmitter } from 'events';
import StudentModel from '@/lib/Models/Registration/students/StudentModel';

// Increase the limit to 20
EventEmitter.defaultMaxListeners = 20;

export async function GET(req) {
    let { searchParams } = req.nextUrl;

    let exam = searchParams.get("exam");
    let center = searchParams.get("center");
    let sortOrder = searchParams.get("sortOrder") || 'default'; 

    if (!exam || !center) {
        return NextResponse.json({ error: 'Parameter is required' });
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(Mongouri);

        // Determine the sort order
        let sortCriteria;
        if (sortOrder === 'ascending') {
            sortCriteria = { Class: 1, studName: 1 };
        } else if (sortOrder === 'descending') {
            sortCriteria = { Class: -1, studName: -1 };
        } else {
            sortCriteria = {}; // Default order (as uploaded)
        }

        // Find data from MongoDB
        const data = await StudentModel.find({
            exam: exam,
            center: center            
        }).sort(sortCriteria).lean();

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Define the columns to be included in the Excel file, including 'sr no'
        const columns = ['sr no', 'exam', 'studName', 'gender', 'Class', 'medium', 'school', 'center', 'taluka', 'district', 'mobNo'];
        // Add column headers dynamically based on the specified columns
        worksheet.columns = columns.map(key => ({ header: key, key }));

        // Add rows to the worksheet, filtering only the specified columns
        data.forEach((item, index) => {
            const filteredItem = columns.reduce((obj, key) => {
                if (key === 'sr no') {
                    obj[key] = index + 1; // Assign serial number
                } else {
                    obj[key] = item[key];
                }
                return obj;
            }, {});
            worksheet.addRow(filteredItem);
        });

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Create the response
        const response = new NextResponse(buffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${center}_${exam}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Length': buffer.length,
            }
        });

        // Return the response to trigger file download
        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' });
    } finally {
        // Always disconnect the database connection after the request is done
        await mongoose.disconnect();
    }
}
