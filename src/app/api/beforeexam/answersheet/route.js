import mongoose from 'mongoose';
import { Mongouri } from '@/lib/db';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import bwipjs from 'bwip-js';
import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';

export async function POST(req) {
    try {
        const { exam, center, sortOrder } = await req.json();
        const order = sortOrder === 'descending' ? -1 : 1; // Default to ascending

        if (!exam || !center) {
            return NextResponse.json({ error: 'Parameters "exam" and "center" are required' });
        }

        // Connect to MongoDB
        await mongoose.connect(Mongouri);

        // Fetch students data based on exam and center with sorting
        const data = await GeneratedRollModel.find({ exam: exam, center: center }).sort({ rollNo: order });

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
                        
                        }
                        .student-card {
                            padding: 20px;
                            margin: 20px auto;
                            width: 85%;
                            page-break-after: always;
                            }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                        }
                        .header-left, .header-right {
                            font-size: 13px;
                            line-height: 1.6;
                        }
                        .header-left {
                            max-width: 60%;
                        }
                        .header-right {
                            text-align: right;
                            max-width: 40%;
                        }
                        .barcode {
                            display: block;
                            margin: 15px auto;
                            width: 100%;
                            max-width: 220px;
                        }
                        .details {
                            font-size: 13px;
                            line-height: 1.6;
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                        }
                        .details p {
                            margin: 5px 0;
                        }
                        .title {
                            text-align: center;
                            font-size: 16px;
                            font-weight: bold;
                            margin-bottom: 15px;
                            text-transform: uppercase;
                        }
                        .highlight {
                            font-weight: bold;
                            color: #343a40;
                        }
                    </style>
                </head>
                <body>
`;

        for (const item of data) {
            // Ensure roll number is a string
            const rollNoString = String(item.rollNo);

            // Generate barcode for the roll number
            const barcodeBuffer = await bwipjs.toBuffer({
                bcid: 'code128',       // Barcode type
                text: rollNoString,    // Text to encode
                scale: 2,              // 2x scaling factor for compact size
                height: 8,             // Bar height, in millimeters
                includetext: true,     // Show human-readable text
                textxalign: 'center',  // Always good to set this
            });

            const barcodeBase64 = barcodeBuffer.toString('base64');

            html += `
                <div class="student-card">
                    <div class="title">${exam}</div>
                    <div class="header">
                        <div class="header-left">
                            <p><span class="highlight">Name:</span> ${item.studName || '-'}</p>
                            <p><span class="highlight">Standard:</span> ${item.Class || '-'}</p>
                            <p><span class="highlight">Medium:</span> ${item.medium || '-'}</p>
                            <p><span class="highlight">Roll No:</span> ${item.rollNo || '-'}</p>
                        </div>
                        <div class="header-right">
                            <p> ${item.school || '-'}</p>
                            <p> ${item.center || '-'}</p>
                        </div>
                    </div>
                    <div>
                        <img class="barcode" src="data:image/png;base64,${barcodeBase64}" alt="Barcode for ${item.rollNo}" />
                    </div>
                </div>`;
        }

        html += `
                </body>
            </html>`;

        // Launch puppeteer and create a PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ 
            format: 'A4',
            landscape: false, // Portrait mode for single student per page
            margin: { top: '15px', bottom: '15px', left: '15px', right: '15px' }
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
        return NextResponse.json({ error: 'Internal Server Error' });
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
    }
}
