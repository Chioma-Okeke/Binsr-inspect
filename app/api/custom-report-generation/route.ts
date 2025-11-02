import { NextRequest, NextResponse } from "next/server";
import { generateModernReport, generateOptimizedModernReport } from "@/lib/pdf-generator";
import { RootObject } from "@/types";
import fs from "fs";
import inspectionData from "@/lib/inspection-data.json";
import path from "path";

export async function POST() {
    try {
        // Parse the JSON data from the request
        const jsonPath = path.join(
            process.cwd(),
            "lib",
            "inspection-data.json"
        );
        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

        // if (
        //     !data ||
        //     !data.inspection?.sections ||
        //     data.inspection.sections.length === 0
        // ) {
        //     console.log(
        //         "No valid sections in request data, using inspection data..."
        //     );
        //     data = inspectionData as unknown as RootObject;
        // }

        if (!data || !data.inspection) {
            return NextResponse.json(
                { error: "No inspection data found" },
                { status: 400 }
            );
        }

        // Generate the modern report PDF using the optimized function
        const pdfBuffer = await generateModernReport(data);

        const buffer = Buffer.from(pdfBuffer);

        // Return the PDF as a response
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
