import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { RootObject } from "@/types";
import { formatScheduleDateTime } from "../utils";
import Handlebars from "handlebars";
import puppeteer from "puppeteer";

export async function generateTrecReport(data: RootObject) {
    const templatePath = path.join(
        process.cwd(),
        "public/templates/trec-report.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

    const sections = data?.inspection?.sections?.map((section) => ({
        ...section,
        hasComments: section.lineItems?.some((li) => li.comments?.length),
    }));

    const html = compiledTemplate({
        clientName: data?.inspection?.clientInfo?.name,
        inspectionDate: data?.inspection?.schedule
            ? formatScheduleDateTime(data?.inspection?.schedule)
            : "",
        propertyAddress: data?.inspection?.address?.fullAddress,
        inspectorName: data?.inspection?.inspector?.name,
        license: data?.inspection?.inspector?.licenseNumber,
        sections,
        additionalInfo:
            data?.inspection?.inspector?.additionalInfo ||
            "No additional comments were provided.",
    });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfPath = path.join(process.cwd(), "output_trec_report.pdf");
    await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
    });

    await browser.close();
    console.log("✅ PDF Generated:", pdfPath);
    return pdfPath;
}

export async function mergePdfParts(
    staticBytes: Uint8Array | ArrayBuffer,
    dynamicBytes: Uint8Array | ArrayBuffer
): Promise<Uint8Array> {
    const mainDoc = await PDFDocument.load(staticBytes);
    const dynamicDoc = await PDFDocument.load(dynamicBytes);

    // Copy dynamic pages to main document
    const dynamicPages = await mainDoc.copyPages(
        dynamicDoc,
        dynamicDoc.getPageIndices()
    );
    dynamicPages.forEach((page) => mainDoc.addPage(page));

    // Add proper page numbering (skip first page)
    const totalPages = mainDoc.getPageCount();
    const font = await mainDoc.embedFont(StandardFonts.Helvetica);
    const timesFont = await mainDoc.embedFont(StandardFonts.TimesRoman);

    mainDoc.getPages().forEach((page, index) => {
        // Skip page numbering on the first page (index 0)
        if (index === 0) return;

        const pageNumber = index + 1;
        const { width } = page.getSize();

        // Add page number at bottom center
        page.drawText(`Page ${pageNumber} of ${totalPages}`, {
            x: width / 2 - 30,
            y: 25,
            size: 9,
            font,
            color: rgb(0, 0, 0),
        });

        // Add TREC footer text using full page width
        const leftMargin = 50;
        const rightMargin = 50;

        // Left side - REI number (far left)
        page.drawText("REI 7-6 (8/9/21)", {
            x: leftMargin,
            y: 10,
            size: 10,
            font: timesFont,
            color: rgb(0, 0, 0),
        });

        // Right side text - calculate width to position at far right
        const rightText =
            "Promulgated by the Texas Real Estate Commission • (512) 936-3000 • www.trec.texas.gov";
        const rightTextWidth = timesFont.widthOfTextAtSize(rightText, 10);
        const rightTextX = width - rightMargin - rightTextWidth;

        // Commission info and website (far right)
        page.drawText(
            "Promulgated by the Texas Real Estate Commission • (512) 936-3000 • ",
            {
                x: rightTextX,
                y: 10,
                size: 10,
                font: timesFont,
                color: rgb(0, 0, 0),
            }
        );

        // Calculate exact position for the website link
        const commissionText =
            "Promulgated by the Texas Real Estate Commission • (512) 936-3000 • ";
        const commissionTextWidth = timesFont.widthOfTextAtSize(
            commissionText,
            10
        );
        const linkX = rightTextX + commissionTextWidth;

        // Website link (clickable, continues from commission text)
        page.drawText("www.trec.texas.gov", {
            x: linkX,
            y: 10,
            size: 10,
            font: timesFont,
            color: rgb(0, 0, 1), // Blue color for links
        });

        // Add clickable link annotation
        const linkWidth = timesFont.widthOfTextAtSize("www.trec.texas.gov", 10);
        page.node.addAnnot(
            mainDoc.context.register(
                mainDoc.context.obj({
                    Type: "Annot",
                    Subtype: "Link",
                    Rect: [linkX, 25, linkX + linkWidth, 35],
                    A: {
                        Type: "Action",
                        S: "URI",
                        URI: mainDoc.context.obj("https://www.trec.texas.gov"),
                    },
                    Border: [0, 0, 0],
                })
            )
        );
    });

    const finalPdfBytes = await mainDoc.save();

    // Save to file for debugging/storage
    const outputPath = path.join(process.cwd(), "merged_trec_report.pdf");
    fs.writeFileSync(outputPath, finalPdfBytes);
    console.log("✅ Merged PDF saved to:", outputPath);

    // Return bytes for API response
    return finalPdfBytes;
}
