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
    console.log(exam, center);

    if (!exam || !center) {
        return NextResponse.json({ error: 'Parameter is required' });
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(Mongouri);

        // Find data from MongoDB
        const data = await StudentModel.find({ exam: exam, center: center });

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Define the columns to be included in the Excel file
        const columns = ['exam', 'studName', 'gender', 'Class', 'medium','school','center','taluka','district', 'mobNo' ];

        // Add column headers dynamically based on the specified columns
        worksheet.columns = columns.map(key => ({ header: key, key }));

        // Add rows to the worksheet, filtering only the specified columns
        data.forEach(item => {
            const filteredItem = columns.reduce((obj, key) => {
                obj[key] = item[key];
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
        console.error('Error generating Excel file:', error);
        return NextResponse.json({ error: 'Internal Server Error' });
    } finally {
        // Always disconnect the database connection after the request is done
        await mongoose.disconnect();
    }
}
