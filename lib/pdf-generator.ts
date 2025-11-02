import { RootObject } from "@/types";
import { browserPool } from "./browser-pool";
import { templateManager } from "./template-manager";
import { formatScheduleDateTime, formatPhoneNumber } from "./utils";
import puppeteer from "puppeteer";
import path from "path/win32";
import fs from "fs";
import Handlebars from "handlebars";

export async function generateOptimizedModernReport(
    data: RootObject
): Promise<Buffer> {
    const startTime = Date.now();
    console.log("Starting optimized PDF generation...");

    try {
        // Filter sections to only include those with comments for better performance
        const filteredSections = (data.inspection?.sections || []).filter(
            (section) => {
                return section.lineItems?.some(
                    (lineItem) =>
                        lineItem.comments && lineItem.comments.length > 0
                );
            }
        );

        console.log(
            `Filtered ${filteredSections.length} sections with comments from ${
                data.inspection?.sections?.length || 0
            } total sections`
        );

        // Prepare template data
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
            sections: filteredSections, // Use filtered sections instead of all sections
            additionalInfo: data.inspection?.inspector?.additionalInfo || null,
        };

        console.log(`Template data prepared in ${Date.now() - startTime}ms`);

        // Render HTML using cached template
        const renderStart = Date.now();
        const html = await templateManager.renderTemplate(
            "modern-inspection-report",
            templateData
        );
        console.log(`Template rendered in ${Date.now() - renderStart}ms`);

        // Get page from browser pool
        const pageStart = Date.now();
        const page = await browserPool.getPage();
        console.log(`Page acquired in ${Date.now() - pageStart}ms`);

        try {
            // Set content with optimized wait conditions
            const contentStart = Date.now();
            await page.setContent(html, {
                waitUntil: "domcontentloaded", // Much faster than 'networkidle0'
                timeout: 15000,
            });
            console.log(`Content set in ${Date.now() - contentStart}ms`);

            // Generate PDF with optimized settings
            const pdfStart = Date.now();
            const pdfBuffer = await page.pdf({
                format: "letter",
                printBackground: true,
                margin: {
                    top: "20px",
                    right: "20px",
                    bottom: "20px",
                    left: "20px",
                },
                preferCSSPageSize: true,
                timeout: 30000, // 30 second timeout for PDF generation
            });
            console.log(`PDF generated in ${Date.now() - pdfStart}ms`);

            return Buffer.from(pdfBuffer);
        } finally {
            // Release page back to pool
            await browserPool.releasePage(page);
        }
    } finally {
        console.log(`Total PDF generation time: ${Date.now() - startTime}ms`);
    }
}

export async function generateModernReport(data: RootObject) {
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

    Handlebars.registerHelper("formatCommentText", function (text) {
        // Just return the text as-is, let CSS handle line breaks
        return text;
    });

    Handlebars.registerHelper("formatPhone", function (phoneNumber) {
        return formatPhoneNumber(phoneNumber);
    });

    const filteredSections = (data.inspection?.sections || []).filter(
        (section) => {
            return section.lineItems?.some(
                (lineItem) => lineItem.comments && lineItem.comments.length > 0
            );
        }
    );

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const templatePath = path.join(
        process.cwd(),
        "public/templates/modern-inspection-report.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

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
        headerImage: data.inspection?.headerImageUrl || null,
        license:
            data.inspection?.inspector?.licenseNumber ||
            "License Not Specified",
        sections: filteredSections, // Use filtered sections instead of all sections
        additionalInfo: data.inspection?.inspector?.additionalInfo || null,
        agents: data.inspection?.agents || [], // Add agents data for primary agent card
    };

    // Pass sections as the data object for the template
    const html = compiledTemplate(templateData);
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
        },
    });
    await browser.close();

    // Save the PDF to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = path.join(
        process.cwd(),
        `modern-inspection-report-${timestamp}.pdf`
    );

    const buffer = Buffer.from(pdfBuffer);
    fs.writeFileSync(outputPath, buffer);

    console.log(`PDF saved to: ${outputPath}`);

    return pdfBuffer;
}
