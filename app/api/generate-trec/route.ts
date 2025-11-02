import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { generateTrecReport, mergePdfParts } from "@/lib/pdf/trecGenerator";
import { generateDynamicSections, generateStaticPart } from "@/lib/utils";

export async function POST() {
    try {
        const jsonPath = path.join(
            process.cwd(),
            "lib",
            "inspection-data.json"
        );
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

        // 1️⃣ Generate the static part (PDF form fields)
        const staticBytes = await generateStaticPart(data);

        // 2️⃣ Generate the dynamic sections (HTML to PDF)
        const sections = data.inspection?.sections || [];
        const dynamicBytes = await generateDynamicSections(sections);

        // 3️⃣ Merge both PDFs using your existing function
        const finalPdfBytes = await mergePdfParts(staticBytes, dynamicBytes);

        // 4️⃣ Convert the Uint8Array to a Node.js buffer for response
        const buffer = Buffer.from(finalPdfBytes);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=trec_report.pdf",
            },
        });
    } catch (err: unknown) {
        console.error("Error generating TREC data:", err);
        return NextResponse.json(
            { error: "Failed to generate TREC data" },
            { status: 500 }
        );
    }
}
