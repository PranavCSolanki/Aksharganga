import mongoose from 'mongoose';
import { Mongouri } from '@/lib/db';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import ExamModel from '@/lib/Models/Exam/ExamModel';
import publishModel from '@/lib/Models/Result/PublishedResult';

export async function POST(req) {
    try {
        const { exam, district, taluka, center } = await req.json();

        if (!exam || !center || !district || !taluka) {
            return NextResponse.json({ error: 'Parameters are required' });
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(Mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
        }

        const data = await publishModel.find({ exam, center, district, taluka }).sort({ rollNo: 1 }).lean();

        const examData = await ExamModel.findOne({ name: exam }).lean();
        const Examdate = examData.date;

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' });
        }

        // Generate HTML for the tickets
        const rows = data.map(item => `
            <div class="page">
                <div class="ticket">
                    <div class="header">
                        <h1>${exam}</h1>
                        <p>Center: ${item.center}</p>
                    </div>
                    <div class="details">
                        <div class="info">
                            <strong>Roll No:</strong> ${item.rollNo}<br>
                            <strong>Class:</strong> ${item.Class}<br>
                            <strong>Gender:</strong> ${item.gender}<br>
                            <strong>Exam Date:</strong> ${Examdate}<br>
                            </div>
                            <div class="info">
                            <strong>Name:</strong> ${item.studName}<br>
                            <strong>Medium:</strong> ${item.medium}<br>
                            <strong>School:</strong> ${item.school}<br>
                        </div>
                    </div>
                    <div class="footer">
                        <img src="signature.png" alt="Signature" width="50">
                        <p>Authorized Signature</p>
                    </div>
                </div>
            </div>
        `).join('');

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exam Tickets</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f7f9fc;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .page {
                    page-break-after: always;
                }
                .ticket {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #ddd;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h1 {
                    font-size: 24px;
                    color: #4a90e2;
                    margin: 0;
                }
                .header p {
                    font-size: 16px;
                    color: #555;
                    margin: 5px 0 0;
                }
                .details {
                    display: flex;
                    justify-content: space-between;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                .info {
                    width: 45%;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .footer {
                    text-align: right;
                    margin-top: 20px;
                }
                .footer img {
                    align-self: flex-end;
                    text-align: right;
                    margin-bottom: 5px;
                }
                .footer p {
                    font-size: 14px;
                    color: #555;
                }
            </style>
        </head>
        <body>${rows}</body>
        </html>`;

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        await page.emulateMediaType('screen');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
        });

        await browser.close();

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${center}_${exam}.pdf"`,
                'Content-Type': 'application/pdf',
            },
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' });
    }
}







// ---------------------------------------------------------------------------
// this is importanat dont erres it 
// ---------------------------------------------------------------------------







// import mongoose from 'mongoose';
// import { Mongouri } from '@/lib/db';
// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer';
// import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';

// export async function POST(req) {
//     try {
//         const { exam, center, sortOrder } = await req.json();
//         const order = sortOrder === 'descending' ? -1 : 1; // Default to ascending

//         if (!exam || !center) {
//             return NextResponse.json({ error: 'Parameters "exam" and "center" are required' });
//         }

//         // Connect to MongoDB
//         await mongoose.connect(Mongouri);

//         // Fetch students data based on exam and center with sorting
//         const data = await GeneratedRollModel.find({ exam: exam, center: center }).sort({ rollNo: order });

//         if (data.length === 0) {
//             return NextResponse.json({ error: 'No data found' });
//         }

//         // Generate HTML content
//         let html = `
//             <html>
//                 <head>
//                     <style>
//                         body {
//                             margin: 0;
//                             padding: 20px;
//                             font-family: Arial, sans-serif;
//                             background-color: #ffffff;
//                             color: #333;
//                         }
//                         .student-card {
//                             border: 1px solid #333;
//                             padding: 15px;
//                             margin-bottom: 20px;
//                             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//                         }
//                         .student-card h2 {
//                             margin: 0 0 10px 0;
//                             font-size: 24px;
//                             color: #333;
//                         }
//                         .student-card p {
//                             margin: 5px 0;
//                             font-size: 16px;
//                         }
//                     </style>
//                 </head>
//                 <body>`;

//         data.forEach(item => {
//             html += `
//                 <div class="student-card">
//                     <h2>${item.studName || '-'}</h2>
//                     <p>Roll Number: ${item.rollNo || '-'}</p>
//                     <p>Class: ${item.Class || '-'}</p>
//                     <p>Medium: ${item.medium || '-'}</p>
//                     <p>School: ${item.school || '-'}</p>
//                     <p>Center: ${item.center || '-'}</p>
//                     <p>Exam: ${exam}</p>
//                 </div>`;
//         });

//         html += `
//                 </body>
//             </html>`;

//         // Launch puppeteer and create a PDF
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(html);
//         const pdfBuffer = await page.pdf({ 
//             format: 'A4',
//             landscape: true,
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });
//         await browser.close();

//         // Return PDF as response
//         return new NextResponse(pdfBuffer, {
//             headers: {
//                 'Content-Disposition': `attachment; filename="${center}_${exam}.pdf"`,
//                 'Content-Type': 'application/pdf',
//                 'Content-Length': pdfBuffer.length,
//             },
//         });

//     } catch (error) {
//         return NextResponse.json({ error: 'Internal Server Error' });
//     } finally {
//         // Disconnect from MongoDB
//         await mongoose.disconnect();
//     }
// }
