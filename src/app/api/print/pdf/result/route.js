import axios from 'axios';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req) {
    try {
        const { searchParams } = new URL(req.url);

        const exam = searchParams.get("exam");
        const district = searchParams.get("district");
        const taluka = searchParams.get("taluka");
        const center = searchParams.get("center");
        const standard = searchParams.get("standard");

        // Make a GET request to another API
        const getResponse = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/result/uploadresult?district=${district}&taluka=${taluka}&center=${center}&exam=${exam}&cls=${standard}`);

        // Handle the GET response
        if (getResponse.status === 200) {
            const responseData = getResponse.data;
            
             let data = responseData.data; // Actual JSON data
            const columns = responseData.columns; // Columns

            
            // Check if data is an array, if not, convert it to an array
            if (!Array.isArray(data)) {
                data = [data];
            }

            // Generate HTML content for the PDF
            let html = `
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                            background-color: #ffffff;
                            color: #333;
                        }
                        h1 {
                            text-align: center;
                            color: #333;
                            font-size: 28px;
                            margin-bottom: 20px;
                            border-bottom: 3px solid #333;
                            padding-bottom: 10px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 30px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        th, td {
                            padding: 12px;
                            text-align: left;
                            border: 1px solid #333;
                        }
                        th {
                            background-color: #f4f4f4;
                            color: #000;
                            font-weight: bold;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        tr:hover {
                            background-color: #eaeaea;
                        }
                        @media print {
                            body {
                                margin: 0;
                            }
                            h1 {
                                font-size: 24px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Student Data for Exam: ${exam}, Center: ${center}</h1>
                    <table>
                        <thead>
                            <tr>`;
            
            // Dynamically create table headers based on columns
            columns.forEach(column => {
                html += `<th>${column}</th>`;
            });

            html += `</tr>
                        </thead>
                        <tbody>`;
        
            data.forEach(item => {
                html += `<tr>`;
                // columns.forEach(column => {
                html += `
                    <td>${item.SrNo || '-'}</td>
                    <td>${item.RollNo || '-'}</td>
                    <td>${item.StudentName || '-'}</td>
                    <td>${item.Standard || '-'}</td>
                    <td>${item.Medium || '-'}</td>
                    <td>${item.school || '-'}</td>
                    <td>${item.Paper1 || '-'}</td>
                 ${item.Paper2 ? `<td>${item.Paper2 || '-'}</td><td>${item.total || '-'}</td>` : `<td>${item.total || '-'}</td>`}</tr>`;
          
                html += `</tr>`;
            });
        
            html += `
                        </tbody>
                    </table>
                </body>
            </html>`;

            // Launch puppeteer and create a PDF
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html);
            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: true,
                margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
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
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch data from the GET API',
            }, { status: getResponse.status });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'An error occurred while processing your request',
            error: error.message,
        }, { status: 500 });
    }
}
