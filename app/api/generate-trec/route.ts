import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
    generateDynamicSections,
} from "@/lib/utils";

export async function POST() {
    try {
        const jsonPath = path.join(
            process.cwd(),
            "lib",
            "inspection-data.json"
        );
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

        const sections = data.inspection?.sections || [];
        const finalPdfBytes = await generateDynamicSections(sections, data);

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
