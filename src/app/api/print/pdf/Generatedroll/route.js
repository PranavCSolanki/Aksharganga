import mongoose from 'mongoose';
import { Mongouri } from '@/lib/db';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';

export async function GET(req) {
    const { searchParams } = req.nextUrl;
    const exam = searchParams.get("exam");
    const center = searchParams.get("center");

    if (!exam || !center) {
        return NextResponse.json({ error: 'Parameters "exam" and "center" are required' });
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(Mongouri);

        // Fetch students data based on exam and center
        const data = await GeneratedRollModel.find({ exam: exam, center: center });

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' });
        }

        // Generate HTML content
        let html = `
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                            background-color: #ffffff; /* White background */
                            color: #333; /* Black text color */
                        }
                        h1 {
                            text-align: center;
                            color: #333;
                            font-size: 28px; /* Increased font size */
                            margin-bottom: 20px;
                            border-bottom: 3px solid #333;
                            padding-bottom: 10px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 30px; /* Add margin to prevent top border cut-off */
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        th, td {
                            padding: 12px;
                            text-align: left;
                            border: 1px solid #333; /* Solid border */
                        }
                        th {
                            background-color: #f4f4f4; /* Light grey for headers */
                            color: #000; /* Black text for headers */
                            font-weight: bold;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9; /* Light alternating row color */
                        }
                        tr:hover {
                            background-color: #eaeaea; /* Highlight on hover */
                        }
                        @media print {
                            body {
                                margin: 0;
                            }
                            h1 {
                                font-size: 24px; /* Adjusted size for print */
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Student Data for Exam: ${exam}, Center: ${center}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Sr. No.</th>
                                <th>Roll Number</th>
                                <th>Student Name</th>
                                <th>Gender</th>
                                <th>Class</th>
                                <th>Medium</th>
                                <th>School</th>
                                <th>Center</th>
                                <th>Taluka</th>
                                <th>District</th>
                                <th>Mobile No</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        let srno = 1;
        data.forEach(item => {
            html += `
                <tr>
                    <td>${srno++}</td>
                    <td>${item.rollNo || '-'}</td>
                    <td>${item.studName || '-'}</td>
                    <td>${item.gender || '-'}</td>
                    <td>${item.Class || '-'}</td>
                    <td>${item.medium || '-'}</td>
                    <td>${item.school || '-'}</td>
                    <td>${item.center || '-'}</td>
                    <td>${item.taluka || '-'}</td>
                    <td>${item.district || '-'}</td>
                    <td>${item.mobile || '-'}</td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        // Launch puppeteer and create a PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            landscape: true, // Set to landscape orientation
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } // Set margins
        });
        await browser.close();

        // Return PDF as response
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${center}_${exam}.pdf"`,
                'Content-Type': 'application/pdf',
                'Content-Length': pdfBuffer.length,
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json({ error: 'Internal Server Error' });
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
    }
}
