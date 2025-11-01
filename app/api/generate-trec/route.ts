import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { generateTrecReport } from "@/lib/pdf/trecGenerator";


export async function POST() {
    try {
        const jsonPath = path.join(process.cwd(), 'lib', 'inspection-data.json');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        const outputPath = await generateTrecReport(data);
        const pdfBuffer = fs.readFileSync(outputPath)

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=trec_report.pdf",
            }
        })
    } catch (err: unknown) {
        console.error('Error generating TREC data:', err);
        return NextResponse.json({ error: 'Failed to generate TREC data' }, { status: 500 });
    }
}