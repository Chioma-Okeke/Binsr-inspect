import { RootObject } from '@/types';
import { browserPool } from './browser-pool';
import { templateManager } from './template-manager';
import { formatScheduleDateTime } from './utils';

export async function generateOptimizedModernReport(data: RootObject): Promise<Buffer> {
    const startTime = Date.now();
    console.log('Starting optimized PDF generation...');

    try {
        // Filter sections to only include those with comments for better performance
        const filteredSections = (data.inspection?.sections || []).filter(section => {
            return section.lineItems?.some(lineItem => 
                lineItem.comments && lineItem.comments.length > 0
            );
        });

        console.log(`Filtered ${filteredSections.length} sections with comments from ${data.inspection?.sections?.length || 0} total sections`);

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
            license: data.inspection?.inspector?.licenseNumber || "License Not Specified",
            sections: filteredSections, // Use filtered sections instead of all sections
            additionalInfo: data.inspection?.inspector?.additionalInfo || null,
        };

        console.log(`Template data prepared in ${Date.now() - startTime}ms`);

        // Render HTML using cached template
        const renderStart = Date.now();
        const html = await templateManager.renderTemplate('modern-inspection-report', templateData);
        console.log(`Template rendered in ${Date.now() - renderStart}ms`);

        // Get page from browser pool
        const pageStart = Date.now();
        const page = await browserPool.getPage();
        console.log(`Page acquired in ${Date.now() - pageStart}ms`);

        try {
            // Set content with optimized wait conditions
            const contentStart = Date.now();
            await page.setContent(html, { 
                waitUntil: 'domcontentloaded', // Much faster than 'networkidle0'
                timeout: 15000
            });
            console.log(`Content set in ${Date.now() - contentStart}ms`);

            // Generate PDF with optimized settings
            const pdfStart = Date.now();
            const pdfBuffer = await page.pdf({
                format: 'letter',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in',
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