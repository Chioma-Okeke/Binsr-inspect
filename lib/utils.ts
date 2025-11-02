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

    // Fill out the form fields
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
        data.inspection?.inspector?.licenseNumber || ""
    );
    form.getTextField("Name of Sponsor if applicable").setText(
        data.inspection?.inspector?.sponsor || "N/A"
    );
    form.getTextField("TREC License_2").setText(
        data.inspection?.inspector?.sponsorLicense || ""
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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const templatePath = path.join(
        process.cwd(),
        "public/templates/trec-inspection-form.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

    const html = compiledTemplate(sections);
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
