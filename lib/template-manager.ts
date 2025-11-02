import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

class TemplateManager {
    private static instance: TemplateManager;
    private compiledTemplates: Map<string, HandlebarsTemplateDelegate> =
        new Map();
    private helpersRegistered = false;

    private constructor() {
        this.registerHelpers();
    }

    public static getInstance(): TemplateManager {
        if (!TemplateManager.instance) {
            TemplateManager.instance = new TemplateManager();
        }
        return TemplateManager.instance;
    }

    private registerHelpers(): void {
        if (this.helpersRegistered) return;

        console.log("Registering Handlebars helpers...");

        // Equality helper
        Handlebars.registerHelper("eq", function (a, b) {
            return a === b;
        });

        // Check if line items have comments
        Handlebars.registerHelper("hasComments", function (lineItems) {
            return (
                lineItems &&
                lineItems.some(
                    (item: { comments?: unknown[] }) =>
                        item.comments && item.comments.length > 0
                )
            );
        });

        // String substring helper
        Handlebars.registerHelper(
            "substring",
            function (str: string, start: number, end?: number) {
                if (!str) return "";
                return str.substring(start, end).toUpperCase();
            }
        );

        // Add numbers
        Handlebars.registerHelper("add", function (a: number, b: number) {
            return a + b;
        });

        // Get array length
        Handlebars.registerHelper("length", function (array: unknown[]) {
            return array ? array.length : 0;
        });

        // Convert numbers to Roman numerals (kept for legacy support)
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

        // Convert array index to capital letters
        Handlebars.registerHelper("indexToLetter", (index: number) => {
            if (typeof index !== "number" || index < 0) {
                return "A";
            }
            return String.fromCharCode(65 + index);
        });

        // Format comment text with line breaks
        Handlebars.registerHelper("formatCommentText", (text: string) => {
            if (!text) return "";
            return text.replace(/\n/g, "<br>");
        });

        // Format phone numbers to US format
        Handlebars.registerHelper("formatPhone", (phoneNumber: string) => {
            if (!phoneNumber) return "";

            // Remove all non-digit characters
            const cleaned = phoneNumber.replace(/\D/g, "");

            // Handle different phone number lengths
            if (cleaned.length === 10) {
                // Standard US format: (123) 456-7890
                return `(${cleaned.slice(0, 3)}) ${cleaned.slice(
                    3,
                    6
                )}-${cleaned.slice(6)}`;
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
        });

        this.helpersRegistered = true;
        console.log("Handlebars helpers registered successfully");
    }

    public async getCompiledTemplate(
        templateName: string
    ): Promise<HandlebarsTemplateDelegate> {
        // Check if template is already compiled and cached
        if (this.compiledTemplates.has(templateName)) {
            return this.compiledTemplates.get(templateName)!;
        }

        // Load and compile template
        const templatePath = path.join(
            process.cwd(),
            "public/templates",
            `${templateName}.html`
        );

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }

        console.log(`Compiling template: ${templateName}...`);
        const templateHtml = fs.readFileSync(templatePath, "utf8");
        const compiledTemplate = Handlebars.compile(templateHtml);

        // Cache the compiled template
        this.compiledTemplates.set(templateName, compiledTemplate);
        console.log(`Template compiled and cached: ${templateName}`);

        return compiledTemplate;
    }

    public async renderTemplate(
        templateName: string,
        data: Record<string, unknown>
    ): Promise<string> {
        const compiledTemplate = await this.getCompiledTemplate(templateName);
        return compiledTemplate(data);
    }

    public clearCache(): void {
        console.log("Clearing template cache...");
        this.compiledTemplates.clear();
    }

    // Preload commonly used templates at startup
    public async preloadTemplates(): Promise<void> {
        const commonTemplates = [
            "modern-inspection-report",
            "trec-inspection-form",
        ];

        console.log("Preloading templates...");
        await Promise.all(
            commonTemplates.map((templateName) =>
                this.getCompiledTemplate(templateName).catch((error) =>
                    console.warn(
                        `Failed to preload template ${templateName}:`,
                        error.message
                    )
                )
            )
        );
        console.log("Templates preloaded successfully");
    }
}

// Global template manager instance
export const templateManager = TemplateManager.getInstance();

// Initialize function to warm up both templates and browser
export async function initializePDFGeneration(): Promise<void> {
    console.log("Initializing PDF generation system...");

    try {
        // Import browser pool here to avoid circular dependency
        const { browserPool } = await import("./browser-pool");

        // Run initialization in parallel
        await Promise.all([
            templateManager.preloadTemplates(),
            browserPool.warmUp(),
        ]);

        console.log("PDF generation system initialized successfully");
    } catch (error) {
        console.error("Failed to initialize PDF generation system:", error);
    }
}

// Auto-initialize on module load (but don't await to avoid blocking)
initializePDFGeneration();
