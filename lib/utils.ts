import {
    RootObject,
    RootObject_Inspection_Schedule,
    RootObject_Inspection_SectionsItem,
} from "@/types";
import { clsx, type ClassValue } from "clsx";
import path from "path";
import { twMerge } from "tailwind-merge";
import fs from "fs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import puppeteer from "puppeteer";

import Handlebars from "handlebars";
import { getBrowser } from "./puppeteerClient";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatScheduleDateTime(
    schedule: RootObject_Inspection_Schedule
): string {
    const startDate = new Date(schedule?.startTime || 0);

    const month = (startDate.getMonth() + 1).toString().padStart(2, "0");
    const day = startDate.getDate().toString().padStart(2, "0");
    const year = startDate.getFullYear();

    let hours = startDate.getHours();
    const minutes = startDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month}/${day}/${year} ${hours}:${minutes}${ampm}`;
}

export function formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return "";

    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Handle different phone number lengths
    if (cleaned.length === 10) {
        // Standard US format: (123) 456-7890
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
            6
        )}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        // US format with country code: +1 (123) 456-7890
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
            4,
            7
        )}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
        // Local format: 456-7890
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
        // Return original if it doesn't match expected patterns
        return phoneNumber;
    }
}

// export async function generateStaticPart(data: RootObject) {
//     const templatePath = path.join(
//         process.cwd(),
//         "public/templates/TREC_Template_Blank.pdf"
//     );
//     const outputPath = path.join(process.cwd(), "output_pdf.pdf");
//     const templateBytes = fs.readFileSync(templatePath);
//     const pdfDoc = await PDFDocument.load(templateBytes);
//     const form = pdfDoc.getForm();
//     const additionalInformation =
//         data?.inspection?.inspector?.additionalInfo ||
//         "No additional comments were provided by the inspector.";
//     const totalPages = pdfDoc.getPageCount();

//     const possibleFields2 = Array.from({ length: 21 }, (_, i) => i);
//     possibleFields2.forEach((possibleField) => {
//         try {
//             console.log(
//                 `Trying to set Text Field: Text-field-two${possibleField}`
//             );
//             form.getTextField(`${possibleField}`).setText(
//                 `Field-two${possibleField}`
//             );
//         } catch (error) {
//             // skip if field doesn't exist
//         }
//     });

//     form.getTextField("Name of Client").setText(
//         data.inspection?.clientInfo?.name || ""
//     );
//     form.getTextField("Date of Inspection").setText(
//         data.inspection?.schedule
//             ? formatScheduleDateTime(data.inspection.schedule)
//             : ""
//     );
//     form.getTextField("Address of Inspected Property").setText(
//         data.inspection?.address?.fullAddress || ""
//     );
//     form.getTextField("Name of Inspector").setText(
//         data.inspection?.inspector?.name || ""
//     );
//     form.getTextField("TREC License").setText(
//         data.inspection?.clientInfo?.name || ""
//     );
//     form.getTextField("Name of Sponsor if applicable").setText(
//         data.inspection?.clientInfo?.name || ""
//     );
//     form.getTextField("TREC License_2").setText(
//         data.inspection?.clientInfo?.name || ""
//     );
//     form.getTextField("Text1").setText(additionalInformation);
//     form.getTextField("Page 2 of").setText(totalPages.toString());

//     const pages = pdfDoc.getPages();
//     const keepUntil = 0

//     // Save the filled PDF
//     const pdfBytes = await pdfDoc.save();
//     fs.writeFileSync(outputPath, pdfBytes);

//     return pdfBytes;
// }

export async function generateStaticPart(data: RootObject) {
    const templatePath = path.join(
        process.cwd(),
        "public/templates/TREC_Template_Blank.pdf"
    );

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    const additionalInformation =
        data?.inspection?.inspector?.additionalInfo ||
        "No additional comments were provided by the inspector.";

    form.getTextField("Name of Client").setText(
        data.inspection?.clientInfo?.name || ""
    );
    form.getTextField("Date of Inspection").setText(
        data.inspection?.schedule
            ? formatScheduleDateTime(data.inspection.schedule)
            : ""
    );
    form.getTextField("Address of Inspected Property").setText(
        data.inspection?.address?.fullAddress || ""
    );
    form.getTextField("Name of Inspector").setText(
        data.inspection?.inspector?.name || ""
    );
    form.getTextField("TREC License").setText(
        data.inspection?.clientInfo?.name || ""
    );
    form.getTextField("Name of Sponsor if applicable").setText(
        data.inspection?.clientInfo?.name || ""
    );
    form.getTextField("TREC License_2").setText(
        data.inspection?.clientInfo?.name || ""
    );
    form.getTextField("Text1").setText(additionalInformation);

    // Flatten form fields to make them non-editable
    form.flatten();

    // Remove all pages except page 0
    while (pdfDoc.getPageCount() > 1) {
        pdfDoc.removePage(pdfDoc.getPageCount() - 1);
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}

export async function generateDynamicSections(
    sections: RootObject_Inspection_SectionsItem[]
) {
    // Register Handlebars helpers
    Handlebars.registerHelper("eq", function (a, b) {
        return a === b;
    });

    Handlebars.registerHelper("hasComments", function (lineItems) {
        return (
            lineItems &&
            lineItems.some(
                (item: { comments?: unknown[] }) =>
                    item.comments && item.comments.length > 0
            )
        );
    });

    // Helper to convert numbers to Roman numerals
    Handlebars.registerHelper("toRoman", function (num) {
        // Convert string to number if needed
        const number = typeof num === "string" ? parseInt(num, 10) : num;

        if (!number || number < 1) return "I";

        const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const numerals = [
            "M",
            "CM",
            "D",
            "CD",
            "C",
            "XC",
            "L",
            "XL",
            "X",
            "IX",
            "V",
            "IV",
            "I",
        ];
        let result = "";
        let n = number;

        for (let i = 0; i < values.length; i++) {
            while (n >= values[i]) {
                result += numerals[i];
                n -= values[i];
            }
        }

        return result;
    });

    // Helper to format comment text with proper line breaks
    Handlebars.registerHelper("formatCommentText", function (text) {
        // Just return the text as-is, let CSS handle line breaks
        return text;
    });

    // Helper to convert numbers to capital letters (1->A, 2->B, etc.)
    Handlebars.registerHelper("toLetter", function (num) {
        if (typeof num !== "number" || num < 1) {
            return "A";
        }

        let result = "";
        let n = num - 1; // Convert to 0-based indexing

        do {
            result = String.fromCharCode(65 + (n % 26)) + result;
            n = Math.floor(n / 26) - 1;
        } while (n >= 0);

        return result;
    });

    // Helper to convert array index to capital letters (resets per section)
    Handlebars.registerHelper("indexToLetter", function (index) {
        if (typeof index !== "number" || index < 0) {
            return "A";
        }

        // Simple conversion: 0->A, 1->B, 2->C, etc.
        return String.fromCharCode(65 + index);
    });

    const browser = await getBrowser();
    const page = await browser.newPage();
    const templatePath = path.join(
        process.cwd(),
        "public/templates/trec-inspection-form.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

    // Pass sections as the data object for the template
    const html = compiledTemplate({ sections });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
            top: "0.5in",
            right: "0.5in",
            bottom: "0.5in",
            left: "0.5in",
        },
    });
    await browser.close();

    return pdfBuffer;
}

// New function to combine both PDFs into one
export async function generateCompleteTRECReport(data: RootObject) {
    // Generate the static part (first few pages with form fields)
    const staticPdfBytes = await generateStaticPart(data);

    // Generate the dynamic sections (inspection checklist pages)
    const sections = data.inspection?.sections || [];
    const dynamicPdfBuffer = await generateDynamicSections(sections);

    // Create a new PDF document to merge both
    const mergedPdf = await PDFDocument.create();

    // Load the static PDF and copy its pages
    const staticPdf = await PDFDocument.load(staticPdfBytes);
    const staticPages = await mergedPdf.copyPages(
        staticPdf,
        staticPdf.getPageIndices()
    );
    staticPages.forEach((page) => mergedPdf.addPage(page));

    // Load the dynamic PDF and copy its pages
    const dynamicPdf = await PDFDocument.load(dynamicPdfBuffer);
    const dynamicPages = await mergedPdf.copyPages(
        dynamicPdf,
        dynamicPdf.getPageIndices()
    );
    dynamicPages.forEach((page) => mergedPdf.addPage(page));

    // Update page numbering throughout the document
    const totalPages = mergedPdf.getPageCount();
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);

    // Add page numbers to all pages
    mergedPdf.getPages().forEach((page, index) => {
        const pageNumber = index + 1;
        const { width } = page.getSize();

        // Add page number at bottom center
        page.drawText(`Page ${pageNumber} of ${totalPages}`, {
            x: width / 2 - 30,
            y: 30,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
    });

    const finalPdfBytes = await mergedPdf.save();
    return finalPdfBytes;
}

export async function generateModernReport(data: RootObject): Promise<Buffer> {
    // Register Handlebars helpers
    Handlebars.registerHelper("toRoman", (num: number | string) => {
        // Convert string to number if needed
        const number = typeof num === "string" ? parseInt(num, 10) : num;

        if (!number || number < 1) return "I";

        const romanNumerals = [
            ["M", 1000],
            ["CM", 900],
            ["D", 500],
            ["CD", 400],
            ["C", 100],
            ["XC", 90],
            ["L", 50],
            ["XL", 40],
            ["X", 10],
            ["IX", 9],
            ["V", 5],
            ["IV", 4],
            ["I", 1],
        ] as const;

        let result = "";
        let n = number;

        for (const [roman, value] of romanNumerals) {
            while (n >= value) {
                result += roman;
                n -= value;
            }
        }
        return result;
    });

    Handlebars.registerHelper("indexToLetter", (index: number) => {
        if (typeof index !== "number" || index < 0) {
            return "A";
        }
        // Simple conversion: 0->A, 1->B, 2->C, etc.
        return String.fromCharCode(65 + index);
    });

    Handlebars.registerHelper("formatCommentText", (text: string) => {
        if (!text) return "";
        return text.replace(/\n/g, "<br>");
    });

    Handlebars.registerHelper("eq", function (a, b) {
        return a === b;
    });

    Handlebars.registerHelper("hasComments", function (lineItems) {
        return (
            lineItems &&
            lineItems.some(
                (item: { comments?: unknown[] }) =>
                    item.comments && item.comments.length > 0
            )
        );
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const templatePath = path.join(
        process.cwd(),
        "public/templates/modern-inspection-report.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

    // Prepare template data with all required fields
    const templateData = {
        companyName: data.account?.companyName || "Inspection Company",
        companyLogo: data.account?.companyLogo || null,
        phoneNumber: data.account?.phoneNumber || "",
        email: data.account?.email || "",
        companyAddress: data.account?.companyAddress || {},
        clientName: data.inspection?.clientInfo?.name || "N/A",
        propertyAddress: data.inspection?.address?.fullAddress || "N/A",
        inspectionDate: data.inspection?.schedule
            ? formatScheduleDateTime(data.inspection.schedule)
            : "N/A",
        inspectorName: data.inspection?.inspector?.name || "N/A",
        license:
            data.inspection?.inspector?.licenseNumber ||
            "License Not Specified",
        sections: data.inspection?.sections || [],
        additionalInfo: data.inspection?.inspector?.additionalInfo || null,
    };

    const html = compiledTemplate(templateData);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const generatePDFOptions = {
        format: "letter" as const,
        printBackground: true,
        margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
        },
        preferCSSPageSize: true,
    };

    const modernPdf = await page.pdf(generatePDFOptions);
    await page.close();

    return Buffer.from(modernPdf);
}
