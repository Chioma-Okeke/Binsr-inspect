import { NextRequest, NextResponse } from "next/server";
import { generateOptimizedModernReport } from "@/lib/pdf-generator";
import { RootObject } from "@/types";
import inspectionData from "@/lib/inspection-data.json";

export async function POST(request: NextRequest) {
    try {
        // Parse the JSON data from the request
        const requestData = await request.json();
        console.log(
            "Request data received:",
            JSON.stringify(requestData, null, 2)
        );

        // Use either the request data or the inspection data
        let data: RootObject = requestData;

        if (
            !data ||
            !data.inspection?.sections ||
            data.inspection.sections.length === 0
        ) {
            console.log(
                "No valid sections in request data, using inspection data..."
            );
            data = inspectionData as unknown as RootObject;
        }

        if (!data || !data.inspection) {
            return NextResponse.json(
                { error: "No inspection data found" },
                { status: 400 }
            );
        }

        // Generate the modern report PDF using the optimized function
        const pdfBuffer = await generateOptimizedModernReport(data);

        // Return the PDF as a response
        return new NextResponse(new Uint8Array(pdfBuffer), {
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
