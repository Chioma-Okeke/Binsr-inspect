import { RootObject } from "@/types";
import { formatScheduleDateTime, formatPhoneNumber } from "./utils";
import puppeteer from "puppeteer";
import path from "path/win32";
import fs from "fs";
import Handlebars from "handlebars";

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
        return text;
    });

    Handlebars.registerHelper("formatPhone", function (phoneNumber) {
        return formatPhoneNumber(phoneNumber);
    });

    Handlebars.registerHelper(
        "substring",
        function (str: string, start: number, end?: number) {
            if (!str) return "";
            if (end !== undefined) {
                return str.substring(start, end);
            }
            return str.substring(start);
        }
    );

    Handlebars.registerHelper("add", function (a: number, b: number) {
        return a + b;
    });

    Handlebars.registerHelper("length", function (array: unknown[]) {
        if (!array || !Array.isArray(array)) return 0;
        return array.length;
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
        sections: filteredSections,
        additionalInfo: data.inspection?.inspector?.additionalInfo || null,
        agents: data.inspection?.agents || [],
    };

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

    const outputPath = path.join(process.cwd(), `bonus_pdf.pdf`);

    const buffer = Buffer.from(pdfBuffer);
    fs.writeFileSync(outputPath, buffer);

    console.log(`PDF saved to: ${outputPath}`);

    return pdfBuffer;
}
