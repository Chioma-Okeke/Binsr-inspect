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
import he from "he";

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
    const cleaned = phoneNumber.replace(/\D/g, "");

    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
            6
        )}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
            4,
            7
        )}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
        return phoneNumber;
    }
}

export function optimizeImageUrl(
    url: string,
    width = 800,
    quality = 80
): string {
    if (!url || typeof url !== "string") return url;

    if (url.includes("firebasestorage.googleapis.com")) {
        const hasQuery = url.includes("?");
        const separator = hasQuery ? "&" : "?";

        return `${url}${separator}width=${width}&quality=${quality}`;
    }
    return url;
}

export async function generateDynamicSections(
    sections: RootObject_Inspection_SectionsItem[],
    data: RootObject
) {
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

    Handlebars.registerHelper("toRoman", function (num) {
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

    Handlebars.registerHelper("formatCommentText", function (text) {
        if (!text) return "";
        const decoded = he.decode(text);
        return decoded;
    });

    Handlebars.registerHelper("toLetter", function (num) {
        if (typeof num !== "number" || num < 1) {
            return "A";
        }

        let result = "";
        let n = num - 1;

        do {
            result = String.fromCharCode(65 + (n % 26)) + result;
            n = Math.floor(n / 26) - 1;
        } while (n >= 0);

        return result;
    });

    Handlebars.registerHelper("indexToLetter", function (index) {
        if (typeof index !== "number" || index < 0) {
            return "A";
        }

        return String.fromCharCode(65 + index);
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const templatePath = path.join(
        process.cwd(),
        "public/templates/trec-inspection-form.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

    const optimizedSections = sections.map((section) => ({
        ...section,
        lineItems:
            section.lineItems?.map((item) => ({
                ...item,
                comments:
                    item.comments?.map((comment) => ({
                        ...comment,
                        photos:
                            comment.photos?.map((photo) => ({
                                ...photo,
                                url: optimizeImageUrl(
                                    photo.url ? photo.url : ""
                                ),
                            })) || [],
                    })) || [],
            })) || [],
    }));

    const templateData = {
        sections: optimizedSections,
        clientInfo: {
            name: data?.inspection?.clientInfo?.name || "",
        },
        schedule: {
            date: data?.inspection?.schedule
                ? formatScheduleDateTime(data.inspection.schedule)
                : "",
        },
        address: {
            fullAddress: data?.inspection?.address?.fullAddress || "",
        },
        inspector: {
            name: data?.inspection?.inspector?.name || "",
        },
    };

    const html = compiledTemplate(templateData);
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    await page.evaluate(async () => {
        const images = Array.from(document.images);
        await Promise.all(
            images.map((img) => {
                if (img.complete) return;
                return new Promise((resolve) => {
                    img.addEventListener("load", resolve);
                    img.addEventListener("error", resolve);
                });
            })
        );
    });

    const pdfBuffer = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
            top: "0.3in",
            right: "0.5in",
            bottom: "0.5in",
            left: "0.5in",
        },
    });
    await browser.close();

    const outputPath = path.join(process.cwd(), `output_pdf.pdf`);

    const buffer = Buffer.from(pdfBuffer);
    fs.writeFileSync(outputPath, buffer);

    console.log(`PDF saved to: ${outputPath}`);

    return pdfBuffer;
}

export async function generateCompleteTRECReport(data: RootObject) {
    const sections = data.inspection?.sections || [];
    const dynamicPdfBuffer = await generateDynamicSections(sections, data);

    const pdfDoc = await PDFDocument.load(dynamicPdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    pdfDoc.getPages().forEach((page, index) => {
        const pageNumber = index + 1;
        const { width } = page.getSize();

        page.drawText(`Page ${pageNumber} of ${totalPages}`, {
            x: width / 2 - 30,
            y: 30,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
    });

    const finalPdfBytes = await pdfDoc.save();
    return finalPdfBytes;
}

export async function generateModernReport(data: RootObject): Promise<Buffer> {
    Handlebars.registerHelper("toRoman", (num: number | string) => {
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

    Handlebars.registerHelper("formatPhone", function (phoneNumber: string) {
        return formatPhoneNumber(phoneNumber);
    });

    Handlebars.registerHelper("add", function (a: number, b: number) {
        return a + b;
    });

    Handlebars.registerHelper("length", function (array: unknown[]) {
        if (!array || !Array.isArray(array)) return 0;
        return array.length;
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const templatePath = path.join(
        process.cwd(),
        "public/templates/modern-inspection-report.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = Handlebars.compile(templateHtml);

    const templateData = {
        companyName: data?.account?.companyName || "Inspection Company",
        companyLogo: data?.account?.companyLogo || null,
        phoneNumber: data?.account?.phoneNumber || "",
        email: data?.account?.email || "",
        companyAddress: data?.account?.companyAddress || {},
        clientName: data?.inspection?.clientInfo?.name || "N/A",
        propertyAddress: data?.inspection?.address?.fullAddress || "N/A",
        inspectionDate: data?.inspection?.schedule
            ? formatScheduleDateTime(data.inspection.schedule)
            : "N/A",
        inspectorName: data?.inspection?.inspector?.name || "N/A",
        license:
            data?.inspection?.inspector?.licenseNumber ||
            "License Not Specified",
        sections: data?.inspection?.sections || [],
        additionalInfo: data?.inspection?.inspector?.additionalInfo || null,
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
