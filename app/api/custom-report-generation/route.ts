import { NextResponse } from "next/server";
import { generateModernReport } from "@/lib/pdf-generator";
import fs from "fs";
import path from "path";

export async function POST() {
    try {
        const jsonPath = path.join(
            process.cwd(),
            "lib",
            "inspection-data.json"
        );
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

        if (!data || !data.inspection) {
            return NextResponse.json(
                { error: "No inspection data found" },
                { status: 400 }
            );
        }

        const pdfBuffer = await generateModernReport(data);

        const buffer = Buffer.from(pdfBuffer);

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    "attachment; filename=modern-inspection-report.pdf",
            },
        });
    } catch (error) {
        console.error("Error generating modern inspection report:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF report" },
            { status: 500 }
        );
    }
}
