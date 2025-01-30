import mongoose from 'mongoose';
import { Mongouri } from '@/lib/db';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import GeneratedRollModel from '@/lib/Models/Registration/RollNo/GeneratedModel';

export async function POST(req) {
    try {
        const { exam, district, taluka, center } = await req.json();

        if (!exam || !center || !district || !taluka) {
            return NextResponse.json({ error: 'Parameters are required' });
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(Mongouri, { useNewUrlParser: true, useUnifiedTopology: true });
        }

        const data = await GeneratedRollModel.find({ exam, center, district, taluka }).lean();

        if (data.length === 0) {
            return NextResponse.json({ error: 'No data found' });
        }

        // Generate HTML for the stickers
        const rows = data.map(item => `
            <div class="sticker">
                <div class="title">Roll No: ${item.rollNo}</div>
                <div class="row">
                    <span class="label">Student Name:</span>
                    <span class="value">${item.studName}</span>
                </div>
                <div class="row">
                    <span class="label">Standard:</span>
                    <span class="value">${item.Class}</span>
                </div>
                <div class="row">
                    <span class="label">Medium:</span>
                    <span class="value">${item.medium}</span>
                </div>
                <div class="row">
                    <span class="label">Center Name:</span>
                    <span class="value">${item.center}</span>
                </div>
                <div class="row">
                    <span class="label">District:</span>
                    <span class="value">${item.district}</span>
                </div>
                <div class="row">
                    <span class="label">Taluka:</span>
                    <span class="value">${item.taluka}</span>
                </div>
            </div>`
        ).join('');

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exam Stickers</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9fafc;
            margin: 0;
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);  /* Adjusting to two per row to fit better */
            grid-auto-rows: minmax(180px, auto);
            gap: 20px;
        }

        .sticker {
            padding: 15px;
            background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: left;
            font-size: 12px;
            line-height: 1.6;
            transition: transform 0.2s;
            page-break-inside: avoid;  /* Prevents stickers from breaking in the middle */
        }

        .sticker:hover {
            transform: scale(1.05);
        }

        .sticker .title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
            color: #2c3e50;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
        }

        .sticker .row {
            margin-bottom: 5px;
        }

        .sticker .label {
            display: inline-block;
            width: 120px;
            font-weight: bold;
            color: #555;
        }

        .sticker .value {
            display: inline-block;
            color: #333;
        }

        @page {
            margin: 20px;
            size: A4;
            padding: 0;
        }

        @media print {
            body {
                grid-template-columns: repeat(2, 1fr); /* Keeps the layout consistent when printing */
            }
        }
    </style>
</head>
<body>
    ${rows}
</body>
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
